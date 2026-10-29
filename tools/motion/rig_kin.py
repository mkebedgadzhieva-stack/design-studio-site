"""Кинематика рига пантеры: прямая (FK) и обратная (IK) — MOTION-01.

Модель трансформа части совпадает с CSS в SVG:
    transform-origin: pivot; transform: translate(tx,ty) rotate(r) scale(sx,sy)
    M_local = T(pivot) · T(tx,ty) · R(r) · S(sx,sy) · T(-pivot)
    M_world = M_world(parent) · M_local
Все координаты — пиксели референса (y вниз, угол по часовой стрелке).
"""

import math

import numpy as np


def T(x, y):
    return np.array([[1.0, 0, x], [0, 1.0, y], [0, 0, 1.0]])


def R(deg):
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]])


def S(sx, sy):
    return np.array([[sx, 0, 0], [0, sy, 0], [0, 0, 1.0]])


def apply(M, p):
    v = M @ np.array([p[0], p[1], 1.0])
    return (v[0], v[1])


def apply_vec(M, v):
    w = M[:2, :2] @ np.array(v, dtype=float)
    return (w[0], w[1])


class Pose(dict):
    """part_id -> dict(r, tx, ty, sx, sy). Отсутствующие поля = покой."""

    def get_p(self, pid):
        d = self.get(pid, {})
        return (d.get("r", 0.0), d.get("tx", 0.0), d.get("ty", 0.0),
                d.get("sx", 1.0), d.get("sy", 1.0))

    def set(self, pid, **kw):
        self.setdefault(pid, {}).update(kw)


class Rig:
    def __init__(self, defs, root_parent="body", root_pivot=(960, 440)):
        self.defs = dict(defs)
        self.defs.setdefault("body", {"id": "body", "parent": "root",
                                      "pivot": root_pivot})
        self.defs.setdefault("root", {"id": "root", "parent": None,
                                      "pivot": root_pivot})

    def local(self, pid, pose):
        px, py = self.defs[pid]["pivot"]
        r, tx, ty, sx, sy = pose.get_p(pid)
        return T(px, py) @ T(tx, ty) @ R(r) @ S(sx, sy) @ T(-px, -py)

    def world(self, pid, pose, scene=None):
        chain = []
        cur = pid
        while cur is not None:
            chain.append(cur)
            cur = self.defs[cur]["parent"]
        M = np.eye(3) if scene is None else scene.copy()
        for c in reversed(chain):
            M = M @ self.local(c, pose)
        return M

    def parent_world(self, pid, pose, scene=None):
        par = self.defs[pid]["parent"]
        return (np.eye(3) if scene is None else scene.copy()) if par is None \
            else self.world(par, pose, scene)


def _ang(v):
    return math.degrees(math.atan2(v[1], v[0]))


def _wrap(a):
    return (a + 180.0) % 360.0 - 180.0


def solve_two_bone(p0, p1, p2, target, bend_sign, l2_scale=1.0):
    """IK двух костей в координатах покоя (локально у родителя цепочки).

    p0 — корень (вращается), p1 — средний сустав, p2 — конец цепочки.
    Возвращает (rot_root, rot_mid) — углы относительно покоя, градусы.
    l2_scale < 1 — «телескоп»: вторая кость укорочена сдвигом вдоль оси.
    """
    L1 = math.dist(p0, p1)
    L2 = math.dist(p1, p2) * l2_scale
    dx, dy = target[0] - p0[0], target[1] - p0[1]
    d = math.hypot(dx, dy)
    d = min(max(d, abs(L1 - L2) + 1e-3), L1 + L2 - 1e-3)
    cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)
    A = math.degrees(math.acos(max(-1.0, min(1.0, cosA))))
    base = math.degrees(math.atan2(dy, dx))
    a1 = base - bend_sign * A
    # положение среднего сустава и направление второй кости
    m = (p0[0] + L1 * math.cos(math.radians(a1)),
         p0[1] + L1 * math.sin(math.radians(a1)))
    a2 = _ang((target[0] - m[0], target[1] - m[1]))
    rest1 = _ang((p1[0] - p0[0], p1[1] - p0[1]))
    rest2 = _ang((p2[0] - p1[0], p2[1] - p1[1]))
    r_root = _wrap(a1 - rest1)
    r_mid = _wrap((a2 - rest2) - r_root)
    return r_root, r_mid


def rest_bend_sign(p0, p1, p2):
    c = (p1[0] - p0[0]) * (p2[1] - p1[1]) - (p1[1] - p0[1]) * (p2[0] - p1[0])
    return 1 if c > 0 else -1
