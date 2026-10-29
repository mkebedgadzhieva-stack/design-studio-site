"""Анимация сцен A (загрузчик на спине) и B (прогулка) — MOTION-01.

Считается в Python (FK/IK по rig_kin), запекается в CSS @keyframes
(build_rig.bake_css). Тайминги и порядок событий — docs/motion/STORYBOARD.md.

Координаты — пиксели референса; L = 795 px (нос — корень хвоста).
CSS-угол: «+» = по часовой стрелке (экранная система, y вниз).
"""

import math
import sys

import numpy as np

kin = sys.modules.get("rig_kin")

L = 795.0
FPS = 60
GROUND = 735.0          # уровень подушечек в позе референса
C_PIVOT = (960.0, 440.0)  # центр корпуса (талия) — точка разворота половин

# --------------------------------------------------------------------------
# Анатомические точки (координаты покоя), снятые по референсу
# --------------------------------------------------------------------------
# Цепочки: корень (вращается), средний сустав, конечный сустав (к стопе),
# toe/heel — передний и задний край подушечки (на земле в позе покоя).
LEGS = {
    "bl": dict(thigh="leg-bl-upper", a="leg-bl-lower", b="leg-bl-hock", paw="leg-bl-paw",
               hip=(645, 470), p0=(596, 578), p1=(490, 592), p2=(474, 690),
               toe=(516, 731), heel=(440, 729), flat=0.0, phase=0.00, hind=True),
    "br": dict(thigh="leg-br-upper", a="leg-br-lower", b="leg-br-hock", paw="leg-br-paw",
               hip=(735, 440), p0=(812, 540), p1=(785, 640), p2=(850, 706),
               toe=(922, 735), heel=(846, 734), flat=0.0, phase=0.50, hind=True),
    "fl": dict(thigh=None, a="leg-fl-upper", b="leg-fl-lower", paw="leg-fl-paw",
               hip=(1128, 440), p0=(1128, 440), p1=(1118, 600), p2=(1118, 676),
               toe=(1178, 732), heel=(1088, 730), flat=0.0, phase=0.25, hind=False),
    "fr": dict(thigh=None, a="leg-fr-upper", b="leg-fr-lower", paw="leg-fr-paw",
               hip=(1268, 450), p0=(1268, 450), p1=(1262, 575), p2=(1428, 640),
               toe=(1514, 676), heel=(1440, 668), flat=0.0, phase=0.75, hind=False),
}
# Телескоп: сдвиг кисти вдоль предплечья/плюсны (доля длины второй кости) и
# сдвиг всей дальней передней лапы вдоль плеча (верх спрятан за корпусом).
TELE = {"bl": (-0.22, 0.10, 0, 0), "br": (-0.22, 0.10, 0, 0),
        "fl": (-0.15, 0.0, -0.05, 0.25), "fr": (-0.28, 0.06, 0, 0)}
THIGH_SHARE = {"bl": 0.18, "br": 0.45}
NAT_BEND = {"bl": 40.0, "br": 40.0, "fl": 10.0, "fr": 28.0}


def _ang(v):
    return math.degrees(math.atan2(v[1], v[0]))


def _wrap(a):
    return (a + 180.0) % 360.0 - 180.0


def ease_io(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def bezier(p1x, p1y, p2x, p2y):
    """CSS cubic-bezier как функция f(x)."""
    def f(x):
        x = min(max(x, 0.0), 1.0)
        lo, hi = 0.0, 1.0
        for _ in range(40):
            t = (lo + hi) / 2
            bx = 3 * (1 - t) ** 2 * t * p1x + 3 * (1 - t) * t * t * p2x + t ** 3
            if bx < x:
                lo = t
            else:
                hi = t
        t = (lo + hi) / 2
        return 3 * (1 - t) ** 2 * t * p1y + 3 * (1 - t) * t * t * p2y + t ** 3
    return f


EASE_KIN = bezier(.33, 0, .67, 1)
EASE_STD = bezier(.4, 0, .2, 1)


class Ctx:
    """Поза + риг: удобные операции над мировыми матрицами."""

    def __init__(self, rig, scene=None):
        self.rig = rig
        self.pose = kin.Pose()
        self.scene = np.eye(3) if scene is None else scene

    def W(self, pid):
        return self.rig.world(pid, self.pose, self.scene)

    def PW(self, pid):
        return self.rig.parent_world(pid, self.pose, self.scene)

    def to_parent(self, pid, pt):
        return kin.apply(np.linalg.inv(self.PW(pid)), pt)

    def set_world(self, pid, Mw):
        """Задать мировую матрицу части → локальные r/tx/ty/sx/sy."""
        Ml = np.linalg.inv(self.PW(pid)) @ Mw
        A = Ml[:2, :2]
        sx = math.hypot(A[0, 0], A[1, 0])
        r = math.degrees(math.atan2(A[1, 0], A[0, 0]))
        sy = np.linalg.det(A) / sx
        p = np.array(self.rig.defs[pid]["pivot"], dtype=float)
        t = Ml[:2, 2] - p + A @ p
        self.pose.set(pid, r=r, tx=float(t[0]), ty=float(t[1]), sx=sx, sy=float(sy))

    def aim(self, pid, ref_vec, world_angle):
        """Повернуть часть так, чтобы её вектор ref_vec (покой) смотрел под world_angle."""
        cur = self.pose.get(pid, {}).copy()
        self.pose.set(pid, r=0.0)
        Wp = self.PW(pid)
        a0 = _ang(kin.apply_vec(self.W(pid), ref_vec))
        sign = 1 if np.linalg.det(Wp[:2, :2]) > 0 else -1
        r = sign * _wrap(world_angle - a0)
        cur["r"] = r
        self.pose[pid] = cur
        return r


# --------------------------------------------------------------------------
# IK лапы: точка подушечки (toe) + угол кисти в мире → углы сегментов
# --------------------------------------------------------------------------

def solve_leg(ctx, key, toe_world, heel_toe_angle, thigh_share=0.45, upper_share=None):
    """toe_world — куда поставить носок подушечки; heel_toe_angle — мировой
    угол вектора пятка→носок (0 = вправо, «+» = по часовой: пятка вверх)."""
    g = LEGS[key]
    pose = ctx.pose
    p0, p1, p2 = g["p0"], g["p1"], g["p2"]
    toe, heel = g["toe"], g["heel"]
    root_part = g["thigh"] or g["a"]
    Wp = ctx.PW(root_part)
    s = 1.0 if np.linalg.det(Wp[:2, :2]) > 0 else -1.0
    # мировая линейная часть кисти: Rot(alpha)·diag(1, s)
    hv = (toe[0] - heel[0], s * (toe[1] - heel[1]))
    alpha = math.radians(heel_toe_angle - _ang(hv))
    v = (p2[0] - toe[0], s * (p2[1] - toe[1]))
    ca, sa = math.cos(alpha), math.sin(alpha)
    target_world = (toe_world[0] + v[0] * ca - v[1] * sa, toe_world[1] + v[0] * sa + v[1] * ca)

    if g["thigh"]:
        th = g["thigh"]
        pose.set(th, r=0.0)
        tl = ctx.to_parent(th, target_world)
        hip = g["hip"]
        d_rest = _ang((p2[0] - hip[0], p2[1] - hip[1]))
        d_now = _ang((tl[0] - hip[0], tl[1] - hip[1]))
        share = THIGH_SHARE.get(key, thigh_share)
        pose.set(th, r=share * _wrap(d_now - d_rest))
    lo2, hi2, lo1, hi1 = TELE[key]
    pose.set(g["a"], r=0.0, tx=0.0, ty=0.0)
    pose.set(g["b"], r=0.0, tx=0.0, ty=0.0)
    tl = ctx.to_parent(g["a"], target_world)
    if upper_share is not None:
        # плечо (с лопаткой) поворачивается мало, предплечье целится в цель,
        # длину добирает телескоп кисти
        d_rest = _ang((p2[0] - p0[0], p2[1] - p0[1]))
        d_now = _ang((tl[0] - p0[0], tl[1] - p0[1]))
        pose.set(g["a"], r=upper_share * _wrap(d_now - d_rest))
        tl2 = ctx.to_parent(g["b"], target_world)
        rb = _wrap(_ang((tl2[0] - p1[0], tl2[1] - p1[1])) - _ang((p2[0] - p1[0], p2[1] - p1[1])))
        pose.set(g["b"], r=rb)
        L2 = math.dist(p1, p2)
        k2 = min(max(math.dist(p1, tl2) / L2, 0.72), 1.15)
        u2 = ((p2[0] - p1[0]) / L2, (p2[1] - p1[1]) / L2)
        pose.set(g["paw"], r=0.0, tx=u2[0] * L2 * (k2 - 1), ty=u2[1] * L2 * (k2 - 1))
        ctx.aim(g["paw"], (toe[0] - heel[0], toe[1] - heel[1]), heel_toe_angle)
        return math.dist(kin.apply(ctx.W(g["paw"]), toe), toe_world)
    L1 = math.dist(p0, p1)
    L2 = math.dist(p1, p2)
    d = math.dist(p0, tl)
    # Телескоп: держим изгиб около «естественного», остаток — сгибом.
    beta = math.radians(NAT_BEND[key])
    disc = (L1 * math.cos(beta)) ** 2 - L1 * L1 + d * d
    L2n = -L1 * math.cos(beta) + math.sqrt(max(disc, 0.0))
    k2 = min(max(L2n / L2, 1 + lo2), 1 + hi2)
    k1 = 1.0
    if hi1 > 0 and d > (L1 + L2 * k2) * 0.985:
        k1 = min(max((d / 0.985 - L2 * k2) / L1, 1 + lo1), 1 + hi1)
    L1e = L1 * k1
    u1 = ((p1[0] - p0[0]) / L1, (p1[1] - p0[1]) / L1)
    p1e = (p0[0] + u1[0] * L1e, p0[1] + u1[1] * L1e)
    p2e = (p2[0] + u1[0] * (L1e - L1), p2[1] + u1[1] * (L1e - L1))
    r_root, r_mid = kin.solve_two_bone(p0, p1e, p2e, tl, -1, l2_scale=k2)
    if abs(k1 - 1) > 1e-4:
        ca, sa = math.cos(math.radians(r_root)), math.sin(math.radians(r_root))
        sh = L1e - L1
        pose.set(g["a"], r=r_root, tx=(u1[0] * ca - u1[1] * sa) * sh,
                 ty=(u1[0] * sa + u1[1] * ca) * sh)
    else:
        pose.set(g["a"], r=r_root, tx=0.0, ty=0.0)
    pose.set(g["b"], r=r_mid)
    u2 = ((p2[0] - p1[0]) / L2, (p2[1] - p1[1]) / L2)
    sh2 = L2 * (k2 - 1)
    pose.set(g["paw"], r=0.0, tx=u2[0] * sh2, ty=u2[1] * sh2)
    ctx.aim(g["paw"], (toe[0] - heel[0], toe[1] - heel[1]), heel_toe_angle)
    got = kin.apply(ctx.W(g["paw"]), toe)
    return math.dist(got, toe_world)


def pad_point(ctx, key):
    g = LEGS[key]
    m = ((g["toe"][0] + g["heel"][0]) / 2, (g["toe"][1] + g["heel"][1]) / 2)
    return kin.apply(ctx.W(g["paw"]), m)


# --------------------------------------------------------------------------
# Сцена B — походка
# --------------------------------------------------------------------------
STRIDE = 0.60 * L          # полный цикл одной лапы
T_CYCLE = 1.4              # с
V = STRIDE / T_CYCLE       # = шаг×2/1,4 с ≈ 0,4286 L/с
DUTY = 0.60
LIFT = {"hind": 0.06 * L, "front": 0.07 * L}
# нейтраль подушечки (середина опоры): toe под плечом/тазом
NEUTRAL = {k: g["hip"][0] + (g["toe"][0] - g["p2"][0]) for k, g in LEGS.items()}
NEUTRAL["fr"] = 1268 + 60.0
NEUTRAL["bl"] = 640.0


class Gait:
    """Пошаговая симуляция походки в локальных координатах корня."""

    def __init__(self):
        self.P = 0.0
        self.legs = {}
        for k, g in LEGS.items():
            u = (self.P - g["phase"]) % 1.0
            st = u < DUTY
            x = NEUTRAL[k] + STRIDE * (DUTY / 2 - u) if st else NEUTRAL[k]
            self.legs[k] = dict(stance=st, x=x, lift_x=x, s0=0.0, settle=None)

    def u(self, k):
        return (self.P - LEGS[k]["phase"]) % 1.0

    def step(self, dt, k_speed, phase_on=True):
        if phase_on:
            self.P += k_speed * dt / T_CYCLE
        for key, st in self.legs.items():
            u = self.u(key)
            in_stance = u < DUTY
            if st["stance"]:
                st["x"] -= k_speed * V * dt
                if not in_stance and phase_on and k_speed > 0:
                    st["stance"] = False
                    st["lift_x"] = st["x"]
                    st["s0"] = (u - DUTY) / (1 - DUTY)
            else:
                if in_stance:
                    st["stance"] = True
                    st["x"] = self.touch_x(key, k_speed)

    def touch_x(self, key, k_speed):
        return NEUTRAL[key] + k_speed * V * DUTY * T_CYCLE / 2

    def toe(self, key, k_speed):
        """(x, y, угол кисти) для лапы в текущий момент."""
        g = LEGS[key]
        st = self.legs[key]
        if st.get("override"):
            return st["override"]
        u = self.u(key)
        front = not g["hind"]
        if st["stance"]:
            # поздняя опора: пятка поднимается, носок стоит
            hl = 0.0
            if u > DUTY - 0.12:
                hl = ease_io((u - (DUTY - 0.12)) / 0.12) * (34.0 if front else 26.0)
            return st["x"], GROUND, hl
        s_raw = (u - DUTY) / (1 - DUTY)
        s = (s_raw - st["s0"]) / max(1e-6, 1 - st["s0"]) if st["s0"] > 0 else s_raw
        s = min(max(s, 0.0), 1.0)
        x_td = self.touch_x(key, k_speed)
        x = st["lift_x"] + (x_td - st["lift_x"]) * EASE_STD(s)
        lift = LIFT["front" if front else "hind"] * max(k_speed, 0.35)
        y = GROUND - lift * math.sin(math.pi * min(1.0, s * 1.08)) ** 0.9
        a0 = 34.0 if front else 26.0
        pk = 95.0 if front else 38.0
        if s < 0.35:
            ang = a0 + (pk - a0) * ease_io(s / 0.35)
        elif s < 0.85:
            ang = pk + (-8.0 - pk) * ease_io((s - 0.35) / 0.5)
        else:
            ang = -8.0 * (1 - ease_io((s - 0.85) / 0.15))
        ang *= max(min(k_speed * 1.4, 1.0), 0.45) if st["s0"] > 0 else 1.0
        return x, y, ang


def walk_pose(ctx, gait, k_speed, extra=None, tuck=None):
    """Поза походки в момент gait.P. extra — правки корпуса/головы (разворот)."""
    pose = ctx.pose
    P = gait.P
    extra = extra or {}
    pitch_amp = math.degrees(math.atan2(0.012 * L, 300.0))
    pitch = -pitch_amp * math.cos(4 * math.pi * P) * extra.get("pitch_k", 1.0)
    pose.set("body", r=pitch)
    # голова стабилизирована: половина вертикали плеч, кивок ±1,5°, сдвиг 70 мс
    lag = 0.07 / T_CYCLE
    nod = -1.5 * math.cos(4 * math.pi * (P - lag)) * extra.get("pitch_k", 1.0)
    pose.set("neck", r=-0.5 * pitch + extra.get("neck", 0.0))
    pose.set("head", r=nod + extra.get("head", 0.0))
    # хвост: волна с запаздыванием 120 мс + 90 мс на сегмент
    amps = [2, 3, 4, 5, 6]
    base = [0, 0, 0, 0, 0]
    for i in range(5):
        ph = P - (0.12 + 0.09 * i) / T_CYCLE
        r = base[i] + amps[i] * math.sin(2 * math.pi * ph) + extra.get(f"tail-{i+1}", 0.0)
        pose.set(f"tail-{i+1}", r=r)
    for half in ("torso-front", "torso-back"):
        sx = extra.get(f"{half}-sx", 1.0)
        ty = extra.get(f"{half}-ty", 0.0)
        pose.set(half, sx=sx, ty=ty, r=extra.get(f"{half}-r", 0.0))
    err = 0.0
    mirror = extra.get("mirror", ())
    for key in ("bl", "br", "fl", "fr"):
        x, y, ang = gait.toe(key, k_speed)
        if key in mirror:
            x = 2 * C_PIVOT[0] - x
        w = tuck.get(key, 0.0) if tuck else 0.0
        if w > 0.8:
            for pid in TUCK[key]:
                pose.set(pid, r=0.0, tx=0.0, ty=0.0)
            _blend_tuck(pose, key, 1.0)
        elif w > 0:
            solve_leg(ctx, key, (x, y), ang)
            _blend_tuck(pose, key, w / 0.8)
        else:
            err = max(err, solve_leg(ctx, key, (x, y), ang))
    return err


TUCK = {  # поджатая лапа в прыжке-развороте (локальные углы)
    "bl": {"leg-bl-upper": 18, "leg-bl-lower": -25, "leg-bl-hock": 40, "leg-bl-paw": 35},
    "br": {"leg-br-upper": 14, "leg-br-lower": -20, "leg-br-hock": 38, "leg-br-paw": 35},
    "fl": {"leg-fl-upper": -12, "leg-fl-lower": 55, "leg-fl-paw": 70},
    "fr": {"leg-fr-upper": -12, "leg-fr-lower": 40, "leg-fr-paw": 70},
}


def _blend_tuck(pose, key, w):
    for pid, ang in TUCK[key].items():
        cur = pose.get(pid, {})
        r = cur.get("r", 0.0)
        pose.set(pid, r=r * (1 - w) + ang * w,
                 tx=cur.get("tx", 0.0) * (1 - w), ty=cur.get("ty", 0.0) * (1 - w))


def scene_b_cycle(rig):
    """Шаг на месте: один цикл 1400 мс (стопы уезжают назад со скоростью V)."""
    gait = Gait()
    dt = 1.0 / FPS
    n = int(round(T_CYCLE * FPS))
    for _ in range(2 * n):  # разгон симуляции до установившегося режима
        gait.step(dt, 1.0)
    gait.P = round(gait.P)  # ровно начало цикла
    samples, errs = [], []
    for i in range(n + 1):
        ctx = Ctx(rig)
        errs.append(walk_pose(ctx, gait, 1.0))
        samples.append((i * 1000.0 / FPS, ctx.pose))
        gait.step(dt, 1.0)
    # бесшовность: последний кадр = первый
    samples[-1] = (T_CYCLE * 1000.0, samples[0][1])
    return samples, max(errs)


def scene_b_lap(rig, lane_ref=5048.0, start_x=None):
    """Проход туда-обратно: разгон → ход → замедление → разворот (×2)."""
    dt = 1.0 / FPS
    gait = Gait()
    # установившийся режим, затем доходим до фазы 0,73 (начало замедления)
    for _ in range(3 * int(T_CYCLE * FPS)):
        gait.step(dt, 1.0)
    while (gait.P % 1.0) < 0.73 or (gait.P % 1.0) > 0.75:
        gait.step(dt, 1.0)
    frames = []  # (pose, root_x, facing)
    state = {"x": 0.0, "f": 1}

    def record(k_speed, extra=None, tuck=None, phase_on=True, advance=True):
        ctx = Ctx(rig)
        err = walk_pose(ctx, gait, k_speed, extra, tuck)
        ctx.pose.set("root", tx=state["x"], sx=state["f"])
        frames.append(ctx.pose)
        if advance:
            gait.step(dt, k_speed, phase_on)
            state["x"] += state["f"] * k_speed * V * dt
        return err

    errs = []

    def decel():
        n = int(0.9 * FPS)
        for i in range(n):
            errs.append(record(1.0 - EASE_KIN(i / n)))
        # досадка 250 мс: лапа в переносе ставится в нейтраль, плоско
        swing = [k for k, st in gait.legs.items() if not st["stance"]]
        start = {k: gait.toe(k, 0.0) for k in swing}
        n2 = int(0.25 * FPS)
        for i in range(n2):
            w = EASE_STD((i + 1) / n2)
            for k in swing:
                x0, y0, a0 = start[k]
                y = y0 + (GROUND - y0) * w - 10.0 * math.sin(math.pi * w) * (1 - w)
                gait.legs[k]["override"] = (x0 + (NEUTRAL[k] - x0) * w, y, a0 * (1 - w))
            errs.append(record(0.0, phase_on=False))
        for k in swing:
            st = gait.legs[k]
            st["override"] = None
            st["stance"] = True
            st["x"] = NEUTRAL[k]

    def accel():
        n = int(0.9 * FPS)
        for k, st in gait.legs.items():
            u = gait.u(k)
            if u >= DUTY:  # лапа «по фазе» в переносе, но стоит — начать перенос
                st["stance"] = False
                st["lift_x"] = st["x"]
                st["s0"] = (u - DUTY) / (1 - DUTY)
        for i in range(n):
            errs.append(record(EASE_KIN((i + 1) / n)))
        for st in gait.legs.values():
            st["s0"] = 0.0

    def cruise(cycles):
        n = int(round(cycles * T_CYCLE * FPS))
        for _ in range(n):
            errs.append(record(1.0))
        for st in gait.legs.values():
            st["s0"] = 0.0

    def turn():
        n = int(1.2 * FPS)
        for i in range(n):
            t = (i + 0.5) / FPS * 1000.0  # мс
            ex = {}
            # корпус перестаёт качаться
            ex["pitch_k"] = 1.0 - ease_io(t / 200.0) + ease_io((t - 1000.0) / 200.0)
            # R1: взгляд назад — голова поднимается
            look = ease_io(t / 250.0) * (1 - ease_io((t - 950.0) / 250.0))
            ex["neck"] = -9.0 * look
            ex["head"] = -10.0 * look
            # перед: переворот 200–560 мс, подскок
            wf = EASE_STD((t - 200.0) / 360.0)
            ex["torso-front-sx"] = 1 - 2 * wf
            hop_f = math.sin(math.pi * min(max((t - 200.0) / 360.0, 0), 1))
            ex["torso-front-ty"] = -26.0 * hop_f
            ex["torso-front-r"] = -3.0 * hop_f
            # зад: переворот 600–960 мс
            wb = EASE_STD((t - 600.0) / 360.0)
            ex["torso-back-sx"] = 1 - 2 * wb
            hop_b = math.sin(math.pi * min(max((t - 600.0) / 360.0, 0), 1))
            ex["torso-back-ty"] = -18.0 * hop_b
            ex["torso-back-r"] = 2.0 * hop_b
            # хвост отстаёт: поднимается при перевороте зада, опускается волной
            for j in range(5):
                tj = t - 600.0 - 80.0 * j
                bump = math.sin(math.pi * min(max(tj / 520.0, 0), 1))
                over = -0.25 * math.sin(math.pi * min(max((tj - 520.0) / 300.0, 0), 1))
                ex[f"tail-{j+1}"] = (-8.0 + 1.0 * j) * (bump + over)
            tuck = {}
            for key in ("fl", "fr"):
                tuck[key] = math.sin(math.pi * min(max((t - 200.0) / 360.0, 0), 1)) ** 0.7
            for key in ("bl", "br"):
                tuck[key] = math.sin(math.pi * min(max((t - 600.0) / 360.0, 0), 1)) ** 0.7
            mir = []
            if t > 380.0:
                mir += ["fl", "fr"]
            if t > 780.0:
                mir += ["bl", "br"]
            ex["mirror"] = tuple(mir)
            errs.append(record(0.0, extra=ex, tuck=tuck, phase_on=False))
        # смена представления: половины снова +1, отражён корень (без скачка)
        state["f"] = -state["f"]
        state["x"] = state["x"]

    # Подготовка: остановка (поза S) — эти кадры не входят в превью.
    decel()
    frames.clear()
    errs.clear()
    state["x"] = 0.0 if start_x is None else start_x
    n_dec = int(0.9 * FPS)
    dec_adv = sum(1.0 - EASE_KIN(i / n_dec) for i in range(n_dec)) * dt / T_CYCLE
    for _ in range(2):
        P0 = gait.P
        accel()
        # ровно 6 циклов фазы на прямую → остановка в той же фазе (бесшовно)
        n_c = int(round((P0 + 6.0 - dec_adv - gait.P) * T_CYCLE * FPS))
        for _ in range(n_c):
            errs.append(record(1.0))
        decel()
        turn()
    return frames, max(errs)


# --------------------------------------------------------------------------
# Сцена A — на спине с мячом
# --------------------------------------------------------------------------
A_FLOOR = 560.0
A_ROCK_PIVOT = (900.0, 552.0)  # спина на полу (мир сцены)
A_CONTACT = {"fl": (1150.0, 128.0), "fr": (1240.0, 128.0)}  # точка касания (toe)
A_REST_DROP = 0.08 * L
A_APEX = 0.22 * L


def a_body(ctx, t):
    th = 2.0 * math.sin(2 * math.pi * (t - 550.0) / 2200.0)
    # корпус отражён по вертикали (брюхом вверх) и качается вокруг точки спины
    p = np.array(C_PIVOT)
    g = np.array(A_ROCK_PIVOT)
    Rm = kin.R(th)[:2, :2]
    tvec = (g - p) - Rm @ (g - p)
    ctx.pose.set("body", r=th, tx=float(tvec[0]), ty=float(tvec[1]), sy=-1.0)
    return th


def paw_track(key, t):
    """Высота подушечки над точкой касания (−вверх), угол кисти, для лапы key."""
    # fl ловит в 0 (и 2200), бросает; fr ловит в 1100
    t0 = 0.0 if key == "fl" else 1100.0
    dt_ = (t - t0) % 2200.0
    if dt_ > 1100.0:
        dt_ -= 2200.0  # отрицательное: до касания
    rest_y = A_REST_DROP
    if -220.0 <= dt_ < 0.0:          # подъём навстречу
        w = EASE_STD((dt_ + 220.0) / 220.0)
        y = rest_y * (1 - w)
        ang = -50.0 * (1 - w) + (-14.0) * w
    elif 0.0 <= dt_ < 60.0:          # амортизация
        w = bezier(0, 0, .2, 1)(dt_ / 60.0)
        y = 10.0 * w
        ang = -20.0 + (-35.0 + 20.0) * w
    elif 60.0 <= dt_ < 130.0:        # толчок (щелчок кистью)
        w = bezier(.3, 0, .1, 1)((dt_ - 60.0) / 70.0)
        y = 10.0 - 26.0 * w
        ang = -35.0 + 45.0 * w
    elif 130.0 <= dt_ < 250.0:       # довод
        w = ease_io((dt_ - 130.0) / 120.0)
        y = -16.0 - 10.0 * w
        ang = 10.0 + 15.0 * w
    elif 250.0 <= dt_ < 650.0:       # возврат в покой
        w = EASE_STD((dt_ - 250.0) / 400.0)
        y = -26.0 + (rest_y + 26.0) * w
        ang = 25.0 + (-50.0 - 25.0) * w
    else:
        y = rest_y
        ang = -50.0
    return y, ang


def a_legs_body(ctx, t):
    """Корпус, шея, хвост, задние и передние лапы сцены A в момент t."""
    th = a_body(ctx, t)
    pose = ctx.pose
    # шея «распрямлена» (снято отражение корпуса): поднимается от груди
    Wtf = ctx.W("torso-front")
    pn = (1212.0, 392.0)
    qn = kin.apply(Wtf, pn)
    Wn = kin.T(*qn) @ kin.R(A_NECK + 0.4 * th) @ kin.T(-pn[0], -pn[1])
    ctx.set_world("neck", Wn)
    # хвост лежит на полу влево, завиток вверх (снято отражение у tail-5)
    pose.set("tail-5", sy=-1.0)
    tail_dirs = [202.0, 176.0, 181.0, 184.0]
    axis = [(676, 362), (560, 428), (440, 522), (320, 588), (160, 611)]
    for j in range(4):
        wave = (1, 2, 3, 5)[j] * math.sin(2 * math.pi * (t - 1100.0 - 80.0 * j) / 2200.0)
        v = (axis[j + 1][0] - axis[j][0], axis[j + 1][1] - axis[j][1])
        ctx.aim(f"tail-{j+1}", v, tail_dirs[j] - wave)
    flick = 0.0
    for tc in (-1100.0, 0.0, 1100.0, 2200.0):
        d = t - tc - 160.0
        if 0 <= d < 150:
            flick = 6.0 * ease_io(d / 150.0)
        elif 150 <= d < 400:
            flick = 6.0 * (1 - ease_io((d - 150) / 250.0))
    pose.set("tail-5", r=8.0 * math.sin(2 * math.pi * (t - 1100.0 - 320.0) / 2200.0) - flick)
    # задние лапы: согнуты, расслаблены; ±3/5/6° в противофазе
    for key, sh in (("bl", 0.0), ("br", 1100.0)):
        g = LEGS[key]
        ph = 2 * math.pi * (t - 280.0 - sh) / 2200.0
        base = A_HIND[key]
        pose.set(g["thigh"], r=base[0] + 3 * math.cos(ph))
        pose.set(g["a"], r=base[1] + 5 * math.cos(ph - 2 * math.pi * 100 / 2200))
        pose.set(g["b"], r=base[2] + 6 * math.cos(ph - 2 * math.pi * 160 / 2200))
        pose.set(g["paw"], r=base[3])
    err = 0.0
    for key in ("fl", "fr"):
        dy, ang = paw_track(key, t)
        cx, cy = A_CONTACT[key]
        tgt = (cx + (-0.2 * dy if key == "fl" else 0.2 * dy), cy + dy)
        e = solve_leg(ctx, key, tgt, ang, upper_share=0.25 if key == "fr" else None)
        A_ERR[key] = max(A_ERR.get(key, 0.0), e)
        err = max(err, e)
    return th, err


A_NECK = 22.0
A_ERR = {}
A_HIND = {"bl": (-30, 35, -50, 30), "br": (-10, 30, -55, 35)}


def ball_state(t, pads_now, keyp):
    """Нижняя точка мяча и масштаб. keyp — подушечки в моменты отрыва/касания."""
    t = t % 2200.0
    for t0, a, b in ((0.0, "fl", "fr"), (1100.0, "fr", "fl")):
        dt_ = t - t0
        if not 0.0 <= dt_ < 1100.0:
            continue
        if dt_ < 130.0:  # на лапе
            sq = [(0, 1.08, .92), (60, 1.04, .96), (130, .96, 1.04)]
            for (ta, xa, ya), (tb, xb, yb) in zip(sq, sq[1:]):
                if ta <= dt_ < tb:
                    w = (dt_ - ta) / (tb - ta)
                    return pads_now[a], (xa + (xb - xa) * w, ya + (yb - ya) * w)
        rel = keyp[(a, "release")]
        end = keyp[(b, "catch")]
        fx = (dt_ - 130.0) / 970.0
        x = rel[0] + (end[0] - rel[0]) * ease_io(fx)
        top = keyp[(a, "catch")][1] - A_APEX
        if dt_ < 495.0:
            w = bezier(.2, .6, .35, 1)((dt_ - 130.0) / 365.0)
            y = rel[1] + (top - rel[1]) * w
        elif dt_ < 605.0:
            y = top + 2.0 * math.sin(math.pi * (dt_ - 495.0) / 110.0)
        else:
            w = bezier(.6, 0, .85, .45)((dt_ - 605.0) / 495.0)
            y = top + (end[1] - top) * w
        s = (1.0, 1.0)
        if dt_ < 250.0:
            w = (dt_ - 130.0) / 120.0
            s = (.96 + .04 * w, 1.04 - .04 * w)
        elif dt_ > 980.0:
            w = (dt_ - 980.0) / 120.0
            s = (1.0 - .02 * w, 1.0 + .02 * w)
        return (x, y), s
    return pads_now["fl"], (1.0, 1.0)


def scene_a(rig, traced):
    (bcx, bcy), br_ = traced["ball"]["c"], traced["ball"]["r"]
    # проход 1: положения подушечек в моменты касания и отрыва
    keyp = {}
    for key, tc in (("fl", 0.0), ("fr", 1100.0)):
        for name, tt in (("catch", tc), ("release", tc + 130.0)):
            ctx = Ctx(rig)
            a_legs_body(ctx, tt)
            keyp[(key, name)] = pad_point(ctx, key)
    samples, errs = [], []
    n = int(2.2 * FPS)
    for i in range(n + 1):
        t = i * 1000.0 / FPS
        ctx = Ctx(rig)
        th, err = a_legs_body(ctx, t)
        errs.append(err)
        pose = ctx.pose
        pads = {k: pad_point(ctx, k) for k in ("fl", "fr")}
        (bx, by), (sx, sy) = ball_state(t, pads, keyp)
        pose.set("ball", tx=bx - bcx, ty=by - (bcy + br_), sx=sx, sy=sy)
        # голова: зеркально (морда влево-вверх, к мячу), следит за мячом
        mid = (keyp[("fl", "catch")][0] + keyp[("fr", "catch")][0]) / 2
        follow = max(-6.0, min(6.0, 6.0 * (bx - mid) / 46.0))
        ph_ = (1318.0, 338.0)
        rock = kin.apply(ctx.W("body"), (1300.0, 330.0))  # точка на спине у шеи
        qh = (rock[0] + A_HEAD[0], rock[1] + A_HEAD[1])
        apex = 2.0 * max(0.0, 1 - abs(t % 1100.0 - 550.0) / 110.0)
        Wh = (kin.T(*qh) @ kin.R(A_HEAD[2] - follow - apex) @ kin.S(-1, 1)
              @ kin.T(-ph_[0], -ph_[1]))
        ctx.set_world("head", Wh)
        samples.append((t, pose))
    samples[-1] = (2200.0, samples[0][1])
    return samples, max(errs)


A_HEAD = (125.0, -125.0, 44.0)  # сдвиг x, y и наклон головы (°) в сцене A


# --------------------------------------------------------------------------
# Сборка файлов
# --------------------------------------------------------------------------

def build_all(traced, B):
    global kin
    kin = B._load("rig_kin")
    parts = traced["parts"]
    defs = {pid: {"id": pid, "parent": p["parent"], "pivot": tuple(p["pivot"])}
            for pid, p in parts.items()}
    defs["ball"] = {"id": "ball", "parent": None,
                    "pivot": (traced["ball"]["c"][0], traced["ball"]["c"][1] + traced["ball"]["r"])}
    rig = kin.Rig(defs, root_pivot=C_PIVOT)
    out = {}
    report = []

    # ---- Сцена B: шаг на месте (для сайта) ----
    samples, err = scene_b_cycle(rig)
    report.append(f"B cycle: max IK error {err:.2f}px")
    css = B.bake_css(_rename(samples), T_CYCLE * 1000, "w")
    view = (1600, 620)
    place = "translate(-30 -175)"
    floor = ""
    body = B.rig_tree(traced, ball=False, place=place)
    out["assets-src/motion/rig/scenes/panther-walk.svg"] = B.svg_doc(
        view, body, css=_motion_guard(css, B.static_css(_rename(samples)[0][1])),
        label="Пантера PAN TERRA идёт")

    # ---- Сцена B: проход туда-обратно (превью) ----
    frames, err = scene_b_lap(rig)
    report.append(f"B lap: {len(frames)} frames, max IK error {err:.2f}px")
    dur = len(frames) * 1000.0 / FPS
    lap_samples = [(i * 1000.0 / FPS, f) for i, f in enumerate(frames)]
    lap_samples.append((dur, frames[0]))
    css = B.bake_css(_rename(lap_samples), dur, "lap")
    lane = 5048
    place = f"translate(40 -175)"
    floor = (f'<line x1="0" y1="{GROUND - 175 + 2:.0f}" x2="{lane}" y2="{GROUND - 175 + 2:.0f}" '
             'stroke="#d9d9d9" stroke-width="4"/>')
    body = floor + B.rig_tree(traced, ball=False, place=place)
    out["assets-src/motion/rig/scene-b-lap.svg"] = B.svg_doc(
        (lane, 640), body, css=css, label="Превью: проход пантеры с разворотами")

    # ---- Сцена A ----
    B.ORDER.update({"leg-fr-upper": 1, "neck": 2})  # в сцене A голова поверх лапы
    samples, err = scene_a(rig, traced)
    report.append(f"A: max IK error {err:.2f}px " + str({k: round(v, 1) for k, v in A_ERR.items()}))
    css = B.bake_css(_rename(samples), 2200, "a")
    view = (1720, 760)
    place = "translate(70 165)"
    body = B.rig_tree(traced, ball=True, place=place)
    css = "#neck>path{display:none}\n" + css  # в сцене A шею закрывают грудь и голова
    out["assets-src/motion/rig/scenes/panther-loader.svg"] = B.svg_doc(
        view, body, css=_motion_guard(css, B.static_css(_rename(samples)[0][1])),
        label="Пантера PAN TERRA играет с мячом")
    out["assets-src/motion/rig/build-report.txt"] = "\n".join(report) + "\n"
    print("\n".join(report))
    return out


def _rename(samples):
    out = []
    for t, pose in samples:
        p2 = kin.Pose()
        for k, v in pose.items():
            p2["pt-root" if k == "root" else k] = v
        out.append((t, p2))
    return out


def _motion_guard(css, static=""):
    # reduced motion: без анимации, статичный кадр 0 сцены
    return (css + "\n@media (prefers-reduced-motion:reduce){*{animation:none!important}"
            + static.replace("\n", "") + "}")
