"""Builds realistic test images packed with metadata."""
import io
import struct
import zlib

from PIL import Image, PngImagePlugin

XMP = (b'<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
       b'<rdf:Description xmp:CreatorTool="Midjourney v7" photoshop:City="Lahore" '
       b'Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia">'
       b'<dc:creator><rdf:Seq><rdf:li>Jane Designer</rdf:li></rdf:Seq></dc:creator>'
       b'</rdf:Description></rdf:RDF></x:xmpmeta>')


def _exif(orientation=6):
    ex = Image.Exif()
    ex[0x010F] = "Apple"
    ex[0x0110] = "iPhone 15 Pro"
    ex[0x0131] = "Adobe Photoshop 25.0"
    ex[0x013B] = "Jane Designer"
    ex[0x8298] = "(c) 2026 Jane"
    ex[0x0132] = "2026:09:01 10:11:12"
    ex[0x010E] = "Launch visual, draft 3"
    ex[0x0112] = orientation
    gps = {1: "N", 2: (33.0, 35.0, 52.2), 3: "E", 4: (73.0, 2.0, 51.5)}
    ex[0x8825] = gps
    return ex


def _gradient(size=(320, 200), mode="RGB"):
    im = Image.new(mode, size)
    px = im.load()
    for x in range(size[0]):
        for y in range(size[1]):
            v = (x * 255 // size[0], y * 255 // size[1], (x + y) % 256)
            px[x, y] = v if mode == "RGB" else v + (200,)
    return im


def jpeg(progressive=False) -> bytes:
    buf = io.BytesIO()
    _gradient().save(buf, "JPEG", quality=92, exif=_exif().tobytes(), progressive=progressive,
                     icc_profile=b"\x00" * 128, comment=b"shot on my phone")
    data = buf.getvalue()
    extra = b""
    xmp = b"http://ns.adobe.com/xap/1.0/\x00" + XMP
    extra += b"\xff\xe1" + struct.pack(">H", len(xmp) + 2) + xmp
    iptc = b"\x1c\x02\x50" + struct.pack(">H", 12) + b"Jane Creator" + b"\x1c\x02\x5a" + struct.pack(">H", 6) + b"Lahore"
    ps = b"Photoshop 3.0\x008BIM\x04\x04\x00\x00" + struct.pack(">I", len(iptc)) + iptc
    extra += b"\xff\xed" + struct.pack(">H", len(ps) + 2) + ps
    c2pa = b"JP\x00\x01jumbc2pa\x00claim_generator_info\xa4dnamex\x18OpenAI Media Service API"
    extra += b"\xff\xeb" + struct.pack(">H", len(c2pa) + 2) + c2pa
    return data[:2] + extra + data[2:] + b"HIDDEN-TRAILING-PAYLOAD"


def png() -> bytes:
    info = PngImagePlugin.PngInfo()
    info.add_text("parameters", "a cozy cabin, Steps: 30, Sampler: DPM++ 2M, CFG scale: 7, Seed: 42")
    info.add_text("Software", "ComfyUI")
    info.add_itxt("XML:com.adobe.xmp", XMP.decode())
    info.add_text("Author", "Jane Designer", zip=True)
    buf = io.BytesIO()
    _gradient(mode="RGBA").save(buf, "PNG", pnginfo=info, exif=_exif(orientation=1).tobytes())
    data = buf.getvalue()
    # add tIME before IEND
    body = struct.pack(">HBBBBB", 2026, 9, 1, 10, 11, 12)
    chunk = struct.pack(">I", 7) + b"tIME" + body + struct.pack(">I", zlib.crc32(b"tIME" + body))
    return data[:-12] + chunk + data[-12:]


def webp(lossless=False) -> bytes:
    buf = io.BytesIO()
    _gradient().save(buf, "WEBP", quality=90, lossless=lossless, exif=_exif().tobytes(), xmp=XMP)
    return buf.getvalue()
