import { PageIntro } from "@/components/PageIntro";
import { CtaBand } from "@/components/CtaBand";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "How Lossless Metadata Removal Works | Images & Video",
  description:
    "How MediaPure removes EXIF, XMP, IPTC, C2PA and video container metadata without re-encoding, and how every result is verified pixel by pixel or stream by stream before download.",
  path: "/how-it-works",
  keywords: ["how to remove video metadata", "lossless metadata removal", "stream copy remux", "EXIF removal"],
});

const STEPS = [
  { t: "Upload over an encrypted connection", d: "Your browser sends the file as-is over HTTPS, with no form encoding and a hard size limit enforced as the bytes arrive. An image is read straight into memory and never written to disk. A video is far too large for that, so it is streamed to a private file that only the cleaning worker can open, and deleted the moment the job ends, whether it succeeded or failed." },
  { t: "Identify the file by its content", d: "We ignore the file name and read the first bytes of the file itself: the JPEG, PNG and WebP signatures, the ISOBMFF ftyp box behind MP4 and MOV, the EBML header behind WebM and MKV, the RIFF header behind AVI. An image is then decoded once in full, which rejects corrupted files and decompression bombs designed to exhaust memory. A video is probed instead, and refused if it carries no video track, runs longer than four hours or claims an impossible resolution." },
  { t: "Map every metadata block", d: "The file is parsed into its building blocks and each one is read. For images: EXIF including GPS and maker notes, XMP packets, IPTC records inside Photoshop resources, PNG text fields where AI tools store prompts, C2PA manifests, comments, thumbnails and bytes appended after the image ends. For video: container and per-stream tags, QuickTime atoms, chapter titles, handler names, header timestamps, timed GPS and telemetry tracks, and uuid boxes holding XMP or Content Credentials. Each field is sorted into a category so you can see what mattered." },
  { t: "Rebuild the file without them", d: "We write a new container holding only what is needed to play the file back. For an image that means the compressed pixel data, the structure describing it and the ICC colour profile; if your photo needs an orientation flag to display upright, we add back that single value and nothing else. For a video the compressed streams are copied across without ever being decoded, then a second pass blanks the handler names, zeroes the header timestamps, clears the vendor codes and removes leftover metadata boxes, patching the chunk offset tables so the file stays valid." },
  { t: "Verify, then release", d: "For an image, both files are decoded and a fingerprint of every pixel in every frame is compared. For a video, each stream is checksummed packet by packet in both files, and the codec, resolution, frame rate, duration, frame count and rotation are compared field by field. Only a file that passes is stored for download, under a random 32-character link. If the deep scrub had broken anything, the plain rewrite is served instead; if that failed too, you get an error rather than a damaged file." },
  { t: "Expire and delete", d: "A background process deletes each cleaned file 10 minutes after it was created. You can delete it sooner with one click. There's no archive and no backup of user files." },
];

const CONTAINERS = [
  { f: "MP4 / MOV", d: "Both are ISOBMFF: a tree of boxes. We keep the tracks, sample tables and codec configuration byte for byte, and remove udta, meta and ilst metadata islands, uuid boxes holding XMP or C2PA, and free padding. Handler names are blanked, the vendor code in every sample description is zeroed, and the creation and modification times in mvhd, tkhd and mdhd are set to zero. Because removing boxes moves the media data, every entry in the stco and co64 chunk offset tables is rewritten by the same amount. The result is written index-first, so it starts playing before it finishes downloading." },
  { f: "WebM / MKV", d: "Both are EBML. Tags and chapters are dropped during the rewrite and attachments are never carried across. The Segment Info block still names the muxing and writing application and carries a wall-clock date, so those elements are blanked in place: not one byte moves, which means the Cues and SeekHead positions stay correct by construction." },
  { f: "AVI", d: "A RIFF container. Authorship lives in INFO chunks: software, artist, copyright, creation date. Each is neutralised by renaming its four-byte identifier to JUNK, the RIFF specification's own ignore-this chunk, and zeroing the body. Identifiers are the same length either way, so every offset in the index chunk remains valid." },
];

const FORMATS = [
  { f: "JPEG", d: "A JPEG is a series of marker segments. We keep the frame, Huffman and quantisation tables and the scan data exactly as they are, plus the JFIF header, ICC profile and Adobe colour-transform marker. We remove APP1 (EXIF and XMP), APP13 (IPTC), APP11 (C2PA/JUMBF), vendor APP blocks, multi-picture data, comments and anything after the end-of-image marker." },
  { f: "PNG", d: "A PNG is a series of chunks. We keep critical chunks and the ones that affect rendering (transparency, gamma, colour space, ICC, HDR info) and animation chunks for APNG. We remove tEXt, zTXt and iTXt (where Stable Diffusion, ComfyUI and editors store prompts and XMP), eXIf, tIME, caBX (C2PA) and private chunks." },
  { f: "WebP", d: "A WebP is a RIFF container. We keep the image, alpha, animation and ICC chunks and remove EXIF, XMP and unknown chunks, then correct the header flags and file size so every decoder reads the result cleanly." },
];

export default function HowItWorks() {
  return (
    <>
      <PageIntro crumb="How it works" path="/how-it-works" title="How we remove metadata without touching a pixel"
        intro="Most tools strip metadata by re-saving your image. We take a slower-to-build but better route: rewrite the file's structure and leave the image data alone." />
      <section className="wrap section-lg">
        <ol className="relative max-w-3xl space-y-12 border-l-2 border-line pl-8 md:pl-12">
          {STEPS.map((s, i) => (
            <li key={s.t} className="relative">
              <span className="absolute -left-[2.95rem] top-0 grid size-9 place-items-center rounded-full bg-ink text-sm font-bold text-white md:-left-[3.95rem]">{i + 1}</span>
              <h2 className="t-sub">{s.t}</h2>
              <p className="t-lead mt-3 text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="border-t border-line bg-paper">
        <div className="wrap section-lg">
          <h2 className="t-section">Image formats, block by block</h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            {FORMATS.map((x) => (
              <div key={x.f}>
                <h3 className="font-mono text-lg font-bold text-signal">{x.f}</h3>
                <p className="mt-3 leading-7 text-ink-2">{x.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 max-w-3xl leading-7 text-muted">
            Why not use ImageMagick or re-save with an image library? Because any tool that decodes and re-encodes a JPEG compresses it again.
            Container-level rewriting is the only way to promise identical pixels, so that&apos;s what the engine does, and it proves it on every file.
            Where ExifTool is installed on the server, it&apos;s used as a second reader to catch rare vendor-specific fields in the scan report.
          </p>

          <h2 className="t-section mt-20">Video containers, box by box</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted">
            Video uses FFmpeg for the rewrite, because nothing else handles the breadth of real-world files as reliably.
            But <code className="rounded border border-line bg-white px-1.5 py-0.5 font-mono text-sm text-ink">-map_metadata -1</code>{" "}
            is not enough on its own: it clears tag dictionaries and leaves identity behind in places that are not tags at
            all. So each container gets a second pass of our own.
          </p>
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            {CONTAINERS.map((x) => (
              <div key={x.f}>
                <h3 className="font-mono text-lg font-bold text-signal">{x.f}</h3>
                <p className="mt-3 leading-7 text-ink-2">{x.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 max-w-3xl leading-7 text-muted">
            One more thing FFmpeg will happily copy across for you: timed-metadata tracks. A GoPro writes a GPMF track,
            an iPhone writes mebx, an Android phone writes CAMM. Those are continuous GPS logs stored in the media data
            itself rather than in any tag, so no tag-clearing option touches them. We map only the video, audio and
            subtitle streams, which means a telemetry track is never carried into the cleaned file.
          </p>
        </div>
      </section>
      <CtaBand
        title="See it on one of your own files"
        text="Every field we find is listed before you download anything."
        href="/video-metadata-cleaner"
        cta="Clean a video"
        secondary={{ href: "/image-metadata-cleaner", label: "Clean an image" }}
      />
    </>
  );
}
