"""
create_og_image.py — OG 이미지 생성 (1200x630)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = Path(__file__).parent.parent / "assets"

BG      = (15, 10, 36)
SURFACE = (30, 20, 68)
GOLD    = (232, 184, 75)
GOLD2   = (243, 212, 138)
PURPLE  = (139, 92, 246)
WHITE   = (243, 239, 255)
GRAY    = (182, 172, 217)

W, H = 1200, 630


def load_font(size):
    candidates = [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
        "C:/Windows/Fonts/malgunbd.ttf",
        "C:/Windows/Fonts/malgun.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    draw.ellipse([x0, y0, x0 + radius * 2, y0 + radius * 2], fill=fill)
    draw.ellipse([x1 - radius * 2, y0, x1, y0 + radius * 2], fill=fill)
    draw.ellipse([x0, y1 - radius * 2, x0 + radius * 2, y1], fill=fill)
    draw.ellipse([x1 - radius * 2, y1 - radius * 2, x1, y1], fill=fill)


def create_og_image():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    draw.ellipse([780, -150, 1400, 470], fill=(46, 30, 92))
    draw.ellipse([850, 380, 1300, 830], fill=(58, 26, 74))

    import random
    random.seed(7)
    for _ in range(60):
        x, y = random.randint(0, W), random.randint(0, H)
        r = random.choice([1, 1, 2])
        draw.ellipse([x, y, x + r, y + r], fill=GOLD2)

    badge_font = load_font(22)
    badge_text = "무료 운세 모음"
    bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
    bw = bbox[2] - bbox[0] + 32
    draw_rounded_rect(draw, (100, 110, 100 + bw, 150), 10, SURFACE)
    draw.text((116, 118), badge_text, fill=GOLD2, font=badge_font)

    title_font = load_font(76)
    draw.text((98, 190), "우아운세", fill=WHITE, font=title_font)

    sub_font = load_font(34)
    draw.text((100, 300), "사주 · 타로 · 궁합 · 꿈해몽", fill=GOLD2, font=sub_font)

    icon_font = load_font(24)
    boxes = ["사주팔자 계산기", "타로 78장", "띠·별자리 운세", "꿈해몽 사전"]
    cx, y = 100, 400
    for label in boxes:
        lbbox = draw.textbbox((0, 0), label, font=icon_font)
        lw = lbbox[2] - lbbox[0]
        bw = lw + 34
        draw_rounded_rect(draw, (cx, y, cx + bw, y + 46), 23, SURFACE)
        draw.text((cx + 17, y + 10), label, fill=GRAY, font=icon_font)
        cx += bw + 12
        if cx > 950:
            cx = 100
            y += 58

    domain_font = load_font(28)
    draw.text((100, 550), "wooaunse.wooahouse.com", fill=GOLD, font=domain_font)

    ASSETS_DIR.mkdir(exist_ok=True)
    out = ASSETS_DIR / "og-image.png"
    img.save(str(out), "PNG", optimize=True)
    print(f"OG image created: {out} ({W}x{H})")


if __name__ == "__main__":
    create_og_image()
