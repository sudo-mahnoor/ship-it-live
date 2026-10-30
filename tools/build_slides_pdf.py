"""Build the slides PDF from full-HD screenshots of each slide.

Image-only on purpose: wkhtmltopdf's vector output uses soft masks that some
PDF viewers draw as blank white pages. Needs wkhtmltoimage and site/ served
locally first:  (cd site && python3 -m http.server 8766)
"""
import subprocess
import sys
import tempfile
from pathlib import Path

URL = "http://127.0.0.1:8766/slides/index.html#{}"
SLIDES = 10
PAGE_W, PAGE_H = 960, 540  # points, 16:9
OUT = Path(__file__).resolve().parent.parent / "site/slides/From-Code-to-Cloud-Mahnoor-Saeed.pdf"


def shoot(n, path):
    subprocess.run(["wkhtmltoimage", "-q", "--width", "1920", "--height", "1080", "--format", "jpg",
                    "--quality", "92", "--javascript-delay", "2500", URL.format(n), str(path)])


def jpeg_size(j):
    k = 2
    while True:
        marker, length = j[k + 1], int.from_bytes(j[k + 2:k + 4], "big")
        if marker in (0xC0, 0xC1, 0xC2):
            return int.from_bytes(j[k + 7:k + 9], "big"), int.from_bytes(j[k + 5:k + 7], "big")
        k += 2 + length


def write_pdf(jpegs, out):
    objs = [b"<< /Type /Catalog /Pages 2 0 R >>", b""]
    kids = []
    for j in jpegs:
        w, h = jpeg_size(j)
        objs.append(b"<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace /DeviceRGB "
                    b"/BitsPerComponent 8 /Filter /DCTDecode /Length %d >>\nstream\n" % (w, h, len(j)) + j + b"\nendstream")
        draw = b"q %d 0 0 %d 0 0 cm /Im0 Do Q" % (PAGE_W, PAGE_H)
        objs.append(b"<< /Length %d >>\nstream\n" % len(draw) + draw + b"\nendstream")
        objs.append(b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %d %d] /Resources << /XObject << /Im0 %d 0 R >> >> "
                    b"/Contents %d 0 R >>" % (PAGE_W, PAGE_H, len(objs) - 1, len(objs)))
        kids.append(len(objs))
    objs[1] = b"<< /Type /Pages /Kids [%s] /Count %d >>" % (b" ".join(b"%d 0 R" % k for k in kids), len(kids))
    data, offsets = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"), []
    for n, body in enumerate(objs, 1):
        offsets.append(len(data))
        data += b"%d 0 obj\n" % n + body + b"\nendobj\n"
    xref = len(data)
    data += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1)
    data += b"".join(b"%010d 00000 n \n" % o for o in offsets)
    data += b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objs) + 1, xref)
    out.write_bytes(data)


with tempfile.TemporaryDirectory() as tmp:
    shots = []
    for n in range(1, SLIDES + 1):
        path = Path(tmp) / f"s{n}.jpg"
        shoot(n, path)
        if not path.is_file():
            sys.exit(f"slide {n}: screenshot failed (is site/ served on :8766?)")
        shots.append(path.read_bytes())
    write_pdf(shots, OUT)
print(f"wrote {OUT} ({SLIDES} pages)")
