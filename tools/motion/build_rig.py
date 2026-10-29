"""Сборка рига пантеры и анимированных сцен (MOTION-01).

Запуск из корня репозитория (нужны Pillow, numpy, potracer):
    python3 -I tools/motion/build_rig.py

Что делает:
  1. Режет силуэт референса на части (tools/motion/rig_parts.py,
     tools/motion/rig_masks.py) и трассирует каждую часть potracer'ом.
  2. Пишет исходник рига в позе референса со слоями и точками вращения:
       assets-src/motion/rig/panther-rig-profile.svg
  3. Считает анимацию (tools/motion/rig_scenes.py — FK/IK, походка,
     игра с мячом) и запекает её в CSS @keyframes внутри SVG:
       assets-src/motion/rig/scenes/panther-loader.svg — сцена A (на спине, мяч)
       assets-src/motion/rig/scenes/panther-walk.svg   — сцена B (шаг на месте, 1400 мс)
       assets-src/motion/rig/scene-b-lap.svg  — сцена B для превью: проход
                                                туда-обратно с разворотами
  4. Пишет assets-src/motion/rig/preview.html (обе сцены, белый фон, «пол»).

Без <image>: только <path>/<circle>, цвета #0B0B0B / #2A2A2A / #E31924.
"""

import importlib.util
import json
import math
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT_SRC = ROOT / "assets-src/motion/rig"
OUT_PUB = ROOT / "assets-src/motion/rig/scenes"  # черновик: на сайт не публикуется до одобрения Марьям
CACHE = OUT_SRC / "parts-traced.json"


def _load(name):
    spec = importlib.util.spec_from_file_location(name, HERE / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


COLORS = {"body": "#0B0B0B", "hl": "#2A2A2A", "red": "#E31924"}


# --------------------------------------------------------------------------
# 1. Трассировка частей
# --------------------------------------------------------------------------

def trace_parts(force=False):
    if CACHE.exists() and not force:
        return json.loads(CACHE.read_text(encoding="utf-8"))
    rm = _load("rig_masks")
    M = rm.build_masks()
    out = {"ball": {"c": list(map(float, M["ball_c"])), "r": float(M["ball_r"])},
           "parts": {}}
    for pid, pm in M["parts"].items():
        rec = {"pivot": list(M["defs"][pid]["pivot"]),
               "parent": M["defs"][pid]["parent"],
               "layer": M["defs"][pid].get("layer", "front")}
        rec["fill"] = _trace(rm, pm["fill"])
        rec["hl"] = _trace(rm, pm["hl"]) if pm["hl"].sum() > 20 else ""
        if pm["eyes"].any():
            # два глаза — две связные компоненты; ближний (правый) — левее
            ys, xs = np.nonzero(pm["eyes"])
            split = (xs.min() + xs.max()) / 2
            xx = np.arange(pm["eyes"].shape[1])[None, :]
            rec["eye-right"] = _trace(rm, pm["eyes"] & (xx < split), turd=2)
            rec["eye-left"] = _trace(rm, pm["eyes"] & (xx >= split), turd=2)
        out["parts"][pid] = rec
        print("traced", pid, len(rec["fill"]), len(rec["hl"]))
    OUT_SRC.mkdir(parents=True, exist_ok=True)
    CACHE.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    return out


def _trace(rm, mask, turd=None):
    if not mask.any():
        return ""
    ys, xs = np.nonzero(mask)
    y0, y1 = max(ys.min() - 2, 0), ys.max() + 3
    x0, x1 = max(xs.min() - 2, 0), xs.max() + 3
    ex = rm.ex
    old = ex.TURDSIZE
    if turd is not None:
        ex.TURDSIZE = turd
    try:
        return ex.trace(mask[y0:y1, x0:x1], -x0, -y0)
    finally:
        ex.TURDSIZE = old


# --------------------------------------------------------------------------
# 2. SVG
# --------------------------------------------------------------------------

def children_of(parts, pid):
    return [k for k, v in parts.items() if v["parent"] == pid]


ORDER = {}  # необязательный порядок детей: pid -> приоритет (меньше — раньше)


def emit_part(parts, pid, ind=""):
    p = parts[pid]
    px, py = p["pivot"]
    o = [f'{ind}<g id="{pid}" data-pivot="{px} {py}" '
         f'style="transform-origin:{px}px {py}px">']
    kids = children_of(parts, pid)
    kids.sort(key=lambda k: ORDER.get(k, 0))
    for k in kids:
        if parts[k]["layer"] == "back":
            o += emit_part(parts, k, ind + " ")
    o.append(f'{ind} <path class="f" d="{p["fill"]}"/>')
    if p.get("hl"):
        o.append(f'{ind} <path class="h" d="{p["hl"]}"/>')
    for eye in ("eye-right", "eye-left"):
        if p.get(eye):
            o.append(f'{ind} <path id="{eye}" class="e" d="{p[eye]}"/>')
    for k in kids:
        if parts[k]["layer"] != "back":
            o += emit_part(parts, k, ind + " ")
    o.append(f"{ind}</g>")
    return o


def ball_markup(traced, pivot_id="ball"):
    (cx, cy), r = traced["ball"]["c"], traced["ball"]["r"]
    # точка вращения мяча — низ (сжатие при контакте с лапой)
    return (f'<g id="{pivot_id}" data-pivot="{cx:.1f} {cy + r:.1f}" '
            f'style="transform-origin:{cx:.1f}px {cy + r:.1f}px">'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="url(#pt-ball-shade)"/>'
            f'</g>')


SVG_DEFS = ('<defs><radialGradient id="pt-ball-shade" cx="0.38" cy="0.32" r="0.75">'
            '<stop offset="0" stop-color="#FF3B44"/><stop offset="0.55" stop-color="#E31924"/>'
            '<stop offset="1" stop-color="#9E0F17"/></radialGradient></defs>')

BASE_CSS = ("g{transform-box:view-box}"
            f".f{{fill:{COLORS['body']}}}.h{{fill:{COLORS['hl']}}}.e{{fill:{COLORS['red']}}}")


def svg_doc(view, body, css="", label="Пантера PAN TERRA", extra_attrs=""):
    w, h = view
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}" role="img" aria-label="{label}"{extra_attrs}>\n'
            f'{SVG_DEFS}\n<style>{BASE_CSS}{css}</style>\n{body}\n</svg>\n')


def rig_tree(traced, root_children=("torso-back", "torso-front"), ball=True,
             place="", ball_inside_root=False):
    parts = traced["parts"]
    o = [f'<g id="pt-place" transform="{place}">' if place else "<g>"]
    o.append('<g id="pt-root" style="transform-origin:960px 440px">')
    o.append('<g id="body" data-pivot="960 440" style="transform-origin:960px 440px">')
    for rc in root_children:
        o += emit_part(parts, rc, " ")
    o.append("</g>")
    if ball and ball_inside_root:
        o.append(ball_markup(traced))
    o.append("</g>")
    if ball and not ball_inside_root:
        o.append(ball_markup(traced))
    o.append("</g>")
    return "\n".join(o)


# --------------------------------------------------------------------------
# 3. Анимация → CSS @keyframes
# --------------------------------------------------------------------------

def fmt_tf(r, tx, ty, sx, sy):
    parts = []
    if abs(tx) > 0.05 or abs(ty) > 0.05:
        parts.append(f"translate({tx:.1f}px,{ty:.1f}px)")
    if abs(r) > 0.02:
        parts.append(f"rotate({r:.2f}deg)")
    if abs(sx - 1) > 5e-4 or abs(sy - 1) > 5e-4:
        parts.append(f"scale({sx:.3f},{sy:.3f})")
    # Всегда одинаковая структура функций → корректная интерполяция.
    return " ".join(parts) if parts else "none"


def _full_tf(v):
    r, tx, ty, sx, sy = v
    return (f"translate({tx:.1f}px,{ty:.1f}px) rotate({r:.2f}deg) "
            f"scale({sx:.3f},{sy:.3f})")


def simplify(times, vals, tol=(0.12, 0.25, 0.25, 0.002, 0.002)):
    """Убираем ключи, которые линейная интерполяция соседей повторяет в пределах tol."""
    keep = [0, len(times) - 1]

    def rec(i, j):
        if j <= i + 1:
            return
        worst, wi = 0.0, None
        for k in range(i + 1, j):
            f = (times[k] - times[i]) / (times[j] - times[i])
            err = 0.0
            for c in range(5):
                interp = vals[i][c] + (vals[j][c] - vals[i][c]) * f
                err = max(err, abs(vals[k][c] - interp) / tol[c])
            if err > worst:
                worst, wi = err, k
        if worst > 1.0:
            keep.append(wi)
            rec(i, wi)
            rec(wi, j)

    rec(0, len(times) - 1)
    return sorted(set(keep))


def bake_css(samples, duration_ms, prefix, iteration="infinite", selector_prefix=""):
    """samples: list of (t_ms, Pose) равномерно по циклу, включая t=duration."""
    times = [t for t, _ in samples]
    part_ids = sorted({pid for _, pose in samples for pid in pose})
    css = []
    for pid in part_ids:
        vals = [pose.get_p(pid) for _, pose in samples]
        if all(max(abs(a - b) for a, b in zip(v, (0, 0, 0, 1, 1))) < 1e-4 for v in vals):
            continue
        idx = simplify(times, vals)
        name = f"{prefix}-{pid}"
        kf = []
        for i in idx:
            pct = times[i] / duration_ms * 100
            kf.append(f"{pct:.2f}%{{transform:{_full_tf(vals[i])}}}")
        css.append(f"@keyframes {name}{{{''.join(kf)}}}")
        sel = f"{selector_prefix}#{pid}"
        css.append(f"{sel}{{animation:{name} {duration_ms}ms linear {iteration}}}")
    return "\n".join(css)


def static_css(pose, selector_prefix=""):
    out = []
    for pid in pose:
        v = pose.get_p(pid)
        if max(abs(a - b) for a, b in zip(v, (0, 0, 0, 1, 1))) < 1e-4:
            continue
        out.append(f"{selector_prefix}#{pid}{{transform:{_full_tf(v)}}}")
    return "\n".join(out)


# --------------------------------------------------------------------------

def main():
    force = "--retrace" in sys.argv
    traced = trace_parts(force=force)
    sc = _load("rig_scenes")
    OUT_PUB.mkdir(parents=True, exist_ok=True)
    OUT_SRC.mkdir(parents=True, exist_ok=True)

    # Исходник рига: поза референса, без анимации.
    view = (1600, 600)
    place = "translate(-30 -180)"
    (OUT_SRC / "panther-rig-profile.svg").write_text(
        svg_doc(view, rig_tree(traced, place=place),
                label="Риг пантеры PAN TERRA — поза референса"), encoding="utf-8")

    results = sc.build_all(traced, sys.modules[__name__])
    for path, text in results.items():
        p = ROOT / path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8")
        print(f"{path}: {len(text.encode())} bytes")


if __name__ == "__main__":
    main()
