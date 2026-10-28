"""Чистые ассеты пантеры из референса (MOTION-01, подготовительный шаг).

Референс: assets-src/motion/reference/panther-reference.webp — шахматная
подложка в нём «впечатана» в пиксели (альфа непрозрачная). Скрипт отделяет
персонажа от фона по яркости/цвету и сохраняет:

  assets-src/motion/panther-walk-reference-clean.png  — RGBA с настоящей прозрачностью
  public/motion/panther-walk-static.svg               — векторная трассировка по слоям
      #pt-body       силуэт (чёрный)
      #pt-highlights графитовые блики
      #pt-eyes       красные глаза
      #pt-ball       красный мяч (окружность с радиальным градиентом)

Это НЕ риг: лапы, голова, хвост пока не разделены на подвижные части
(см. docs/motion/SPEC.md, раздел «Контракт ассетов»).

Запуск из корня репозитория (нужны Pillow, numpy и potracer):
    pip install pillow numpy potracer
    python3 -I tools/motion/extract_reference.py
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

try:
    import potrace  # пакет potracer (чистый Python)
except ImportError:
    sys.exit("Нужен пакет potracer: pip install potracer")

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets-src/motion/reference/panther-reference.webp"
OUT_PNG = ROOT / "assets-src/motion/panther-walk-reference-clean.png"
OUT_SVG = ROOT / "public/motion/panther-walk-static.svg"

# Параметры экспорта (подобраны по гистограмме референса 1672×941):
# фон ≥ 224, тело ≈ 0–10, графитовые блики ≈ 18–35, красный R>140 G<90 B<90.
SILHOUETTE_MAX_LUM = 200
HIGHLIGHT_LUM = (15, 60)
HIGHLIGHT_INSET_PX = 3  # не брать антиалиасинг по краю силуэта за блик
PAD = 8  # поля вокруг персонажа в viewBox
TURDSIZE = 12  # отбрасывать пятна меньше N пикселей
COLORS = {"body": "#0B0B0B", "highlights": "#2A2A2A", "red": "#E31924"}


def load():
    rgb = np.asarray(Image.open(SRC).convert("RGB")).astype(np.int32)
    lum = (rgb[..., 0] * 299 + rgb[..., 1] * 587 + rgb[..., 2] * 114) // 1000
    red = (rgb[..., 0] > 140) & (rgb[..., 1] < 90) & (rgb[..., 2] < 90)
    return rgb, lum, red


def erode(mask, px):
    img = Image.fromarray((mask * 255).astype(np.uint8))
    return np.asarray(img.filter(ImageFilter.MinFilter(px * 2 + 1))) > 127


def trace(mask, ox, oy):
    """Маска → d-атрибут SVG (кривые Безье), координаты со сдвигом ox, oy."""
    # potracer считает заполненными пиксели со значением ниже blacklevel,
    # поэтому передаём инвертированную маску.
    paths = potrace.Bitmap(~mask).trace(
        turdsize=TURDSIZE, alphamax=1.0, opticurve=True, opttolerance=0.2
    )

    def pt(p):
        return f"{p.x - ox:.1f} {p.y - oy:.1f}"

    parts = []
    for curve in paths:
        parts.append(f"M{pt(curve.start_point)}")
        for seg in curve.segments:
            if seg.is_corner:
                parts.append(f"L{pt(seg.c)}L{pt(seg.end_point)}")
            else:
                parts.append(f"C{pt(seg.c1)} {pt(seg.c2)} {pt(seg.end_point)}")
        parts.append("Z")
    return "".join(parts)


def main():
    rgb, lum, red = load()
    silhouette = (lum < SILHOUETTE_MAX_LUM) | red

    ys, xs = np.nonzero(silhouette)
    x0, x1 = max(xs.min() - PAD, 0), min(xs.max() + PAD, rgb.shape[1] - 1)
    y0, y1 = max(ys.min() - PAD, 0), min(ys.max() + PAD, rgb.shape[0] - 1)

    # Красные области: мяч — компонент у правой лапы (ниже линии глаз).
    eyes_line = 400  # в референсе глаза на y≈313–335, мяч на y≈660–741
    yy = np.arange(rgb.shape[0])[:, None]
    eyes = red & (yy < eyes_line)
    # Мяч в референсе с тёмно-красной тенью, которая по яркости попадает в
    # «тело», поэтому мяч задаётся окружностью по красным пикселям.
    by, bx = np.nonzero(red & (yy >= eyes_line))
    ball_cx, ball_cy = (bx.min() + bx.max()) / 2, (by.min() + by.max()) / 2
    ball_r = max(bx.max() - bx.min(), by.max() - by.min()) / 2 + 1
    xx = np.arange(rgb.shape[1])[None, :]
    ball = (xx - ball_cx) ** 2 + (yy - ball_cy) ** 2 <= (ball_r + 1.5) ** 2

    highlights = (
        (lum >= HIGHLIGHT_LUM[0]) & (lum < HIGHLIGHT_LUM[1]) & ~red
        & erode(silhouette, HIGHLIGHT_INSET_PX)
    )
    body = silhouette  # мяч вырезается при сборке слоёв: это отдельный объект

    # 1) RGBA: альфа из яркости (мягкий край), цвета исходные.
    alpha = np.clip((235 - lum) * 255 // (235 - SILHOUETTE_MAX_LUM + 30), 0, 255)
    alpha = np.where(red, 255, alpha).astype(np.uint8)
    rgba = np.dstack([rgb.astype(np.uint8), alpha])[y0:y1 + 1, x0:x1 + 1]
    OUT_PNG.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(OUT_PNG, optimize=True)

    # 2) SVG по слоям.
    w, h = x1 - x0 + 1, y1 - y0 + 1
    layers = [
        ("pt-body", COLORS["body"], body & ~ball),
        ("pt-highlights", COLORS["highlights"], highlights & ~ball),
        ("pt-eyes", COLORS["red"], eyes),
    ]
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'width="{w}" height="{h}" role="img" aria-label="Пантера PAN TERRA с мячом">',
        '<defs><radialGradient id="pt-ball-shade" cx="0.38" cy="0.32" r="0.75">'
        f'<stop offset="0" stop-color="#FF3B44"/><stop offset="0.55" stop-color="{COLORS["red"]}"/>'
        '<stop offset="1" stop-color="#9E0F17"/></radialGradient></defs>',
    ]
    for layer_id, color, mask in layers:
        out.append(f'<path id="{layer_id}" fill="{color}" fill-rule="evenodd" '
                   f'd="{trace(mask[y0:y1 + 1, x0:x1 + 1], 0, 0)}"/>')
    out.append(f'<circle id="pt-ball" cx="{ball_cx - x0:.1f}" cy="{ball_cy - y0:.1f}" '
               f'r="{ball_r:.1f}" fill="url(#pt-ball-shade)"/>')
    out.append("</svg>")
    OUT_SVG.parent.mkdir(parents=True, exist_ok=True)
    OUT_SVG.write_text("\n".join(out) + "\n", encoding="utf-8")

    print(f"crop {w}x{h} at ({x0},{y0})")
    for p in (OUT_PNG, OUT_SVG):
        print(f"{p.relative_to(ROOT)}: {p.stat().st_size} bytes")


if __name__ == "__main__":
    main()
