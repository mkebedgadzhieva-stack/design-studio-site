"""Маски частей рига из референса (MOTION-01).

Переиспользует load()/erode()/trace() из extract_reference.py и
определения частей из rig_parts.py. Возвращает для каждой части маску
заливки тела, бликов и (для головы) глаз — в координатах референса.
"""

import importlib.util
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent


def _load_module(name):
    spec = importlib.util.spec_from_file_location(name, HERE / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ex = _load_module("extract_reference")
rp = _load_module("rig_parts")

# Порядок присвоения пикселей (кто раньше — тот владелец): конечности,
# голова и хвост «отбирают» свои пиксели у корпуса.
OWNERSHIP_ORDER = [
    "head", "neck",
    "leg-fr-paw", "leg-fr-lower", "leg-fr-upper",
    "leg-fl-paw", "leg-fl-lower", "leg-fl-upper",
    "leg-br-paw", "leg-br-hock", "leg-br-lower", "leg-br-upper",
    "leg-bl-paw", "leg-bl-hock", "leg-bl-lower", "leg-bl-upper",
    "tail-5", "tail-4", "tail-3", "tail-2", "tail-1",
    "torso-front", "torso-back",
]


def paint_order(parts, root_children=("torso-back", "torso-front")):
    """Порядок отрисовки, как в SVG: дети слоя back — до родителя, front — после."""
    order = []

    def visit(pid):
        kids = [k for k, v in parts.items() if v["parent"] == pid]
        for k in kids:
            if parts[k].get("layer") == "back":
                visit(k)
        order.append(pid)
        for k in kids:
            if parts[k].get("layer") != "back":
                visit(k)

    for rc in root_children:
        visit(rc)
    return order


def poly_mask(shape, pts):
    img = Image.new("L", (shape[1], shape[0]), 0)
    ImageDraw.Draw(img).polygon([tuple(map(float, p)) for p in pts], fill=255)
    return np.asarray(img) > 127


def ellipse_mask(shape, cx, cy, rx, ry):
    img = Image.new("L", (shape[1], shape[0]), 0)
    ImageDraw.Draw(img).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
    return np.asarray(img) > 127


def disc_mask(shape, cx, cy, r):
    return ellipse_mask(shape, cx, cy, r, r)


def dilate(mask, px):
    """Наращивание маски на px (октагон: чередуем квадрат 3×3 и крест)."""
    if px <= 0 or not mask.any():
        return mask
    ys, xs = np.nonzero(mask)
    y0, y1 = max(ys.min() - px - 1, 0), min(ys.max() + px + 2, mask.shape[0])
    x0, x1 = max(xs.min() - px - 1, 0), min(xs.max() + px + 2, mask.shape[1])
    m = mask[y0:y1, x0:x1].copy()
    for i in range(px):
        g = m.copy()
        g[1:, :] |= m[:-1, :]
        g[:-1, :] |= m[1:, :]
        g[:, 1:] |= m[:, :-1]
        g[:, :-1] |= m[:, 1:]
        if i % 2:
            g[1:, 1:] |= m[:-1, :-1]
            g[:-1, :-1] |= m[1:, 1:]
            g[1:, :-1] |= m[:-1, 1:]
            g[:-1, 1:] |= m[1:, :-1]
        m = g
    out = np.zeros_like(mask)
    out[y0:y1, x0:x1] = m
    return out


def edge_distance(sil, x, y):
    """Расстояние от точки до ближайшего края силуэта (для радиуса шайбы)."""
    edge = sil & ~ex.erode(sil, 1)
    ys, xs = np.nonzero(edge)
    return float(np.sqrt(((xs - x) ** 2 + (ys - y) ** 2).min()))


def build_masks():
    rgb, lum, red = ex.load()
    shape = lum.shape
    silhouette = (lum < ex.SILHOUETTE_MAX_LUM) | red
    yy = np.arange(shape[0])[:, None]
    xx = np.arange(shape[1])[None, :]
    eyes = red & (yy < 400)
    by, bx = np.nonzero(red & (yy >= 400))
    ball_c = ((bx.min() + bx.max()) / 2, (by.min() + by.max()) / 2)
    ball_r = max(bx.max() - bx.min(), by.max() - by.min()) / 2 + 1
    ball = (xx - ball_c[0]) ** 2 + (yy - ball_c[1]) ** 2 <= (ball_r + 1.5) ** 2
    sil = silhouette & ~ball
    highlights = (
        (lum >= ex.HIGHLIGHT_LUM[0]) & (lum < ex.HIGHLIGHT_LUM[1]) & ~red
        & ex.erode(silhouette, ex.HIGHLIGHT_INSET_PX) & ~ball
    )

    parts = {p["id"]: p for p in rp.PARTS}
    owned = {}
    free = sil.copy()
    for pid in OWNERSHIP_ORDER:
        m = poly_mask(shape, parts[pid]["core"]) & free
        owned[pid] = m
        free &= ~m

    # Пиксели силуэта вне всех полигонов (антиалиасинг на стыках полигонов)
    # отдаём соседней части — наращиванием по 1 px.
    for _ in range(40):
        if not free.any():
            break
        for pid in OWNERSHIP_ORDER:
            grab = dilate(owned[pid], 1) & free
            owned[pid] |= grab
            free &= ~grab

    order = paint_order(parts)
    rank = {pid: i for i, pid in enumerate(order)}

    def descendants(pid):
        out = []
        for k, v in parts.items():
            if v["parent"] == pid:
                out += [k] + descendants(k)
        return out

    out = {}
    for pid, p in parts.items():
        own = owned[pid]
        fill = own.copy()
        if p.get("grow"):
            # Нахлёст: часть заходит в родителя и во всё, что нарисовано
            # раньше неё, — при вращении стык закрыт чёрным телом.
            below = np.zeros_like(sil)
            for q in parts:
                if rank[q] < rank[pid] or q == p["parent"]:
                    below |= owned[q]
            grown = dilate(own, p["grow"]) & below
            if p.get("cap"):
                # у круглого сустава нахлёст только внутри «шайбы»: иначе
                # углы нахлёста торчат ступенькой при сгибе
                r0 = edge_distance(sil, *p["pivot"])
                grown &= disc_mask(shape, p["pivot"][0], p["pivot"][1], r0 + 6)
            fill |= grown
        cap_r = None
        if p.get("cap"):
            cap_r = edge_distance(sil, *p["pivot"])
            fill |= disc_mask(shape, p["pivot"][0], p["pivot"][1], cap_r) & dilate(sil, 1)
        # Дорисованная заливка не лезет в лапы ниже линии корпуса (иначе при
        # шаге остаётся «культя»): исключаем всех потомков, кроме ближних
        # бедра и лопатки, которые сами являются частью силуэта корпуса.
        back_kids = np.zeros_like(sil)
        for q in descendants(pid):
            if rank[q] < rank[pid] or q not in ("leg-br-upper", "leg-fr-upper"):
                back_kids |= owned[q]
        for kind, cx, cy, rx, ry in p.get("extra", []):
            fill |= ellipse_mask(shape, cx, cy, rx, ry) & sil & ~back_kids
        # «шайба» сустава есть и у родителя: при сгибе стык круглый с обеих сторон
        for q, qd in parts.items():
            if qd["parent"] == pid and qd.get("cap"):
                rq = edge_distance(sil, *qd["pivot"])
                fill |= disc_mask(shape, qd["pivot"][0], qd["pivot"][1], rq) & dilate(sil, 1)
        out[pid] = {
            "fill": fill,
            "own": own,
            # блики — по всей заливке части (включая нахлёст), чтобы часть,
            # нарисованная поверх соседа, не стирала его блики в зоне стыка
            "hl": highlights & fill,
            "eyes": eyes & own,
            "cap_r": cap_r,
        }
    return {
        "shape": shape, "sil": sil, "highlights": highlights, "eyes": eyes,
        "ball_c": ball_c, "ball_r": ball_r, "free": free, "parts": out,
        "defs": parts,
    }
