export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "note"; text: string };

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  readMinutes: number;
  tag: string;
  body: Block[];
};

export const posts: Post[] = [
  {
    slug: "remove-metadata-from-video",
    title: "What Your Video File Reveals: GPS Tracks, Device Names and How to Remove Them",
    description:
      "A video carries more identity than a photo, including a second-by-second GPS log most tools never touch. What is inside MP4, MOV, WebM, MKV and AVI files, and how to strip it without losing quality.",
    date: "2026-09-24",
    readMinutes: 8,
    tag: "Video",
    body: [
      { t: "p", text: "Everyone has heard that photos carry EXIF data. Far fewer people know that a video file carries more, in more places, and that the most revealing part of it is not metadata in the usual sense at all: it is a separate track inside the file that logs where the camera was, several times a second, for the entire recording." },
      { t: "p", text: "Here is what is actually inside the video files people share every day, where each piece hides, and what it takes to remove it without ruining the video." },
      { t: "h2", text: "A video is a container, and everything writes into it" },
      { t: "p", text: "An MP4 or MOV file is not one blob of video. It is a tree of boxes: one holding the compressed picture, one the sound, and a crowd of small ones describing them. Every tool that touches the file — the phone, the camera, the editor, the export preset, the uploader — writes into that crowd. Nothing ever cleans up after itself." },
      { t: "ul", items: [
        "Container tags: title, artist, author, copyright, comment, description, album and genre, often filled in automatically by an editor from your project settings.",
        "Encoder and software fields naming the exact application and version that produced the file, which is a precise fingerprint of your workflow.",
        "Creation and modification timestamps, stored twice: once as a readable tag and once inside the mvhd, tkhd and mdhd headers, where most tools never look and almost none of them clean.",
        "Handler names on each track. A phone writes something like 'Core Media Video'; an Android device has been known to write 'ISO Media file produced by Google Inc.'; an action camera writes its own model name.",
        "A vendor code in every sample description, four bytes identifying the manufacturer — or, after a careless cleaning pass, identifying the tool that cleaned it.",
      ] },
      { t: "h2", text: "The part that actually matters: telemetry tracks" },
      { t: "p", text: "Phones and action cameras record more than picture and sound. Alongside them they write a timed-metadata track, a third stream that carries a stream of sensor readings with timestamps attached. GoPro calls its format GPMF. Apple uses a track type called mebx. Android phones write CAMM. Sony writes RTMD." },
      { t: "p", text: "What is in them varies by device, but GPS is common: latitude, longitude, altitude and speed, sampled continuously. A single photo leaks one location. A ten-minute clip with a telemetry track leaks a route — where you started, the way you went, how fast, and where you stopped." },
      { t: "p", text: "The reason this survives so often is mundane. A telemetry track is not a tag, so the usual instruction to clear a file's metadata does not touch it. Worse, the standard way to copy a video into a new container copies every track it finds, so a tool that strips the tags and remuxes the file will faithfully carry the GPS log into the 'cleaned' output. The only fix is to decide, deliberately, not to copy that track." },
      { t: "h2", text: "AI video and Content Credentials" },
      { t: "p", text: "AI video tools have adopted the same provenance standard as AI image tools. A C2PA manifest, also called Content Credentials, is a signed block naming the service that generated the clip, the software agent involved, a creation timestamp and a declaration that the source is trained algorithmic media. In a video it usually sits in a uuid box, which is a general-purpose container that tools are free to ignore — and most do, which means they leave it in place." },
      { t: "p", text: "Content Credentials exist for good reasons, and we go through the trade-offs in [our guide to C2PA](/blog/c2pa-content-credentials-explained). The point here is the same as for images: it is there, it names your tools and your timing, and you should know about it before you publish." },
      { t: "h2", text: "Why re-encoding is the wrong way to remove it" },
      { t: "p", text: "The obvious way to strip a video clean is to open it and export a new one. It works, and it costs you the video. Re-encoding decodes every frame and compresses it again, and a second round of lossy compression is visible: softer motion, blocking in dark scenes and gradients, a duller image at the same file size. Do it twice and it compounds. It is also slow, turning a two-second job into several minutes for a long clip." },
      { t: "p", text: "There is no need for any of it. The compressed video and audio can be copied into a fresh container without being decoded at all — the same packets, byte for byte, in a new wrapper. That is what a container rewrite does, and it is why cleaning a video should take seconds rather than minutes and cost you nothing in quality." },
      { t: "h2", text: "What has to be kept" },
      { t: "p", text: "Removing metadata should never change how a video plays, and a couple of things look like metadata but are not." },
      { t: "ul", items: [
        "The rotation flag. Phones record in landscape and tag the file with a rotation for players to apply. Strip it and every portrait clip plays on its side. It says nothing about you, so it should be read before cleaning and written back afterwards.",
        "Track language codes and timing information, which describe the file rather than its author.",
        "Subtitle tracks, which are part of the content you meant to share.",
      ] },
      { t: "h2", text: "A checklist before you publish a video" },
      { t: "ol", items: [
        "Scan the file first, so you know whether any of this applies to your particular clip. A screen recording and a holiday video have very different problems.",
        "Pay attention to whether a telemetry or data track is listed. That is the one that leaks a route rather than a point.",
        "Clean without re-encoding, so you are not paying for privacy with quality.",
        "Check that the result still plays the right way up and still has its audio, and that the duration matches.",
        "Keep your original. The metadata-rich file is useful in your own archive for proving authorship or reconstructing a shoot.",
      ] },
      { t: "note", text: "One honest limit: some AI video services embed invisible watermarks in the picture itself. A lossless cleaner never touches the frames, so those remain. Removing metadata protects your location, your devices, your timings and your tools. It is not a way to disguise where a video came from, and if a platform requires you to disclose AI-generated work, that obligation does not go away." },
      { t: "p", text: "You can scan and clean a video with our [free video metadata cleaner](/video-metadata-cleaner). It lists every field it finds before removing anything, drops telemetry tracks rather than copying them, and checksums the cleaned file against your original so you can see that every frame survived." },
    ],
  },
  {
    slug: "what-your-ai-image-file-reveals",
    title: "Posting AI Art? Here's What Your Image File Still Says About You",
    description:
      "Prompts, seeds, model names, signed Content Credentials and sometimes your location. What AI image files carry, tool by tool, and how to remove it.",
    date: "2026-09-10",
    readMinutes: 7,
    tag: "AI images",
    body: [
      { t: "p", text: "You spent an evening getting a render right. You export it, drop it into a client deck or a portfolio page, and move on. The picture is what people see. But the file carries a second layer that most people never open, and for AI images that layer can be surprisingly talkative." },
      { t: "p", text: "Below is what we actually find when we scan AI-generated images, grouped by where they came from. None of this is visible when you look at the picture. All of it is readable by anyone who downloads the file and opens it in a free metadata viewer." },
      { t: "h2", text: "Stable Diffusion and ComfyUI: your entire recipe" },
      { t: "p", text: "Local generation tools are the most generous. Automatic1111-style interfaces write a PNG text field called parameters that holds the full prompt, the negative prompt, step count, sampler, CFG scale, seed, image size and model hash. ComfyUI goes further and can embed the whole node graph as JSON, so someone can load your file and reproduce your exact workflow, custom nodes and LoRA names included." },
      { t: "p", text: "If your prompts are part of how you earn a living, that's your process handed over with every image." },
      { t: "h2", text: "Hosted generators: Content Credentials" },
      { t: "p", text: "Many hosted image services now attach a C2PA manifest, also called Content Credentials. It's a signed block of data that states which service produced the image, which software agent was involved, when it was created, and that the source is 'trained algorithmic media'. When we scanned two logo files exported from ChatGPT while building this site, each carried a manifest of more than 21 KB naming the OpenAI Media Service API, the ChatGPT agent and a creation timestamp to the nanosecond." },
      { t: "p", text: "Content Credentials exist for good reasons, and we explain the trade-offs in [our guide to C2PA](/blog/c2pa-content-credentials-explained). The point here is simply that they're there, and most people don't know it." },
      { t: "h2", text: "Edited in a desktop app: history and identity" },
      { t: "p", text: "Open an AI render in an editor, tweak it and export, and you often add XMP data: the editing application and version, a document ID, an edit history, and sometimes the name attached to your software licence in the creator field." },
      { t: "h2", text: "Composited with a phone photo: location" },
      { t: "p", text: "The riskiest case isn't pure AI output. It's the mixed image: a product shot from your phone with an AI-generated background, or a selfie run through an AI filter. Depending on the app, the phone's original EXIF block can travel with the result, including GPS coordinates precise enough to identify a building, plus the phone model and a serial number." },
      { t: "h2", text: "What to do before you publish" },
      { t: "ol", items: [
        "Scan the file first. Knowing what's there tells you whether any of it matters for this particular image.",
        "Remove what you don't want to share. A good cleaner removes metadata without re-encoding, so your image doesn't lose quality.",
        "Keep your original. Store the metadata-rich version in your own archive in case you need to prove authorship or reproduce the render later.",
        "Follow disclosure rules. If a platform or client asks you to label AI-generated work, removing metadata doesn't change that obligation.",
      ] },
      { t: "note", text: "One honest limit: some generators also hide invisible watermarks inside the pixels themselves. A lossless cleaner leaves pixels untouched, so those remain. Metadata removal protects your prompts, tools and location. It isn't a way to disguise where an image came from." },
      { t: "p", text: "You can scan and clean images with our [free metadata cleaner](/image-metadata-cleaner). It shows every field it finds before removing anything, and the output is pixel-identical to your upload. If you also publish AI video, the same applies there and then some: see [what your video file reveals](/blog/remove-metadata-from-video)." },
    ],
  },
  {
    slug: "remove-exif-data-from-photos",
    title: "How to Remove EXIF Data From Photos Before You Share Them",
    description:
      "What EXIF data is, what it reveals (GPS, device serials, timestamps) and four ways to remove it on Windows, Mac, phones and online, without losing quality.",
    date: "2026-09-03",
    readMinutes: 6,
    tag: "Guides",
    body: [
      { t: "p", text: "EXIF is the block of technical data your camera or phone writes into every photo. It was designed for photographers who wanted to know which settings produced a good shot. Over time it absorbed a lot more, and today it's the most common way personal information leaks out of an image." },
      { t: "h2", text: "What EXIF can reveal" },
      { t: "ul", items: [
        "Location: latitude and longitude, often accurate to a few metres, plus altitude and the direction the camera faced.",
        "Device identity: make, model, lens and on many cameras a body serial number that links every photo you've taken with that camera.",
        "Time: the date and time the photo was taken and last edited, sometimes with your time zone offset.",
        "Software: the editing apps you used and their versions.",
        "Ownership: artist and copyright fields, which some cameras fill in automatically with your name.",
        "A hidden preview: a small embedded thumbnail that, in some older editing workflows, still shows the image before it was cropped.",
      ] },
      { t: "h2", text: "Option 1: Windows File Explorer" },
      { t: "p", text: "Right-click the image, choose Properties, open the Details tab and select 'Remove Properties and Personal Information'. You can create a cleaned copy or strip selected fields. It works for JPEGs, but it doesn't reliably reach XMP, IPTC or AI-specific data, and it doesn't handle PNG text fields." },
      { t: "h2", text: "Option 2: macOS Preview" },
      { t: "p", text: "In Preview, Tools then Show Inspector lets you view EXIF and remove location info. It doesn't remove the rest. Exporting from Photos with 'Include location information' unticked helps for location only." },
      { t: "h2", text: "Option 3: on your phone" },
      { t: "p", text: "iOS lets you turn off location for a single photo from the share sheet under Options. Android varies by manufacturer; many galleries have a 'remove location data' toggle when sharing. Both leave the device and timestamp data in place." },
      { t: "h2", text: "Option 4: a dedicated metadata cleaner" },
      { t: "p", text: "A dedicated tool removes every metadata block at once: EXIF, GPS, XMP, IPTC, comments, thumbnails and AI data. The important question to ask of any such tool is whether it re-encodes your image. Many online tools open the image and save it again, which silently recompresses a JPEG and costs quality every time." },
      { t: "p", text: "Our [metadata cleaner](/image-metadata-cleaner) works differently. It rewrites the file's container and copies the compressed image data untouched, then decodes both versions and confirms every pixel matches before you download. It keeps only what your image needs to display correctly: the colour profile and, where needed, the orientation flag." },
      { t: "h2", text: "Check your work" },
      { t: "p", text: "After cleaning, run the file through a scanner again. You should see no location, no device, no names and no dates. If you want a second opinion, the free command-line tool ExifTool will list anything that remains." },
    ],
  },
  {
    slug: "c2pa-content-credentials-explained",
    title: "What Are Content Credentials, and Should You Keep Them?",
    description:
      "C2PA Content Credentials explained in plain language: what the manifest contains, who adds it, why it matters, and when removing it makes sense.",
    date: "2026-08-27",
    readMinutes: 6,
    tag: "AI images",
    body: [
      { t: "p", text: "Content Credentials are the public name for C2PA, a standard from the Coalition for Content Provenance and Authenticity. The idea is simple: attach a tamper-evident record to a media file that says where it came from and what happened to it." },
      { t: "h2", text: "What's inside a manifest" },
      { t: "p", text: "A C2PA manifest is a signed package stored inside the image file: an APP11 segment in JPEGs, a caBX chunk in PNGs, a chunk in WebP. It typically holds:" },
      { t: "ul", items: [
        "A claim generator: the software or service that produced the claim.",
        "Actions: created, edited, converted, with timestamps.",
        "A digital source type, such as 'trainedAlgorithmicMedia' for AI output.",
        "The software agent involved, sometimes with a model version.",
        "A cryptographic signature and certificate chain, so edits to the manifest can be detected.",
        "Sometimes a thumbnail of the image and references to earlier ingredients.",
      ] },
      { t: "h2", text: "Why they exist" },
      { t: "p", text: "Provenance helps newsrooms, platforms and viewers tell a camera photo from a synthetic image, and it gives creators a way to attach verified authorship to their work. That's genuinely useful, and some publishers and clients now request it." },
      { t: "h2", text: "Why people remove them" },
      { t: "ul", items: [
        "They reveal your tool stack and account usage to anyone, including competitors.",
        "They timestamp your work, which some designers don't want to share with clients.",
        "They add 20–30 KB per image, which adds up on image-heavy pages.",
        "A manifest from an intermediate step can describe a workflow you've since replaced.",
      ] },
      { t: "h2", text: "A sensible approach" },
      { t: "p", text: "Keep an original with credentials intact in your archive. Publish a cleaned copy where provenance isn't requested. Where a platform, publication or regulation requires you to disclose AI involvement, disclose it. The metadata was one way of doing that; removing it doesn't remove the obligation." },
      { t: "note", text: "Removing a C2PA manifest doesn't erase invisible watermarks that some services embed in the pixels. Our tool doesn't alter pixels, so it can't and doesn't try to remove those." },
    ],
  },
  {
    slug: "clean-images-before-upload-checklist",
    title: "Uploading Images Online? Run Through This Privacy Checklist First",
    description:
      "A practical pre-upload checklist for designers, marketers and businesses: where metadata survives, which channels keep it, and a two-minute routine.",
    date: "2026-08-20",
    readMinutes: 5,
    tag: "Guides",
    body: [
      { t: "p", text: "It's tempting to assume the platform will take care of it. Some do strip parts of the metadata when you upload. But what gets removed differs between platforms, changes without notice, and doesn't apply to most of the places images actually travel." },
      { t: "h2", text: "Channels that usually keep metadata" },
      { t: "ul", items: [
        "Email attachments and file-transfer links.",
        "Cloud drive shares (Drive, Dropbox, OneDrive and similar).",
        "Website CMS uploads: a WordPress media library keeps the original file unless a plugin strips it.",
        "Portfolio and marketplace sites that offer 'original' downloads.",
        "Messaging apps when you send a photo as a document or in original quality.",
        "Client handovers, press kits and shared asset folders.",
      ] },
      { t: "h2", text: "The two-minute routine" },
      { t: "ol", items: [
        "Export your final image at the size you need.",
        "Scan it and read the report. Location, device and creator fields deserve the most attention.",
        "Clean it losslessly, so you don't add a compression step to your pipeline.",
        "Upload the cleaned copy and keep the original in your archive.",
      ] },
      { t: "h2", text: "For teams" },
      { t: "p", text: "Make cleaning part of the export step rather than a separate chore. Batch the week's assets, clean them together, download a ZIP and publish from that folder. It takes less time than resizing." },
      { t: "p", text: "Start with our [image metadata cleaner](/image-metadata-cleaner). It handles up to 20 images at a time and gives you a ZIP of the cleaned set." },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
