export type Faq = { q: string; a: string; group: "Basics" | "Quality" | "Privacy" | "AI images" | "Video" };

export const faqs: Faq[] = [
  {
    group: "Basics",
    q: "What does this tool remove from my image?",
    a: "Everything that isn't needed to display the picture: EXIF (camera, lens, serial numbers, dates), GPS coordinates, XMP and IPTC fields (creator, copyright, captions, keywords, editing history), AI generation data such as prompts, seeds and model names, C2PA Content Credentials manifests, embedded thumbnails, comments, vendor blocks and any data hidden after the end of the image.",
  },
  {
    group: "Basics",
    q: "Which formats are supported?",
    a: "Images: JPG/JPEG, PNG (including animated PNG) and WebP (lossy, lossless and animated), up to 25 MB each, 20 at a time. Video: MP4, MOV, M4V, WebM, MKV and AVI, up to 500 MB, one at a time so each clip gets the whole machine.",
  },
  {
    group: "Basics",
    q: "Is it free? Do I need an account?",
    a: "It's free to use and there is no signup, for both images and video. Fair-use limits apply to stop automated abuse: 30 images per minute and 500 per day from one connection, and 6 videos per minute and 60 per day.",
  },
  {
    group: "Quality",
    q: "Will cleaning reduce the quality of my image?",
    a: "No. We never re-encode your image. The engine rewrites the file container and drops only metadata blocks, while the compressed image data is copied byte for byte. Before a file is offered for download, we decode both versions and compare every pixel. If a single pixel differed, you would get an error instead of a file.",
  },
  {
    group: "Quality",
    q: "Why is the cleaned file slightly smaller?",
    a: "Because the metadata is gone. A photo from a phone often carries 20–60 KB of EXIF data and an embedded preview. An AI image can carry a signed Content Credentials manifest of 20 KB or more. The image data itself is unchanged.",
  },
  {
    group: "Quality",
    q: "Will my colours or orientation change?",
    a: "No. We keep the ICC colour profile, because removing it can shift colours on wide-gamut images, and it contains no personal information. We also keep a single orientation flag when your photo needs one, so portrait phone photos don't appear sideways. Nothing else survives.",
  },
  {
    group: "Privacy",
    q: "Do you store my images or videos?",
    a: "Images are processed entirely in memory and never written to disk. Videos are too large for that, so an upload is streamed to a private file that only the cleaning worker can read, and it is deleted the moment cleaning finishes, whether it succeeded or failed. In both cases the cleaned file is held for 10 minutes under a random link only you receive, then deleted automatically. You can also delete it instantly with the delete button.",
  },
  {
    group: "Privacy",
    q: "Do you look at, keep or sell the metadata you remove?",
    a: "No. The report you see is sent only to your browser. Our database records anonymous counts, like how many files were cleaned and in which format, with no filenames, images or metadata values.",
  },
  {
    group: "Privacy",
    q: "Don't social networks strip metadata anyway?",
    a: "Some platforms remove parts of it on upload, but behaviour differs between platforms and changes over time, and many routes keep everything: email attachments, cloud drive links, portfolio sites, website CMS uploads, messaging apps that send 'original quality' files and client handovers. Cleaning before you share means you don't have to guess.",
  },
  {
    group: "AI images",
    q: "What AI information can be hidden inside an image?",
    a: "Depending on the tool: the full prompt and negative prompt, seed, sampler and model name (common in Stable Diffusion and ComfyUI PNGs, sometimes with the full node workflow), the generator software name, IPTC 'digital source type' tags, and signed C2PA Content Credentials manifests naming the service that created the image.",
  },
  {
    group: "AI images",
    q: "Does removing metadata make an AI image undetectable?",
    a: "No, and we don't claim it does. Some generators also embed invisible watermarks directly into the pixels, and because we never touch pixels, those remain. Detection tools can also analyse the image itself. What we remove is the readable information attached to the file: your prompts, settings, account-linked details and location.",
  },
  {
    group: "AI images",
    q: "Should I remove Content Credentials from my images?",
    a: "It depends on how you use the image. Content Credentials help others verify where an image came from, and some platforms and clients expect them. They can also reveal which tools and services you use, and when. If you publish AI-generated work, follow the disclosure rules of the platform and your local regulations. Removing file metadata doesn't change what you are required to disclose.",
  },
  {
    group: "Video",
    q: "Does cleaning a video reduce its quality?",
    a: "No. We never re-encode. The compressed video and audio streams are copied into a fresh container without being decoded, so the resolution, frame rate, bitrate, colour and audio are exactly what you uploaded. Before a file is offered for download we checksum each stream in both files and compare them. If a single packet differed, you would get an error instead of a video.",
  },
  {
    group: "Video",
    q: "Which video formats can I clean?",
    a: "MP4, MOV (QuickTime), M4V, WebM, MKV (Matroska) and AVI, up to 500 MB per file. The container is identified by reading its actual bytes, not by trusting the file extension, so a mislabelled file is still handled correctly or rejected safely.",
  },
  {
    group: "Video",
    q: "What metadata does a video actually contain?",
    a: "More than most people expect. Container tags hold the title, artist, copyright, comments, creation date and the software that exported it. QuickTime and MP4 files add GPS coordinates in a dedicated atom, camera make and model, and handler names that identify the recording device. The mvhd, tkhd and mdhd headers carry creation and modification timestamps that survive almost every other tool. Files from phones and action cameras can also carry a whole timed-metadata track logging your GPS position second by second.",
  },
  {
    group: "Video",
    q: "Do you remove GPS location from video?",
    a: "Yes, in both places it hides. The QuickTime location atom and ISO 6709 tags are removed with the rest of the container metadata, and any timed GPS or telemetry track — GoPro GPMF, Apple mebx, Google CAMM, Sony RTMD — is dropped entirely rather than copied across. Those tracks are the bigger risk, because they are a continuous log of where you went, and most metadata tools never touch them.",
  },
  {
    group: "Video",
    q: "Will my portrait video end up sideways?",
    a: "No. Phone videos are recorded in landscape and carry a rotation flag telling players to turn the picture. That flag is not personal information, so we read it before cleaning and write it back afterwards, then confirm it survived. Rotation is part of the verification step, so a clip that lost it would never be offered for download.",
  },
  {
    group: "Video",
    q: "How long does cleaning a video take?",
    a: "Usually a few seconds, because nothing is re-encoded. Most of the wait is your upload. A 20 MB clip is typically cleaned and verified in under five seconds on our hardware; a 500 MB file takes longer to transfer than to clean.",
  },
  {
    group: "Video",
    q: "Why is my cleaned video a slightly different size?",
    a: "Because the metadata is gone and the container has been rebuilt. A phone video can carry tens of kilobytes of tags, atoms and a GPS track; removing them makes the file smaller. MP4 and MOV files are also written with the index at the front so they start playing before they finish downloading, which can shift a few hundred bytes around. The video and audio data itself is byte for byte what you uploaded.",
  },
  {
    group: "Video",
    q: "Does removing metadata make an AI-generated video undetectable?",
    a: "No, and we don't claim it does. Some AI video tools also embed invisible watermarks into the picture itself, and because we never touch the frames, those remain. What we remove is the readable information attached to the file: Content Credentials, generator names, prompts, timestamps and location. If a platform or client requires you to disclose AI-generated work, removing metadata doesn't change that obligation.",
  },
  {
    group: "Video",
    q: "Can I clean more than one video at a time?",
    a: "Not at the moment. Video processing is far heavier than image processing, so each upload gets a dedicated worker and the queue stays short and predictable for everyone. Images can still be cleaned 20 at a time.",
  },
];

/** The video-specific subset, used on the video cleaner page and in its FAQ schema. */
export const videoFaqs = faqs.filter((f) => f.group === "Video");

/** Image-specific questions, for the image cleaner page. */
export const imageFaqs = faqs.filter((f) => f.group === "Quality" || f.group === "AI images");
