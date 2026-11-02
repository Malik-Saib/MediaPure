export type Guide = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { q: string; a: string }[];
};

export const guides: Guide[] = [
  {
    slug: "remove-exif-iphone",
    title: "How to Remove Photo Metadata on iPhone",
    seoTitle: "Remove EXIF on iPhone | MediaPure",
    description: "Learn how to remove EXIF and GPS metadata from iPhone photos before sharing, plus how to stop new photos saving location.",
    intro: "iPhone photos can include the date and time, camera details, lens settings and sometimes the coordinates where you took the picture. You can prevent location from being shared for an individual send, turn off location tagging for new pictures, or create a cleaned copy when you need more than location removed.",
    sections: [
      {
        heading: "What metadata can an iPhone photo contain?",
        paragraphs: [
          "A photo may carry EXIF fields describing the camera, lens, exposure, orientation and date. When Camera has location access, the file may also include latitude and longitude. Editing and sharing can add other information, and an image made by an AI tool may carry prompts, software names or Content Credentials. The exact fields depend on how the image was created and handled.",
          "Metadata is separate from the visible picture. It can travel with the original file in a message, cloud folder or website upload even when a preview looks ordinary. A recipient may be able to inspect those fields with photo software. Removing metadata does not hide a landmark or address visible in the pixels, so check the picture itself as well."
        ]
      },
      {
        heading: "Hide the location when sharing from Photos",
        paragraphs: [
          "For a quick share, open the photo in Apple Photos, tap Share, then tap Options near the top of the sharing sheet. If Location is enabled, turn it off before choosing AirDrop, Mail or another destination. The wording and placement can vary slightly by iOS release, so inspect the sheet each time rather than assuming a previous choice applies.",
          "This is a sharing control, not a permanent edit to the library original. The option controls whether location accompanies that particular shared copy; it does not necessarily remove camera, time, editing or other metadata. If you need a file stripped of more than location, work on a copy and use a metadata-removal workflow."
        ]
      },
      {
        heading: "Remove location from future iPhone photos",
        paragraphs: [
          "To stop new photos from recording coordinates, open Settings, go to Privacy & Security, choose Location Services, then Camera. Set location access to Never if you do not want the camera to tag photos. You can also choose a less restrictive permission on supported iOS versions, but do not assume that this changes the files already in your library.",
          "Disabling camera location has a trade-off: map-based photo organization and location memories may no longer work for new shots. You can keep location access on and use the Photos sharing option when appropriate, or switch it off before taking sensitive pictures. Review the setting after major system updates or when installing a different camera app."
        ]
      },
      {
        heading: "Make a clean copy for broader metadata removal",
        paragraphs: [
          "When you need to remove EXIF, GPS, XMP, IPTC, AI prompt data or embedded Content Credentials, start with a duplicate so your original remains available. Open the cleaner in Safari, select the copy from Photos or Files, wait for the scan report, and review the categories found before downloading the result. MediaPure accepts JPG, PNG and WebP images.",
          "A browser-based cleaner can be useful when you do not have a computer nearby, but consider the sensitivity of the file before uploading it to any online service. MediaPure processes image uploads in memory and keeps a cleaned download temporarily; read the privacy page if you need the full retention details. For a highly confidential image, an offline tool may be more suitable."
        ]
      },
      {
        heading: "Check the result before sending it",
        paragraphs: [
          "Save the cleaned copy to Files or Photos under a different name so you can tell it apart from the original. If location privacy is the concern, inspect the copy's information in Photos or a metadata viewer before sharing. A missing map location is useful evidence, but a full report gives you a better view of camera, date and descriptive fields as well.",
          "Avoid judging the result only by appearance: metadata is not visible in the image. Also compare the output dimensions and appearance with the source. A metadata cleaner should not blur the image, resize it or remove colour information required for normal display. Keep the original until you have opened the output successfully.",
          "If the photo came from a burst or a Live Photo, also check that the version you are sending is the one you cleaned. Libraries can surface a key photo or a still frame that looks identical to a neighbouring version with different details attached. Sending the wrong twin is an easy mistake, and only the file you actually attach matters to the recipient."
        ]
      },
      {
        heading: "Avoid common iPhone metadata mistakes",
        paragraphs: [
          "A screenshot of a photo usually has different metadata from the source, but taking a screenshot can reduce resolution and still leave a new timestamp or device details. It is not a reliable substitute for cleaning the original. Likewise, copying an image into a document or messaging app may alter metadata unpredictably, so test the actual exported file if privacy matters.",
          "Do not assume every sharing destination strips the same fields. Apps update their handling over time, and sending an original-quality attachment can behave differently from sending a compressed preview. A safer routine is to remove what you do not want to disclose before upload and review the file that you are actually attaching."
        ]
      },
      {
        heading: "Live Photos, bursts and edited versions",
        paragraphs: [
          "A Live Photo is not a single file in the way a still suggests. It pairs the image with a short moving clip, and each part can hold its own capture details. When you share or export only the still, the clip may stay behind; when a service handles the pair, both may travel. If location matters, check what your chosen sharing route does with the paired clip rather than assuming the still tells the whole story.",
          "Burst sequences and edited photos raise a similar point. A burst saves several frames from one moment, each capable of carrying the same capture details, and an edited picture may sit alongside its unedited original in the library. Cleaning or sharing one frame leaves the others untouched. Before publishing, decide which versions exist, which one you are actually sending, and whether the rest remain private in your library."
        ]
      },
      {
        heading: "How sharing routes treat metadata",
        paragraphs: [
          "Sharing routes differ in what they carry. AirDrop between Apple devices generally transfers the file much as it exists, so treat it as sending the original unless you used the share-sheet location option first. Email often sends the full file as an attachment, which can preserve embedded fields. Messaging and social apps vary the most: some compress the image and drop many fields, while others offer an original-quality mode that keeps far more.",
          "Shared albums add another variable. Photos added to an iCloud Shared Album may be resized and recompressed, and their handling of location and other fields can differ from your library originals; the behaviour has changed across iOS versions and should not be relied on as a cleaning method. Whatever the route, the safe assumption is the reverse of the hopeful one: treat every send as if the file keeps its metadata until you have checked the received or exported copy."
        ]
      },
      {
        heading: "Choose a practical privacy routine",
        paragraphs: [
          "For everyday pictures, use the share-sheet location toggle when you only need to omit coordinates from that send. For photos that must not be geotagged at all, turn off Camera location access. For client work, public portfolios or AI images, scan a copy for the wider set of metadata fields before it leaves your device.",
          "A simple way to choose between the three routes is to match the method to the risk. The share-sheet toggle is the fastest and suits everyday sends where only location concerns you. Turning off Camera location is a background safeguard, but it costs you map-based features. A cleaned copy takes the longest, yet it is the only route of the three that addresses the wider set of fields — device details, timestamps, editing history and credentials — in the file you actually send.",
          "The right choice depends on your goal: convenience, prevention or removal. None of these steps changes obligations to disclose AI-generated work, copyright details or other information required by a platform or contract. Preserve originals when dates, coordinates or credentials matter to your personal archive, evidence or creative process."
        ]
      }
    ],
    faqs: [
      { q: "Does turning off iPhone location remove GPS from old photos?", a: "No. It prevents or limits location tagging for future pictures. Use the Photos sharing option for a shared copy or clean an existing copy to remove its stored GPS fields." },
      { q: "Does the Photos share option remove all EXIF data?", a: "No. The Location toggle is focused on location sharing. Camera, time and other metadata may remain; use a metadata cleaner when you need a broader scan and removal." },
      { q: "Can I remove metadata without reducing photo quality?", a: "A lossless metadata cleaner removes file information while leaving the encoded image unchanged. Keep the original and check the output before sharing." },
      { q: "Does a Live Photo carry location as well as the still image?", a: "A Live Photo pairs a still with a short clip, and capture details, including location where it was recorded, can be held with the pair. Use the share-sheet location option for that send or clean a copy, and check what your sharing route does with the clip." },
      { q: "Does AirDrop remove metadata from photos?", a: "Do not rely on it doing so. AirDrop generally transfers the file much as it exists on your phone, so clean the copy first, or use the Photos share options, if you want fields omitted." }
    ]
  },
  {
    slug: "remove-exif-android",
    title: "How to Remove Photo Metadata on Android",
    seoTitle: "Remove EXIF on Android | MediaPure",
    description: "Find practical ways to remove Android photo EXIF, GPS location and camera details, and prevent location tags in future photos.",
    intro: "Android phones can save camera settings, timestamps, device details and location in photos, but menu names vary by manufacturer and Android version. This guide covers ways to prevent location tags, remove location from a copy, and clean broader metadata before sharing.",
    sections: [
      {
        heading: "Understand metadata on Android photos",
        paragraphs: [
          "EXIF is a standard group of fields that can describe how and when a photo was made. Depending on your camera app and permissions, that can include the phone model, lens and exposure values, capture time, orientation and GPS coordinates. Other apps can add captions, editing details or provenance information when they export a picture.",
          "The gallery preview does not show all of these fields. A person receiving the original file may inspect it with a photo editor or file utility. Location deserves special attention because coordinates can reveal a home, workplace or route. Metadata removal does not erase identifying details that are visible inside the photo itself.",
          "Photos taken with third-party camera apps can differ again. Some write fewer fields than the stock camera, while others add their own software names or editing markers, and a picture that has passed through a photo editor may carry a layered history from several apps. The file's current state, not the phone it happens to sit on, is what a recipient can read."
        ]
      },
      {
        heading: "Stop the camera from adding location",
        paragraphs: [
          "Open your camera app's settings and look for a control named Location tags, Save location, Geo tags or a similar phrase. Turn it off to stop new images from carrying GPS coordinates. The setting may live behind a gear icon, a swipe-down menu or the camera app's permissions, depending on the phone maker.",
          "You can also review Android Settings under Apps, Camera, Permissions, and limit location access. The exact path changes across Android releases and manufacturer interfaces. Disabling location access can affect map organization and other camera features. It does not rewrite the metadata already stored in existing photos, so treat it as prevention rather than cleanup."
        ]
      },
      {
        heading: "Remove location from an existing photo",
        paragraphs: [
          "Open the image in your gallery or photo library and inspect its Details or Info screen. Some gallery apps offer an edit-location control or a remove-location action. If you use Google Photos, available location-management controls can depend on where the image came from and the app version; check its current information panel and confirm whether you are editing the stored item or only a shared copy.",
          "If your app offers a location removal, save or export a separate copy and check its information again. Do not assume that editing a displayed map pin removes camera, timestamp or AI-related fields too. When a privacy-sensitive image is involved, verify the actual file that will be attached, not just an on-screen preview.",
          "One more distinction is worth knowing. A place name shown under a photo is not always recorded GPS: some libraries attach an estimated location based on other signals, or a place you added yourself. Removing embedded coordinates and removing a library's place label can be separate actions, so check both the file and the library entry if a location keeps appearing after you have cleaned one of them."
        ]
      },
      {
        heading: "Gallery apps are not all the same",
        paragraphs: [
          "Because Android is made by many manufacturers, the gallery app on your phone may handle location quite differently from another brand's. Samsung's Gallery, for example, has in recent versions offered ways to view location information in a photo's details and, in some cases, to remove it, while other makers' galleries may only display it. Menu names, and whether removal is offered at all, change between models and software updates, so treat any instructions you find, including these, as a starting point and confirm the behaviour on your own device.",
          "Google Photos sits across brands, which makes its behaviour more consistent but not identical for every picture. Its location controls can depend on whether the photo was backed up, whether the location was recorded by the camera or estimated from your location history, and whether you are viewing your own library item or something shared with you. Where Google Photos does offer to remove location, that action concerns location only; it is not a general metadata clean, and it may apply to the library item rather than to every copy you later export."
        ]
      },
      {
        heading: "Photos that arrive through messaging apps",
        paragraphs: [
          "Many of the photos on an Android phone were not taken with it. Pictures received through WhatsApp and similar messengers have usually been compressed by the service, and much of their original metadata may already have been dropped in transit. What survives varies, though, and a photo sent as a document or in an original-quality mode can keep far more. Do not assume a received picture is clean, and do not assume it is untouched, either.",
          "Re-sharing compounds the uncertainty, because each hop can strip, keep or add fields. If you forward a received photo, the file that leaves your phone is the one that matters. Where the content is sensitive, save the actual file, inspect it as you would one of your own, and clean a copy before passing it on, particularly if it shows someone else's home, children or workplace."
        ]
      },
      {
        heading: "Use a metadata remover for broader cleanup",
        paragraphs: [
          "For a broader cleanup, make a duplicate and open an image metadata remover in your browser. Choose the JPG, PNG or WebP file, review the scan, and download the cleaned copy. This workflow can remove more than GPS, including EXIF, XMP, IPTC, embedded thumbnails, AI generation details and C2PA Content Credentials where supported.",
          "MediaPure works in a modern mobile browser and does not require an app or account. It uploads a selected file for processing, so review the service's privacy terms before sending confidential material to any website. If a file cannot leave your device under your policy, use a trusted offline utility instead and verify its output independently."
        ]
      },
      {
        heading: "Verify the cleaned file on your phone",
        paragraphs: [
          "Download the result to a folder where you can distinguish it from the original. Reopen the output's Details screen and look for an absent location entry. If the cleaner provides a before-and-after report, compare the fields and note anything intentionally retained, such as a colour profile or orientation value needed for display.",
          "Test the output by opening it from the download location, not only from an app's cached preview. Some gallery apps may continue to show information they indexed earlier. If the information screen looks stale, refresh the library or inspect the exact exported copy with another trusted viewer."
        ]
      },
      {
        heading: "Avoid unreliable workarounds",
        paragraphs: [
          "Messaging apps may compress images or strip some information, but that behaviour differs by app, settings and whether you send a file as a photo or as an original attachment. A screenshot can remove some source fields while lowering resolution and adding new capture information. Neither method gives a dependable, complete metadata audit.",
          "Renaming a file extension does not remove metadata, and deleting a location field in a gallery does not necessarily erase all EXIF. Prefer a method that reports what it found and creates a separate result. Keep the unmodified original until the cleaned copy opens correctly and you have checked its important properties.",
          "Backups and memory cards deserve the same attention. A photo copied to an SD card, a computer or a cloud backup usually keeps its embedded metadata, because copying a file does not rewrite its contents. Cleaning the copy on your phone does nothing to those duplicates. If a sensitive image exists in several places, decide which copies are for sharing and clean those, while keeping the archive copies private rather than sitting in shared or synced folders."
        ]
      },
      {
        heading: "Build a repeatable sharing habit",
        paragraphs: [
          "For casual sharing, turn off camera location if you rarely need geotagging and inspect the share controls before sending. For listings, public profiles, journalism, client deliveries or sensitive travel images, use a clean-copy workflow and confirm GPS is gone. Keep the original in a private archive if its location or capture details matter to you.",
          "A few seconds of review can prevent accidental disclosure without changing the visible image. Remember that removing embedded metadata is not a way to prove how a photo was made, and it does not change any disclosure rule that applies to AI-generated or edited content."
        ]
      }
    ],
    faqs: [
      { q: "How do I stop Android photos saving GPS?", a: "Turn off Location tags or Save location in the camera app, or restrict the camera's location permission. Names and menu paths vary by phone." },
      { q: "Will turning off location remove metadata from existing photos?", a: "No. It affects future captures. Existing files need a location-removal action or a separate metadata-cleaning workflow." },
      { q: "Can an Android browser remove more than GPS?", a: "Yes, a supported online cleaner can scan and remove several metadata categories from a copy. Consider file sensitivity and verify the downloaded result." },
      { q: "Does WhatsApp remove metadata from photos I receive?", a: "Much of it is often dropped when the service compresses a photo, but behaviour varies, and original-quality or document sends can preserve more. Inspect the actual file before re-sharing it." },
      { q: "I cleaned a photo on my phone. Are my backups clean too?", a: "No. Copies on an SD card, a computer or in a cloud backup keep their original metadata. Clean each copy you intend to share, and keep archive copies private." }
    ]
  },
  {
    slug: "remove-exif-windows",
    title: "How to Remove Photo Metadata on Windows",
    seoTitle: "Remove Photo Metadata on Windows | MediaPure",
    description: "Remove photo EXIF, GPS and personal properties on Windows using File Explorer or a lossless metadata-cleaning workflow.",
    intro: "Windows includes a built-in way to remove many file properties, while a dedicated metadata remover can report a wider range of embedded image data. Choose based on whether you need a quick copy, a detailed scan or an offline process.",
    sections: [
      {
        heading: "What Windows can see in photo metadata",
        paragraphs: [
          "Windows File Explorer can display common properties such as camera make, capture date, dimensions and GPS location when the file exposes them in a supported format. It does not necessarily show every embedded block. EXIF, XMP, IPTC, editing history, AI prompt fields and Content Credentials can be stored in places that ordinary file property panels do not summarize.",
          "A file's visible name, thumbnail or modified date is not a complete privacy check. Copies also behave differently from originals: copying a file in Explorer preserves embedded metadata, while opening and exporting it through an editor may rewrite some fields and recompress the picture. Know which method you are using and verify the saved output."
        ]
      },
      {
        heading: "Remove common properties with File Explorer",
        paragraphs: [
          "In File Explorer, right-click the photo and choose Properties, then open the Details tab. Select Remove Properties and Personal Information. Windows offers a choice to create a copy with possible properties removed, or remove selected properties from the existing file when supported. Creating a separate copy is safer because it leaves the original untouched.",
          "The built-in action is convenient for common Windows-readable properties, but it is not a promise that every metadata format or private block is removed. The available options depend on file type and installed codecs. For images that contain AI prompts, C2PA data or less common vendor fields, use a scanner that explicitly checks those categories and review what it reports.",
          "The built-in removal is also at its most complete with JPEG photographs, the format the Details tab was designed around. PNG and WebP files expose fewer editable properties to Windows, and some fields in those formats are not offered for removal at all. If the dialog shows little for a PNG, that reflects what Windows can edit, not how much metadata the file actually contains."
        ]
      },
      {
        heading: "Keep the original and identify the output",
        paragraphs: [
          "Choose the copy option, save the result in a separate folder, and give it a clear name such as photo-share-clean.jpg. Open both files to make sure the cleaned copy is intact and has the expected dimensions. If you edit the original in place, you lose the straightforward fallback and may have trouble recovering capture information you still wanted.",
          "Windows may retain some basic properties for sorting or may show cached values in the Details view. Check the output file itself after refreshing the folder. A successful removal of one visible field does not prove that all hidden metadata is gone, especially if the file contains additional embedded profiles or application-specific data."
        ]
      },
      {
        heading: "Use a dedicated cleaner for a fuller scan",
        paragraphs: [
          "For a broader review, select a copy of the photo in an image metadata remover. The report should identify categories such as EXIF, GPS, XMP, IPTC, thumbnails and Content Credentials before it writes a result. A container-level, lossless workflow removes those blocks while preserving the compressed picture rather than opening and recompressing it.",
          "MediaPure runs online and supports JPG, PNG and WebP, so the file must be uploaded to be processed. Check the privacy details before sending sensitive material. Organizations that require local-only processing can use a vetted desktop command-line tool instead, keeping the original and output separate and scanning the output with an independent reader."
        ]
      },
      {
        heading: "Check metadata with a second method",
        paragraphs: [
          "After cleanup, reopen Properties and the Details tab to check the common fields that Windows understands. For a more detailed audit, use a trusted metadata reader to inspect every group in the output. Compare before and after lists, paying special attention to coordinates, device serials, creator names, software names, timestamps and descriptions.",
          "Also compare file dimensions and open the image in a viewer. A lower file size is normal after removing previews or metadata, but an unexpected change in dimensions or visible quality suggests that the file was resized or recompressed. If the result does not match expectations, do not publish it; use another copy and investigate the report.",
          "Using a genuinely different viewer for the second check matters. Two panels that both draw on the same Windows property store will agree with each other and can share the same blind spots. A reader that parses the file's own EXIF, XMP and IPTC groups independently is a stronger test, because it reports what is actually in the file rather than what one operating system chose to index."
        ]
      },
      {
        heading: "Why screenshots and exports are not equivalent",
        paragraphs: [
          "Taking a screenshot of a photo may discard some source metadata, but it creates a new image with a new capture date and possibly other device information. It also reduces resolution and can change colour or compression. This is a poor replacement for a verified clean copy when you need the original quality.",
          "Likewise, sending a photo through a social or messaging service may strip certain fields, but sending an original file can preserve them. Platform handling changes and varies by route. Clean the exact file you plan to send, then inspect that copy instead of relying on assumptions about the recipient's service."
        ]
      },
      {
        heading: "Cleaning several photos at once",
        paragraphs: [
          "The Properties dialog works on one file at a time. You can select several photos and open Properties, but the Details view then shows only the values the selection happens to share, and the removal page is aimed at a single file's properties. For a holiday's worth of pictures, or a folder of product photos for a listing, repeating the same clicks file by file is slow, and it is easy to lose track part-way through of which files were actually done.",
          "Batch-capable tools approach the job differently: you select a group of files — MediaPure takes up to 20 images at a time and can return them together as a ZIP — and each file is scanned and cleaned with the same rules. Whichever route you use, keep the batch in its own output folder, spot-check several of the results rather than only the first, and confirm that the count of cleaned files matches the count you started with before you publish or delete anything."
        ]
      },
      {
        heading: "What the Windows dialog does not remove",
        paragraphs: [
          "The Details tab only reaches the properties Windows itself understands, and several common hiding places sit outside its view. XMP packets can hold captions, ratings, creator details and a record of edits. IPTC fields can carry headlines, bylines and copyright. PNG files store information in text chunks, which is where many AI image tools write the prompt and the generation settings, sometimes along with far more.",
          "A photo can therefore come back from the Windows dialog with its visible properties cleared and its most revealing fields intact. This matters most for AI-generated images, screenshots saved as PNG, and pictures that have passed through professional editors, all of which lean on exactly the formats the dialog does not summarise. If those categories matter to you, the check has to be done by a tool that names them, not by the absence of entries in a Windows panel."
        ]
      },
      {
        heading: "A sensible Windows sharing checklist",
        paragraphs: [
          "Before publishing, make a copy, scan it, remove only the metadata you do not want to disclose, and confirm that the visible image still looks right. Check the downloaded or exported version rather than a temporary preview. If the photo documents an event, preserve the original with its capture information in a secure archive.",
          "For a one-off image, Explorer may be enough to remove common properties. For repeated work or sensitive images, use a workflow that shows a field-by-field report and confirms that the output is intact. Metadata removal does not erase text, signs, reflections or other clues visible in the pixels, so review the content too.",
          "For repeated work, it helps to learn what your own camera normally writes. Clean one sample photo, note the categories the report lists, and use that as your reference for later files. An unexpected new category, such as a location group from a borrowed camera or a different phone, then stands out instead of passing unnoticed among familiar entries."
        ]
      }
    ],
    faqs: [
      { q: "Does Windows Remove Properties remove all EXIF?", a: "It removes supported properties exposed to Windows, but may not cover every embedded metadata block. Verify the output with a reader or a broader scanner." },
      { q: "Should I choose a copy or edit the original?", a: "Create a cleaned copy. Keeping the original gives you a fallback and preserves capture details for your archive." },
      { q: "Will File Explorer's removal change image quality?", a: "Removing properties is intended to edit file information, but use a copy and compare the output. Avoid workflows that re-save or recompress the image if preserving image data is important." },
      { q: "Can I remove properties from many photos at once in Windows?", a: "The built-in dialog is effectively one file at a time. For a folder of images, use a tool that accepts a batch, save the results separately, and spot-check several of the outputs." },
      { q: "Why does my cleaned PNG still show a prompt in another viewer?", a: "Prompts are often stored in PNG text chunks, which the Windows property dialog may not display or remove. Use a cleaner that scans text chunks, and verify with a full metadata reader." }
    ]
  },
  {
    slug: "remove-exif-mac",
    title: "How to Remove Photo Metadata on Mac",
    seoTitle: "Remove Photo Metadata on Mac | MediaPure",
    description: "Learn how to remove EXIF and GPS from Mac photos, what Preview and Photos can do, and how to verify a clean copy.",
    intro: "Mac users can manage location visibility in Photos and use local utilities for file-level cleanup. Because Preview and Photos workflows differ by macOS release and export format, this guide explains what to check and how to make a separate copy before sharing.",
    sections: [
      {
        heading: "What metadata your Mac photo may contain",
        paragraphs: [
          "A camera or phone image can contain EXIF details such as the capture time, device, lens, exposure and orientation. If location services were enabled, GPS coordinates may be embedded too. Editing software can add author, copyright, caption or software fields, while AI-generated files may include prompts or Content Credentials.",
          "The Finder preview and Quick Look do not reveal every field. A file attached as an original can carry its embedded data even if an app showed only the image. Metadata is separate from the visible contents, so removing it will not obscure a house number or recognizable location in the picture itself."
        ]
      },
      {
        heading: "Review location in Photos",
        paragraphs: [
          "Open an image in Photos and view its information panel to see whether a location is associated with it. Depending on macOS, you may be able to adjust or remove the displayed location from the library item. Check Apple's current instructions for your version before relying on a specific menu name, because the interface changes over time.",
          "A location change in the Photos library is not necessarily the same as stripping every metadata block from an exported original. For a quick share, inspect the export or sharing options for a location control. If you need broad removal of camera details, captions, timestamps or embedded credentials, create a copy and use a file-level metadata cleaner."
        ]
      },
      {
        heading: "Export a separate image copy",
        paragraphs: [
          "When exporting from Photos, use a new filename and a destination folder separate from your originals. Review available export choices, then inspect the resulting file rather than assuming a library setting changed every field. Keep the original untouched until you confirm the output opens correctly and has the appearance and dimensions you expect.",
          "Preview is useful for viewing and making image edits, but a normal export may recompress some formats and does not always provide a complete metadata-removal audit. If preserving image data matters, avoid unnecessary resaving. The precise outcome can depend on the image format, application version and chosen export settings."
        ]
      },
      {
        heading: "Use a metadata cleaner for broader removal",
        paragraphs: [
          "A dedicated metadata cleaner scans the image and lists fields before removing them. Select a copy in the browser tool, review categories such as EXIF, GPS, XMP, IPTC, AI prompt data and C2PA, then download the new file. A lossless cleaner removes metadata blocks without recompressing the visible image, and should verify the resulting image before offering it.",
          "MediaPure supports JPG, PNG and WebP in a web browser. Using an online service means uploading the selected image, so consider sensitivity and your organization's data rules. If a file must remain on your Mac, choose a reputable offline utility, save to a new path and use a separate metadata reader to check the output."
        ]
      },
      {
        heading: "What Preview's Inspector can and cannot do",
        paragraphs: [
          "Preview's Inspector is the first place many Mac users look, and it is genuinely useful for seeing a summary of a photo's EXIF information. Its location handling, however, is narrow: where a GPS-related view appears, the removal it offers concerns the location information, and using it does not clear the wider set of fields the Inspector itself lists, such as device details and timestamps, let alone XMP, IPTC or credential data that it may not display at all.",
          "Treat Preview as a viewing tool with a small location edit attached, not as a metadata cleaner. The details it shows also depend on the file format and the macOS version, and an ordinary export from Preview may recompress the image while still leaving fields in place. If you use the Inspector, use it to understand the file; then make, and separately verify, a cleaned copy with a method that reports the full set of categories."
        ]
      },
      {
        heading: "Export settings decide what leaves Photos",
        paragraphs: [
          "When you export from Photos, the options in the export dialog, which depending on macOS version and export type can include an 'Include location information' checkbox, decide what the exported file carries. Leaving location included writes the coordinates into the copy even if you were careful everywhere else. Unticking it addresses location for that export; it promises nothing about camera details, captions or other fields in the same file.",
          "Remember the direction of travel: export settings change the copy, never the library original. The original in Photos keeps its metadata, which is what you want for your archive, but it also means a cleaned export sitting next to the original is easy to confuse with it. A clear filename and a separate folder are not bureaucracy; they are how you avoid attaching the library version by mistake."
        ]
      },
      {
        heading: "Offline option for technical users",
        paragraphs: [
          "A command-line metadata tool can offer precise local control for users comfortable with Terminal. Install software only from a source you trust, read its documentation for your version, and test on a disposable copy first. Some commands edit files in place unless an output path is specified, so confirm the syntax before running it on important originals.",
          "After producing the clean copy, inspect it using a second command or application rather than trusting the command's success message alone. Check for GPS, camera identifiers, time, creator fields and embedded profiles. Local tools may treat C2PA and proprietary metadata differently, so confirm the categories supported by the version you installed."
        ]
      },
      {
        heading: "Verify the image you are about to share",
        paragraphs: [
          "Open the output from Finder and compare it with the source. Check dimensions, orientation and colour appearance. Use an information panel or metadata reader to confirm that location and other sensitive fields are absent. If the viewer shows stale library information, inspect the file at its exported path rather than a previously indexed Photos item.",
          "A smaller output is often expected because a thumbnail or metadata block was removed. A major size or dimension change may indicate that the photo was re-encoded or resized. Do not discard the original until you know the cleaned file is valid and have considered whether capture data has archival value."
        ]
      },
      {
        heading: "Avoid relying on screenshots or app behavior",
        paragraphs: [
          "A screenshot can create a new file, but it lowers quality, changes dimensions and adds fresh device and time details. It does not provide a clear audit of the remaining metadata. Similarly, a message app may strip fields for a compressed preview yet preserve them when you send an original attachment.",
          "Instead, clean the exact copy you will upload and verify that copy. For recurring work, make a small checklist: duplicate, scan, remove, inspect the output, and retain the source privately. This is more reliable than guessing what an export or social platform did behind the scenes.",
          "Finder offers its own shortcuts that are worth knowing about, with limits to match. Right-click Quick Actions and Automator workflows can convert or export images in a batch, which is convenient for routine copies, but their metadata handling depends on how the workflow was built, and they do not audit what remains afterwards. A workflow built around a proper cleaning step can be reliable; a generic convert action is just another export, and its output needs the same verification as any other."
        ]
      },
      {
        heading: "Protect location without losing useful originals",
        paragraphs: [
          "If you use location-based albums, keep geotagging enabled for private originals and clean only the copies meant for public sharing. If you rarely need that feature, review the camera and location permissions on your devices to reduce new location tagging. Neither choice is permanent for every app, so check individual camera software.",
          "Metadata removal is a privacy step, not a substitute for content review. Crop or obscure visible addresses only when you have permission and a legitimate reason, and follow any disclosure rules for AI-generated work. Keep originals securely when timestamps, authorship or credentials matter to your records.",
          "It is also worth checking photos in the same library that came from other devices. A library can hold pictures from a camera, another person's phone and assorted downloads side by side, and each source writes its own fields. Cleaning the phone photos you remember taking does not cover the rest, so judge by the file you are about to export, not by the album it sits in."
        ]
      }
    ],
    faqs: [
      { q: "Does Preview on Mac remove all photo metadata?", a: "Do not assume a standard Preview export removes every field. Export behavior varies; inspect the saved copy with a metadata reader or use a scanner that lists fields." },
      { q: "Can I remove GPS from a photo in Apple Photos?", a: "Photos may let you adjust or remove a library location, depending on macOS. Verify the exported file if you need to ensure the embedded GPS value is gone." },
      { q: "How do I keep a private original?", a: "Duplicate the image and clean the copy. Store the original in a private archive if its capture details are useful to you." },
      { q: "Does unticking 'Include location information' remove all metadata?", a: "No. It controls location for that one export. Other fields — device, time, captions, credentials — need a file-level scan and removal, and the exported copy should be checked." },
      { q: "Should I clean the exported copy or the Photos original?", a: "Clean a copy and leave the library original intact. Export settings and cleaning both apply to copies; the original keeps its metadata for your records." }
    ]
  },
  {
    slug: "remove-gps-from-photo",
    title: "How to Remove GPS Location from a Photo",
    seoTitle: "Remove GPS from a Photo | MediaPure",
    description: "Remove GPS coordinates from photos before sharing, understand what location metadata reveals and prevent future geotagging.",
    intro: "A geotag can place a photo at a home, workplace, school or point along a trip. Learn how to check for GPS fields, remove them from a copy, prevent future camera tagging and verify what you are about to publish.",
    sections: [
      {
        heading: "How GPS ends up inside a photo",
        paragraphs: [
          "When a camera app has permission to use location, it may write latitude and longitude into EXIF fields at capture time. Some devices also store altitude, direction or related location values. The recipient can extract coordinates from the original file even though the image itself looks unchanged and the location is not printed on the picture.",
          "Location data can come from a phone, camera, drone or editing workflow. Not every image has GPS, and a missing map in a gallery does not prove that every coordinate or location field is absent. Check the actual file before sending it, especially for photos taken at a private home or a sensitive event.",
          "Coordinates can also be stored in more than one place in the same file. Most sit in the EXIF GPS fields, but a file that has passed through other software may carry location in XMP as well. A removal that clears only the best-known field can leave a second copy behind, which is one reason verification should look at the file's location fields as a group rather than checking a single entry."
        ]
      },
      {
        heading: "Check whether a photo contains location",
        paragraphs: [
          "Open the photo's information or details panel in your gallery app and look for a map, place name or coordinates. On desktop, file property panels may show GPS for common image types. These interfaces are useful for a quick check, but a dedicated metadata reader can reveal additional location fields that a basic viewer does not display.",
          "Inspect the source and the exported copy separately. A gallery can show location based on its own library database, while an image file may have had its metadata changed. If a result still appears geotagged, verify the precise downloaded file with another trusted viewer before sharing or deleting anything."
        ]
      },
      {
        heading: "Remove GPS from an existing image",
        paragraphs: [
          "Create a duplicate first. Some photo libraries provide a remove-location or hide-location action, and some share sheets can omit coordinates from a particular send. These controls vary by operating system and may affect only the library record or the shared copy. Confirm the exported file before relying on them for a public post.",
          "A metadata remover can scan and remove GPS fields from a copy along with other embedded information. Upload a JPG, PNG or WebP, review the detected fields, and save the clean result under a different name. A lossless workflow should preserve image data while changing metadata; always keep the original until the output has been checked."
        ]
      },
      {
        heading: "Prevent future geotagging",
        paragraphs: [
          "On a phone, disable camera location access or turn off Location tags in the camera app settings. Menu names differ by manufacturer and software version. On a dedicated camera, check its GPS, wireless and location-recording options. Disabling location can affect geotag-based organization, so decide whether you want to prevent every tag or only remove it from selected shares.",
          "Review permissions after installing another camera application or after a system update. An app may have its own location setting in addition to the operating system permission. If you use a separate editing or export app, test whether it copies coordinates from the source into the new file.",
          "Cleaning is not always the last step a file goes through, either. Some editors and export tools copy location from the source photo into every new export, and a few can add a place from their own library records when you assign one. If you clean a photo and then edit the cleaned copy, check the resulting export as if it were a fresh file: the workflow that follows cleaning can quietly put back what cleaning took out."
        ]
      },
      {
        heading: "How precise a photo's coordinates can be",
        paragraphs: [
          "A phone with a good view of the sky can record a position accurate to a few metres, close enough, in many cases, to distinguish one house from its neighbours or to show which entrance of a building was used. Accuracy varies with conditions: indoors, in streets lined with tall buildings or under heavy tree cover, the recorded point can drift, and some devices record a less certain fix rather than none at all.",
          "The coordinate rarely travels alone. Combined with the capture timestamp it can suggest a pattern rather than just a place: a home in the early mornings, a workplace through the day, a school at the same times each week. One photo may reveal little; a set of photos, each innocently taken, can sketch a routine. That is why location deserves attention even in pictures that seem ordinary, and why cleaning a whole set matters more than cleaning a single favourite."
        ]
      },
      {
        heading: "Location in bursts, Live Photos and video stills",
        paragraphs: [
          "Location is not confined to single still photographs. Every frame in a burst sequence can carry the same coordinates, so cleaning or sharing one frame says nothing about the rest of the set. A Live Photo pairs a still with a short clip, and the pair can hold capture details for both parts; check what your sharing route actually sends before assuming the still image is the whole file.",
          "Video raises the stakes further. A clip can hold a location in its container tags, and footage from phones, action cameras and drones may also include a timed track that logs position throughout the recording. A still frame exported from such a video can inherit details from its source, too. If you publish video, or frames taken from it, give it the same routine as a photo: check the actual file, not the preview."
        ]
      },
      {
        heading: "Remove other identifying metadata too",
        paragraphs: [
          "GPS is only one category. A photo may still contain a camera model, serial number, lens, capture timestamp, creator name, copyright, editing software, comments, a thumbnail or an AI prompt after its coordinates are removed. Some images also carry signed Content Credentials. Consider what the recipient can learn from all of these fields, not just the map.",
          "A fuller scanner groups findings so you can decide what is relevant. The right amount of removal depends on context: a family archive may need original dates, while a public listing should not reveal a private address. Keep the unmodified file privately when its history is useful, and publish a cleaned copy."
        ]
      },
      {
        heading: "Check for location after cleaning",
        paragraphs: [
          "Open the exact output file's details and confirm there is no GPS section, map or coordinate. If the cleaner gives you a report, check that location was found and removed or that no location fields were present. A blank map in an app is not enough if the app uses a stored place record instead of reading the file.",
          "Avoid using only a screenshot as proof: it may remove some original coordinates while creating a new file with different quality and metadata. Likewise, social networks can change image handling. Verify the version you downloaded before it goes into an email attachment, shared folder or public website."
        ]
      },
      {
        heading: "Understand what metadata removal cannot hide",
        paragraphs: [
          "Removing GPS does not change landmarks, house numbers, street signs, uniforms, reflections or other clues visible in the image. If the content itself identifies a location, review the visible scene separately and edit only when you have permission and a legitimate reason. Metadata cleaning is not image redaction.",
          "It also does not make an image anonymous or guarantee that nobody can infer where it was taken. People may recognize a place or combine the picture with other public information. Treat GPS removal as one practical privacy measure, alongside careful sharing choices and account security."
        ]
      },
      {
        heading: "Make a repeatable pre-share check",
        paragraphs: [
          "Before posting, duplicate the photo, scan for location and other fields, remove what you do not want to disclose, and open the cleaned copy. Check the visible frame for clues, confirm the image still looks right, and attach that copy rather than the original. For a large batch, use a tool that makes it clear which files succeeded.",
          "Keep originals in a private archive if location is important for memories, insurance or documentation. Make a separate public copy for publishing. This avoids permanently losing useful history while reducing the chance that coordinates leave your device by accident."
        ]
      }
    ],
    faqs: [
      { q: "Can someone see GPS in a photo I send?", a: "They may be able to if coordinates remain in the original file. Some apps strip location and others preserve it, so verify the exact attachment." },
      { q: "Does removing GPS change the picture?", a: "A metadata-only removal does not need to alter visible pixels. Keep a copy and confirm that dimensions and appearance are unchanged." },
      { q: "Will turning off location remove GPS from old pictures?", a: "No. Camera settings affect future captures; existing photos need a separate location-removal or metadata-cleaning step." },
      { q: "How accurate is the GPS in a photo?", a: "Often within a few metres outdoors, and less certain indoors or in built-up areas. Combined with the timestamp, even an approximate fix can reveal a home, a workplace or a routine." },
      { q: "Can location come back after I remove it?", a: "Yes, if a later editor or export step copies it from the source file or from a library record. Clean after editing, or re-check any export made from a cleaned file." }
    ]
  },
  {
    slug: "remove-c2pa-content-credentials",
    title: "How to Remove C2PA Content Credentials from an Image",
    seoTitle: "Remove C2PA Content Credentials | MediaPure",
    description: "Understand C2PA Content Credentials, when removal is appropriate and how to remove embedded credential metadata from a copy.",
    intro: "C2PA Content Credentials are signed provenance information that can describe an image's origin or editing history. This guide explains what the credentials do, why removing them has trade-offs and how to make a clean copy while preserving your original.",
    sections: [
      {
        heading: "What C2PA Content Credentials are",
        paragraphs: [
          "C2PA is an open technical standard for attaching verifiable provenance information to media. A Content Credential can record claims about where an asset came from, what tools handled it or how it was edited. The credential is cryptographically signed, so compatible software can check whether the recorded manifest has been altered.",
          "Credentials are not the same as a visible watermark, and not every image has one. They may be embedded in the file or represented through a linked manifest, depending on the workflow. Other metadata such as prompts, author fields and camera data is separate, even when a creator or platform places several types of information in one file."
        ]
      },
      {
        heading: "Check for a credential before you decide anything",
        paragraphs: [
          "Removal should start with finding out whether a credential is there at all. Some cameras, phones and editing apps display a Content Credentials indicator, or an entry in an information panel, when a manifest is present, but many ordinary viewers show nothing. The absence of a badge in a photo app is not evidence that a file has no credential; it may only mean that the app does not look for one.",
          "For a definite answer, use a verification tool built for the purpose. A public verify service (verify.contentauthenticity.org) lets you submit an image and see the credentials it carries, who signed them and what the manifest records, and some editors and standalone utilities offer similar inspection. Check the original file rather than a copy that a platform may already have processed, and note what you find before cleaning, because afterwards there will be nothing left in the cleaned copy to inspect."
        ]
      },
      {
        heading: "Consider the trade-offs before removing a credential",
        paragraphs: [
          "A credential can help viewers understand an asset's provenance and may be expected by a client, publisher or platform. Removing it can break the associated verification chain or discard useful evidence about the source and editing history. If authenticity, attribution or auditability matters, retain the credentialed original and check the applicable requirements before making another copy.",
          "There are also privacy reasons to limit what travels with a file, and a credential may disclose a tool or process. The right choice depends on your purpose and obligations. Do not present a file as having a verified history after removing or invalidating its provenance, and do not use metadata removal to evade a platform's AI disclosure rules.",
          "There are situations where the right answer is simply not to remove it. If a client commissioned the work and expects a verifiable file, if a publisher's submission rules call for credentials to be intact, or if a platform requires provenance information or AI disclosure as a condition of posting, removing the manifest works directly against your obligations. In those cases keep the credential, raise any privacy concern with the other party, and share a version whose handling you have agreed, rather than quietly stripping the record."
        ]
      },
      {
        heading: "Know what metadata removal changes",
        paragraphs: [
          "A cleaner can remove an embedded C2PA manifest and other readable metadata without changing image pixels. It does not remove a visible label added to the picture itself, an invisible watermark encoded into pixels, or a separate record maintained by a platform. It also cannot guarantee that viewers or detection systems will not infer how an image was made.",
          "Removing an embedded credential affects the information available for provenance verification. Some workflows may restore or reattach credentials when a file is exported later. For these reasons, preserve the untouched source and identify the cleaned output accurately; treat it as a separate version rather than a replacement for the original."
        ]
      },
      {
        heading: "Make a separate copy before cleaning",
        paragraphs: [
          "Start by locating the original and checking whether it contains a Content Credential. If the file is important for an audit, client handoff or creative record, archive it securely before proceeding. Create a duplicate to use for sharing, and confirm that you are authorized to modify the copy and that removal does not conflict with a contract or publishing policy.",
          "A broader metadata report can also show whether the image contains EXIF, GPS, XMP, IPTC, prompts or creator fields in addition to C2PA. Review these findings before removing anything. You may decide to retain some information, such as copyright attribution, while removing coordinates or unrelated personal details."
        ]
      },
      {
        heading: "Remove embedded C2PA information from the copy",
        paragraphs: [
          "For a supported JPG, PNG or WebP file, open a metadata remover, select the duplicate and review the scan. Confirm that Content Credentials or C2PA is listed, then download the cleaned result. A lossless workflow removes metadata blocks while preserving the encoded image data and should verify the image before making it available.",
          "MediaPure is an online service, so the chosen copy is uploaded for processing. Read its privacy and retention information before sending confidential or contract-restricted material. For offline requirements, choose a trusted local utility whose documentation explicitly covers C2PA for your file type, and verify its output with compatible software."
        ]
      },
      {
        heading: "Verify both image integrity and credential status",
        paragraphs: [
          "Open the output and check that it displays correctly, retains the expected dimensions and has no unexpected visual changes. Use a metadata reader to check whether the embedded manifest remains. A normal photo viewer may not expose credentials, so use a compatible Content Credentials inspector when verification matters.",
          "Keep the credentialed original and the cleaned copy clearly named. Document which copy has provenance data and which one does not, especially in a team workflow. If credentials reappear after another export, inspect the new export rather than assuming the earlier cleanup carried through every stage.",
          "Keep a short note with the pair of files: where the credentialed original is stored, what the manifest recorded, and when the cleaned copy was made. In a team, that note is often the difference between an intentional, documented removal and a mystery that a client or an editor has to unpick months later."
        ]
      },
      {
        heading: "What is still true after a credential is removed",
        paragraphs: [
          "Removing the manifest removes the manifest, nothing more, and it is worth being precise about the rest. Any invisible watermark encoded into the pixels stays exactly where it was, because a metadata cleaner never touches pixels. A visible label added to the picture itself stays. And copies of the file held elsewhere — by the service that generated it, by a client's system, or by a platform you already uploaded to — keep whatever credentials and records they hold.",
          "Verification changes accordingly. A checker examining the cleaned copy should find no credential to validate, which is different from finding one that fails: the copy simply makes no provenance claim at all. Do not describe that absence as evidence about where the image came from, in either direction. And if a platform requires a credential, or a disclosure, for publication, a file without one may simply not meet the requirement."
        ]
      },
      {
        heading: "Handle AI labels and disclosure responsibly",
        paragraphs: [
          "Removing file metadata is not the same as changing what an image depicts, and it does not establish that an image is camera-made. An AI-generated image can still contain visible characteristics, embedded watermarks or records held by the service that created it. A missing credential should never be described as proof of an image's origin.",
          "Follow the policies of the site where you publish and the terms agreed with clients or collaborators. Some rules require disclosure independent of file metadata. If transparency is important to your audience, preserve the credential or add a clear explanation through an appropriate channel rather than relying on the presence or absence of one file field."
        ]
      },
      {
        heading: "Choose a workflow that fits your purpose",
        paragraphs: [
          "For ordinary privacy cleanup, make a copy, scan all fields and remove only what you do not need to share. For evidence, journalism, regulated work or provenance-sensitive creative projects, preserve the original and consult the relevant policy before altering credentials. Store originals securely and record which version you publish.",
          "The safest workflow is transparent about what changed. Check the destination requirements, avoid overwriting the only source, and verify the exported copy. Metadata removal can reduce incidental disclosure, but it cannot erase every form of attribution, watermark or history associated with an image."
        ]
      }
    ],
    faqs: [
      { q: "Does removing C2PA make an AI image undetectable?", a: "No. It removes embedded credential data when supported, but does not remove visible or invisible image watermarks, external records or signals in the pixels." },
      { q: "Should I keep the original Content Credential?", a: "Keep the credentialed original when provenance, attribution or auditability may matter. Clean a separate copy only when appropriate for your sharing purpose." },
      { q: "Does removing C2PA change image quality?", a: "Removing metadata does not require changing pixels. Use a lossless process, retain the original and verify the cleaned output." },
      { q: "How can I tell whether an image has Content Credentials?", a: "Some apps show a credentials indicator, but many viewers show nothing at all. For a definite answer, use a dedicated verification tool, such as the public Content Credentials verify service, on the original file." },
      { q: "If I remove the credential, is every trace of origin gone?", a: "No. Invisible watermarks in the pixels, visible labels and records held by services or platforms are unaffected. Only the embedded manifest in that particular copy is removed." }
    ]
  },
  {
    slug: "remove-gopro-drone-telemetry",
    title: "How to Remove GPS Telemetry from GoPro and Drone Videos",
    seoTitle: "Remove GoPro & Drone GPS Telemetry | MediaPure",
    description: "Learn what GPS telemetry GoPro cameras, drones and phones record inside video files, why ordinary metadata tools leave it behind, and how to remove it before you share a clip.",
    intro: "Action cameras and drones record more than video. Alongside the picture, many of them write a timed track of GPS positions and sensor readings that can retrace an entire ride, flight or walk. This guide explains where that telemetry hides, why it survives ordinary cleaning, and how to remove it properly.",
    sections: [
      {
        heading: "What telemetry actually is",
        paragraphs: [
          "Telemetry is a stream of sensor readings stored inside the video file, each one stamped with the moment it was taken. GoPro cameras record it in a format called GPMF, which can carry GPS position, speed, altitude and motion data. Drones commonly record flight data as well, sometimes in a subtitle-style track inside the file, sometimes as a separate sidecar file, alongside the usual container tags naming the aircraft and camera.",
          "Phones do the same thing in their own formats: Apple uses a timed track type called mebx, Google's is CAMM, and Sony writes RTMD. The names differ, but the structure is shared — a third track next to the video and audio tracks, quietly logging where the camera was, several times a second, from the moment recording started until it stopped."
        ]
      },
      {
        heading: "A route, not a point",
        paragraphs: [
          "A photo with GPS gives away one location: the spot where you stood for a second. A video with telemetry gives away a journey. Played back on a map, the track draws the road you took, the trail you rode and the street where the clip began — which, for a video that starts in a driveway or outside a front door, is effectively a home address with a timetable attached.",
          "The other readings add context a single coordinate cannot. Speed and altitude show how you travelled, pauses show where you stopped, and the timestamps show when. None of this is visible in the picture, and none of it is mentioned by most players, so people routinely publish it without realising it was ever recorded, let alone embedded in the file they shared.",
          "The sharing routes make it worse. Clips posted to a streaming site are transcoded before anyone watches them, but action-camera and drone footage is constantly shared as files: sent to friends at original quality, dropped into cloud folders, attached to forum posts, even included with a second-hand camera or drone as sample footage. In every one of those cases the file travels intact, and whoever receives it receives the whole recorded journey with it, whether or not they go looking for it."
        ]
      },
      {
        heading: "Why most cleaning tools leave the track behind",
        paragraphs: [
          "Most metadata tools were built to edit tags: titles, dates, device names and the other text fields in a container. A telemetry track is not a tag. It is a separate stream inside the file, so an instruction to clear the metadata simply never touches it. The tool reports the file clean because every field it knows how to read is empty, while the track it cannot read is still there.",
          "Remuxing tools have the opposite problem. Their job is to copy every stream from the old container into a new one, and they do it faithfully — video, audio and the data track nobody asked about. So a clip can pass through two different kinds of cleaning and keep its GPS log both times. Removing telemetry requires a tool that recognises the track for what it is and deliberately leaves it out of the new file.",
          "Editing does not save you either. Dropping a clip into an editor and exporting it produces a new file, but editors are built to preserve material, and depending on the tool and settings the data track or its contents can be carried into the export. A freshly exported file feels processed and therefore safe, which is exactly why it so often is not. Whatever route a clip has taken — straight from the camera or through an editor — the only reliable evidence is a scan of the final file itself."
        ]
      },
      {
        heading: "The honest limit: what is baked into the picture",
        paragraphs: [
          "Some action-camera and drone apps offer the opposite of removal: data overlays. Editors such as camera makers' own apps can burn speed, altitude, a route map or a GPS gauge directly into the frames as visible graphics. Once telemetry is rendered into the picture like that, it is no longer metadata. It is part of the video itself, and no metadata cleaner can take it out.",
          "The same applies to anything the camera could see: a house number, a street sign, a distinctive building at the start of a flight. Cleaning removes what is written in the file's hidden tracks and tags. Before sharing, watch the beginning and end of the clip with the same suspicion you apply to the file itself, because the first seconds of a journey are usually the most identifying."
        ]
      },
      {
        heading: "A cleaning workflow that removes the track",
        paragraphs: [
          "Start with a copy, so the original stays untouched. Scan the copy first and read the report before removing anything: a telemetry or data track should be listed among the contents if one is present, alongside the container tags, device names and timestamps. If the scan of an action-camera clip shows no data track at all, the camera may have recorded with GPS switched off — worth knowing either way.",
          "Then clean the copy with a tool that treats telemetry as metadata rather than content. MediaPure's video cleaner drops timed telemetry tracks — GPMF, mebx, CAMM and RTMD — instead of copying them across, while the video and audio streams are carried over without re-encoding. Download the result and keep it clearly separate from the original in your folders, so the cleaned file is the one that gets shared."
        ]
      },
      {
        heading: "Verify the cleaned file",
        paragraphs: [
          "Cleaned is a claim; verify it. Scan the cleaned file again the same way you scanned the original. The report should now list no telemetry or data track and no location fields, while the video and audio remain. If a data track is still listed, the file has not been properly cleaned, whatever the tool that produced it said, and it should not be shared as though it had.",
          "Also check the things cleaning must never change. Play the file from start to finish: the duration should match the original, the picture should be the right way up, and the sound should be present and in sync. A container rewrite copies the streams byte for byte, so any difference in playback means something other than metadata removal happened along the way."
        ]
      },
      {
        heading: "Keep the original: it is your flight record",
        paragraphs: [
          "Telemetry is a liability in a shared file and an asset in your archive. For drone pilots especially, the original recording with its flight data can support insurance claims, warranty discussions, incident reports and your own records of where and how you flew. Deleting the original to be safe destroys that evidence along with the risk.",
          "The workable routine is a strict separation. Originals stay in a private archive, under your control, for as long as they might be needed. Only copies are cleaned, and only cleaned copies leave your devices. That way the question for any file a stranger can download is never what it contains — you already know, because you checked."
        ]
      }
    ],
    faqs: [
      { q: "Does uploading to YouTube or a social platform remove telemetry?", a: "Platforms transcode uploads for streaming, and the copy viewers watch is a re-encoded version, so an embedded telemetry track generally does not reach the audience. But you have still handed the platform the original file, and download or partner copies can be handled differently. If the file itself will be shared, clean it before upload rather than relying on the platform." },
      { q: "What about the SRT file next to my drone video?", a: "Some drones write flight data into a separate .SRT sidecar file saved beside the video, with GPS readings as timed text. It is not inside the video, so cleaning the video does not touch it. Do not share the folder it sits in; keep sidecar files private with your originals, or delete copies you no longer need." },
      { q: "Does telemetry include speed and altitude, or just location?", a: "It can include much more than location. Depending on the device and its settings, the track may carry speed, altitude, and motion readings such as accelerometer and gyroscope data, all timestamped. That is why a telemetry track describes a journey in detail rather than marking a single point on a map." },
      { q: "Do action cameras put GPS in their photos too?", a: "Yes, when GPS is enabled. A photo taken with an action camera is a JPG carrying standard EXIF fields, including coordinates where the shot was taken. Photos do not have a telemetry track, but they do have ordinary photo metadata, and they should be cleaned the same way as phone photos before sharing." },
      { q: "Will removing telemetry change my video's quality?", a: "No, not with a container rewrite. The compressed video and audio are copied without being decoded, and then checked against the original, so resolution, frame rate and sound are unchanged. Re-encoding tools are the ones that cost quality, and they are not necessary for removing a data track." }
    ]
  },
  {
    slug: "how-to-check-photo-metadata",
    title: "How to Check What Metadata Is in a Photo",
    seoTitle: "How to Check Photo Metadata | MediaPure",
    description: "Learn how to inspect a photo's metadata on your phone, Windows or Mac, which fields actually matter, and why built-in viewers only ever show you part of the picture.",
    intro: "You cannot decide what to remove from a photo until you know what is in it. Checking is quick on every platform, but each viewer shows a different subset of the truth. This guide covers the routes to inspect a file, the fields worth reading, and how to get a complete answer when it matters.",
    sections: [
      {
        heading: "Why check before you share",
        paragraphs: [
          "Metadata is invisible in normal use. A photo looks identical whether it carries GPS coordinates, a camera serial number and your name, or nothing at all. That invisibility is the whole problem: people make sharing decisions based on the picture they can see, while the file carries a second layer they have never looked at. Checking first turns a guess into a decision.",
          "It also changes what you do next. A portrait taken indoors may hold nothing more sensitive than a timestamp, while a photo from a family walk may pinpoint your home street. Some files need no cleaning at all; others should never be sent in their current state. A thirty-second inspection tells you which situation you are in, and a check after cleaning confirms the job was actually done."
        ]
      },
      {
        heading: "Check on your phone",
        paragraphs: [
          "On an iPhone, open the photo in Photos and tap the info button or swipe up. You will see the camera and lens details, the date and time, and — if location was recorded — a map showing where the photo was taken. That map is the quickest privacy check there is: if a place appears, coordinates are in the file. Edited photos may also show which app last touched them.",
          "On Android, open the photo in your gallery app and look for Details or an information option; Google Photos shows a similar panel with the date, device and, where present, a location section. Menu names vary by manufacturer and version, and some galleries hide location behind an extra tap. If the panel shows no location, that usually means none was recorded, but it is not proof about every other field, as the limits section below explains."
        ]
      },
      {
        heading: "Check on Windows and Mac",
        paragraphs: [
          "On Windows, right-click the file, open Properties and go to the Details tab. It lists dimensions, camera make and model, exposure settings, the date taken and, for geotagged photos, latitude and longitude in a GPS section. The list is long and readable, which makes it a good second check — but it is the camera-focused view of the file, not the whole file.",
          "On a Mac, Preview's Inspector (under Tools, Show Inspector) has tabs for general information, EXIF and GPS, while the Photos app's Info panel shows device, date and a location map. Between them they cover the classic camera fields well. What neither is designed to display is everything else a modern file can contain — descriptive XMP and IPTC fields, PNG text chunks and provenance manifests often pass without any sign."
        ]
      },
      {
        heading: "The fields that actually matter",
        paragraphs: [
          "Start with location. GPS latitude and longitude, accurate to a few metres, are the highest-stakes fields in any photo, especially combined with the timestamp, which together can show where you live and when you are away. After that, read the device fields: camera or phone model, lens, and any serial number, which links this photo to every other photo from the same camera body.",
          "Then look at the descriptive layer most people forget. Creator, artist and copyright fields in XMP and IPTC sometimes hold your real name, added automatically by a camera setting or an editor. Software fields name the apps and versions that produced the file. For AI-made images, check for prompt text and Content Credentials: prompts can reveal your workflow in detail, and a signed manifest names the service that generated the picture.",
          "Two smaller fields are worth a glance as well. The embedded preview thumbnail is part of the file rather than a field, but check whether a viewer offers to show it: in older editing workflows the thumbnail can predate a crop, displaying content the visible image no longer contains. And read the file's descriptive title and comments if any exist — cameras rarely fill them in, but editors and cataloguing apps do, sometimes with addresses, client names or notes that were only ever meant for the photographer's own library."
        ]
      },
      {
        heading: "What built-in viewers do not show you",
        paragraphs: [
          "Every built-in viewer reads the blocks its designers cared about, and quietly ignores the rest. Phone info panels favour camera and location. Windows Details is similar. Very few general viewers display PNG text chunks, which is exactly where AI tools write prompts and generation settings, and fewer still surface a C2PA manifest, an embedded preview thumbnail, or data appended after the image ends.",
          "This is why two viewers can disagree about the same file without either being wrong: each is reporting a partial inventory. The practical consequence matters more than the technical one. An empty location section means no GPS in the fields that viewer reads; it does not certify the whole file. Treat built-in checks as a good screen for the common risks, not as an all-clear."
        ]
      },
      {
        heading: "Use a full scan when it matters",
        paragraphs: [
          "When the stakes justify certainty — client work, a listing, anything published under your name — use a tool that reads the whole file. On a desktop, dedicated metadata viewers and the command-line ExifTool are the established options; they list field after field, including the descriptive and AI blocks that friendly viewers skip. The output is dense, but you are looking for the same short list: location, serials, names, software, prompts, credentials.",
          "A metadata cleaner's scan report serves the same purpose from the other direction: before removing anything, MediaPure lists every category it finds in the file, including GPS, AI data, Content Credentials and hidden extras. Scanning first and cleaning second means the check and the fix happen on the same evidence, and a second scan of the cleaned copy is the natural verification step.",
          "Checking scales better than people expect. Before a large upload — a portfolio refresh, a batch of listing photos, a folder handed to a client — scan the set rather than sampling one file and assuming the rest match. Files from the same shoot usually share the same fields, but one photo edited in a different app, or one AI image mixed into a camera set, can carry a completely different inventory. The scan is quick; it is re-checking after an incident that is slow."
        ]
      },
      {
        heading: "What to do with what you find",
        paragraphs: [
          "Let the destination decide. A photo going to a closed family group may be fine as it is; the same photo attached to a public listing, a portfolio or an email to a stranger deserves cleaning first. Work on a copy, keep the original untouched in your archive, and clean after any editing, because editors write their own fields back into the file when they export.",
          "Finally, check the file you will actually send, not a file like it. Messaging apps, email clients and websites can each transform an attachment differently, and a compressed preview is a different artefact from the original. When privacy is the point, the artefact that leaves your device is the only one whose metadata counts — inspect that one."
        ]
      }
    ],
    faqs: [
      { q: "Can I check a photo's metadata using only my phone?", a: "Yes, for the basics. Phone info panels show the device, the date and whether a location was recorded, which covers the most common risks. For the full inventory — PNG prompt text, descriptive fields, Content Credentials — you need a desktop viewer, ExifTool or an online scan, because phone panels only display a subset." },
      { q: "Why do two viewers show different metadata for the same photo?", a: "Because each viewer reads different blocks of the file. One may read only EXIF, another adds XMP and IPTC, and most ignore PNG text chunks and provenance manifests. Neither is necessarily wrong; both are partial. A dedicated metadata tool that lists every block is how you get the complete picture." },
      { q: "Does simply viewing a photo change its metadata?", a: "Viewing does not. Opening and inspecting a file leaves it untouched. What can change metadata is editing: rotating, cropping or saving from some apps rewrites fields, removes some and adds the app's own. That is why you should check the exported copy you plan to send, not the version you started with." },
      { q: "Can I check metadata in a photo someone sent me?", a: "Yes, if you have the file itself. Be aware that a photo received through a messaging app is often a compressed copy whose fields were already reduced in transit, so finding little in the copy does not prove the sender's original was equally clean. Check what you received, and judge only that file." },
      { q: "If a viewer shows no location, is the photo definitely clean?", a: "No. It means that viewer found no location in the fields it reads. Other blocks — descriptive data, prompts, credentials — may still be present, and a few locations hide in related fields. For a definite answer about a file you are about to publish, run a full scan rather than relying on one panel." }
    ]
  },
  {
    slug: "remove-metadata-from-screenshots",
    title: "How to Remove Metadata from Screenshots",
    seoTitle: "Remove Metadata from Screenshots | MediaPure",
    description: "Learn what metadata screenshots carry on phones and computers, why screenshotting a photo does not clean it, and how to prepare screenshots of sensitive work before sharing them.",
    intro: "Screenshots feel anonymous: no camera, no lens, no scene. But a screenshot is still a file, and it still carries fields describing the device that made it and when. This guide covers what screenshots contain, how editing adds more, and the right order of steps before you share one.",
    sections: [
      {
        heading: "What a screenshot carries",
        paragraphs: [
          "A screenshot usually holds less than a camera photo, but what it holds is specific. Expect the device model, the operating system, and the exact date and time the shot was taken, written into the PNG file screenshots are normally saved as. Some systems and apps add a software field naming the tool that captured or last saved the image, and screenshots passed through editors can accumulate more with every save.",
          "There is generally no GPS in a fresh screenshot, because no camera and no location fix were involved in making it. The risk profile is different rather than absent: a screenshot's timestamp is precise to the second, the device and OS fields identify your setup, and if the screenshot later passes through an AI editor or a cloud tool, fields describing that — including, for AI-edited images, generation data — can be added on top.",
          "It is also worth knowing what a screenshot's metadata says about your habits rather than your identity. A run of screenshots shared over months — support exchanges, public posts, documentation — carries consistent device and timing fields that show when you work, how quickly you respond and which tools you use. Individually these are footnotes. Together they sketch a working pattern, which is one more reason to clean the files you publish most often rather than treating every screenshot as disposable."
        ]
      },
      {
        heading: "How it differs by platform",
        paragraphs: [
          "On phones, screenshots are typically PNG files carrying the model, software version and timestamp. What happens next depends on the app you share through: some routes recompress the image and drop most fields, others send the original file untouched. On Windows, the Snipping Tool and similar utilities write their own identifying fields, and on a Mac, screenshot files carry creation times and may gain software data whenever a preview or editor saves them again.",
          "Because behaviour varies by tool, version and sharing route, treat any single description of 'what screenshots contain' — including this one — as a starting point. The reliable method is to scan the actual file you are about to send. Thirty seconds of checking settles what pages of general advice cannot, and it works the same on every platform."
        ]
      },
      {
        heading: "The screenshot-of-a-photo trap",
        paragraphs: [
          "A persistent myth says that screenshotting a photo strips its metadata. It does remove the original's EXIF from the new file, because the screenshot is a new image — but it replaces a good file with a worse one. The screenshot is limited to your screen's resolution, may include interface elements or black bars, and its colours are a screen rendition rather than the photograph itself.",
          "Worse, the screenshot is not metadata-free: it carries fresh fields of its own, including your device and the exact time you took the screenshot. So the trade quietly exchanges the photographer's data for yours, at lower quality. If the aim is to share the photo without its metadata, clean the original file instead — the picture survives intact, and the removal is deliberate rather than a side effect."
        ]
      },
      {
        heading: "Edited and annotated screenshots carry more",
        paragraphs: [
          "Most shared screenshots are not raw captures. They have been cropped, arrowed, highlighted or blurred in a markup app, and every save is a chance for that app to write itself into the file: its name and version in a software field, a new modification timestamp, and in PNG files, text chunks that some editors use to store their own settings or document data.",
          "AI-assisted editors add another layer. An image that has passed through an AI cleanup, expansion or annotation tool may carry generation fields or provenance data much like an AI-created image. None of this makes annotation a bad idea — it makes the order of operations matter. Do all your editing first, and treat metadata removal as the final step before the file leaves you, because any later save can write new fields back in.",
          "There is a subtler addition to watch for: some annotation and collage apps preserve the fields of every source image they combine, or write an editing history listing the operations applied. A screenshot annotated from a photo can therefore end up carrying traces of the photo's data as well as the screenshot's own. You cannot predict this from the app's store description, and you do not need to — the scan of the finished file lists whatever the chain of tools left behind, and cleaning at the end of the chain handles all of it at once."
        ]
      },
      {
        heading: "Clean the pixels too: visible content",
        paragraphs: [
          "With screenshots, the larger risk is usually on the surface. Contact names, email subjects, account balances, file paths, browser tabs, notification previews and the clock in the corner are all visible content, and metadata removal cannot hide any of them. A perfectly cleaned file can still give away everything that matters if the picture itself was never reviewed.",
          "So review the screenshot as a stranger would before it goes anywhere. Crop tightly to the area that makes your point, blur or cover anything that identifies people, accounts or systems, and check the edges — status bars and window borders are where stray details collect. Pixel problems get pixel solutions; file problems get file solutions. Sensitive screenshots usually need both, in that order."
        ]
      },
      {
        heading: "A workflow for sharing screenshots of work",
        paragraphs: [
          "Capture the screenshot, then do every visible edit: crop, annotate, blur. Export or save the finished version as your share copy, keeping the raw capture aside if you might need it. Then run the copy through a metadata cleaner — screenshots are PNGs, and MediaPure's image cleaner accepts PNG alongside JPG and WebP, processing images in memory and verifying that every pixel survives unchanged.",
          "Finish with a scan of the cleaned copy. The report should show no device, date or software fields you care about, and the image should look exactly like the version you approved — because if it does not, something re-saved it along the way. Only then send it, through whatever channel the work requires, knowing both layers of the file have been looked at."
        ]
      },
      {
        heading: "Screen recordings are the video version of the same problem",
        paragraphs: [
          "Everything in this guide applies, with more at stake, to screen recordings. A recording carries container tags naming the device and encoder, creation timestamps, and — for phone recordings — potentially the same location data a camera video would have. It also runs for minutes, which multiplies the chances of a notification or a stray window appearing in the visible content.",
          "Our separate guide to removing metadata from screen recordings covers that workflow in full. The shared principle is simple enough to state here: edit for the eyes first, clean the file second, verify third, and never assume a screen capture of any kind is anonymous just because no camera was involved."
        ]
      }
    ],
    faqs: [
      { q: "Do screenshots contain GPS location?", a: "Generally no. A screenshot is rendered by the device rather than captured by a camera, so there is no location fix to record. Exceptions are possible in edge cases — for example if an app embeds location when capturing or editing content that had it — so if location would be a serious problem, scan the file instead of assuming." },
      { q: "Can I remove metadata from a screenshot without changing how it looks?", a: "Yes. Screenshots are PNG files, and a lossless cleaner removes the metadata chunks while copying the image data byte for byte, then verifies the pixels match. Text stays exactly as sharp, which matters for screenshots more than for almost any other kind of image." },
      { q: "Does cropping a screenshot remove its metadata?", a: "No. Cropping changes the pixels; the metadata blocks are a separate matter, and the editor doing the cropping typically rewrites the file with its own software name and a fresh timestamp. Crop first if you need to, but clean afterwards, and treat cleaning as the last step before sharing." },
      { q: "If I send a screenshot through a messaging app, is the metadata gone?", a: "Often much of it is, because apps usually recompress images in transit — but behaviour varies by app, by settings and by whether the file was sent as a photo or as a document, and it changes over time. If the metadata matters, clean the file yourself first so the answer does not depend on the app's current behaviour." },
      { q: "What if I edited my screenshot with an AI tool?", a: "Treat it like an AI image. AI editors can add generation fields, source tags or Content Credentials to the file, and those blocks survive ordinary re-saving. A scan will show whether any are present; a cleaner that removes AI metadata and credentials will strip them along with the device and time fields." }
    ]
  },
  {
    slug: "photo-metadata-safety-marketplace-selling",
    title: "Selling Online? Remove Photo Metadata First",
    seoTitle: "Marketplace Photo Metadata Safety | MediaPure",
    description: "Learn why photos uploaded to marketplace and classified listings can carry your home's GPS coordinates, how listing photos travel, and the short routine that makes them safe to publish.",
    intro: "Listing photos are usually taken where the item lives — your home. If those photos were taken on a phone with location enabled, the files themselves may carry the coordinates of your house, readable by anyone who can download them. This guide explains the routes that expose the data and the routine that prevents it.",
    sections: [
      {
        heading: "The driveway problem",
        paragraphs: [
          "Consider the most ordinary listing photo there is: a bicycle, a sofa or a car, photographed in your driveway or your living room and uploaded from your phone. If location tagging was on, that photo's EXIF data holds latitude and longitude accurate to a few metres. A stranger does not need to ask where you live. They need only save the photo and read it, and the file answers for you.",
          "The same applies indoors and out, to rentals, vehicles, pets and property itself. The risk is sharpest for home-based selling because the photo location and the collection address become the same thing, and the listing is public by design — posted to as many strangers as the platform can reach, which is exactly who you do not want holding your coordinates."
        ]
      },
      {
        heading: "How listing photos travel",
        paragraphs: [
          "A listing photo rarely stays inside the app you uploaded it to. Platforms display a processed version, but the file can travel further: a buyer asks for more photos by email, you share a cloud folder of originals, a messaging app sends the picture 'as a file' at original quality, or the platform itself offers a full-resolution view. Every one of those routes can carry the untouched original, metadata and all.",
          "It is true that many platforms compress the public display image and discard fields in the process. But which fields, on which route, in which app version, is the platform's choice and it changes without notice. The compressed preview being clean tells you nothing about the copy a buyer receives when they ask for originals — and that request is routine in second-hand selling.",
          "Cross-posting multiplies the copies. Sellers who list on several platforms, or use a tool that syndicates one listing to many, hand the same original files to several systems at once, each with its own processing and its own download routes. Once a file is on four sites, you no longer control — or can even enumerate — the places a full copy can be obtained from. Cleaning once, before the first upload, is the only version of this that stays simple."
        ]
      },
      {
        heading: "Cars, property and the specifics",
        paragraphs: [
          "Vehicle listings combine both kinds of exposure. The metadata can hold where the car is kept overnight, while the visible photo may show a number plate, a street name or the front of your house. Those visible details are a separate problem with a separate solution: plates and house numbers are content, so covering them is a pixel task — blur or crop — and no metadata cleaner can do it for you.",
          "Property photos deserve the same split attention. Interior shots say little on their own, but a full set of originals with coordinates and timestamps documents an address and the times it was photographed — for an empty property or one between tenants, information the seller rarely intends to publish. Clean the files for the hidden layer; review the frames for the visible one."
        ]
      },
      {
        heading: "Patterns reveal routines",
        paragraphs: [
          "One photo's timestamp is trivia. A selling history is a pattern. Timestamps across many listings can show when items are photographed and posted, which for a home-based seller sketches a routine: when the house is occupied, when it is empty, when new stock arrives. Each file seems harmless because each one is — the exposure accumulates across the set, not within any single image.",
          "Device fields accumulate too. The camera model and, on some cameras, a body serial number in EXIF quietly link every listing photographed with the same device. That linkage can connect accounts or listings you kept deliberately separate. Removing metadata per photo, as a routine rather than an occasional worry, is what stops the pattern from forming in the first place."
        ]
      },
      {
        heading: "A pre-listing routine",
        paragraphs: [
          "The routine is short enough to become habit. Photograph the item as usual. Transfer the originals to wherever you prepare listings, and do any cropping or brightening first, because editors write their own fields on export. Then clean the finished copies — MediaPure's image cleaner handles batches of up to 20 photos at once and leaves every pixel unchanged, so a full listing set takes one pass rather than twenty.",
          "Upload only the cleaned copies, and keep the originals in a private folder that never gets shared as a folder. If you prepare listings on your phone, the same order applies: edit, clean, then upload. The single most common mistake is cleaning first and editing second — the editor's export quietly re-embeds software and time fields, and the file you upload is no longer the file you cleaned.",
          "Make the routine visible in your folders, because memory fails under repetition. A simple pattern works: originals in one folder, cleaned copies in a second folder named for the listing, and uploads taken only from the second. When a platform asks for one more photo mid-conversation, it comes from the cleaned folder too — the mid-sale extra is exactly the photo people clean least, usually taken and sent in a hurry from the phone, driveway and all."
        ]
      },
      {
        heading: "When a buyer asks for the original file",
        paragraphs: [
          "Expect the request, especially for higher-value items: buyers ask for originals to judge condition, check that photos are recent, or confirm the item exists. It is usually innocent, and it is also the moment the full file — coordinates, device, timestamps — would change hands. You can meet the underlying need without meeting the request literally.",
          "Offer a cleaned copy at full resolution instead, which shows exactly the same picture detail, and add fresh photos or a short video if the buyer wants more assurance. Keep the conversation inside the platform where possible. If you do decide to send a true original, send it knowing precisely what is in it: scan it first, and let the contents, rather than habit, make the decision."
        ]
      },
      {
        heading: "What cleaning does and does not do for a listing",
        paragraphs: [
          "Cleaning a listing photo removes the file's hidden layer: location, device, serial links, your name if an editor wrote it into the descriptive fields, and the timestamps that build patterns. It does not alter the photograph itself — not the item's appearance, not its condition, not a single pixel of what the buyer is evaluating. It is hygiene about your data, not editing of the goods.",
          "That distinction keeps the practice honest. Sellers owe buyers truthful photos of the item; they do not owe strangers their home coordinates. Removing your metadata while presenting the item exactly as it is satisfies both. And because a lossless clean keeps every pixel, there is no quality excuse for skipping it: the listing looks identical either way. A minute of routine, applied to every listing without exception, is the whole cost of closing this hole for good."
        ]
      }
    ],
    faqs: [
      { q: "Doesn't the marketplace strip metadata anyway?", a: "Many platforms compress the public display image and drop fields in the process, but behaviour varies by platform, app and route, and it changes over time. Crucially, it may not apply to the original-quality copies buyers request by email or cloud link. Clean before upload and the platform's behaviour stops mattering." },
      { q: "Is removing metadata from listing photos dishonest?", a: "No. It removes your personal data — location, device, timestamps — and changes nothing about the item or its photographs, which remain pixel-for-pixel truthful. Misrepresenting the item would be a different act entirely. You owe buyers an honest picture of what they are buying, not the coordinates of your house." },
      { q: "Will cleaning my listing photos reduce their quality?", a: "No. A lossless cleaner copies the image data unchanged and verifies every pixel, so buyers see exactly the same detail. The file is usually slightly smaller, purely because the metadata is gone. Detail, colour and resolution — the things that sell an item — are untouched." },
      { q: "Should I clean photos taken at a shop or warehouse too?", a: "If the location is your home or a home-based business, yes, the same reasoning applies. Even for commercial premises, timestamps and camera serials still travel with the files and link your listings together. Cleaning costs a minute per batch and removes the whole category of worry." },
      { q: "What about serial numbers in product photos?", a: "There are two kinds. A serial number visible in the photo itself — on a label you photographed — is content; cover it with an edit if you do not want it seen, because metadata cleaning cannot. A camera body serial number sits in the EXIF data instead, and cleaning removes it, which stops your listings being linked by your camera." }
    ]
  },
  {
    slug: "remove-metadata-from-screen-recordings",
    title: "How to Remove Metadata from Screen Recordings",
    seoTitle: "Remove Metadata from Screen Recordings | MediaPure",
    description: "Learn what screen recordings reveal in their file data — device names, computer names, timestamps and encoder tags — and how to clean a recording before sharing it with clients or publishing it.",
    intro: "Screen recordings are how work gets explained now: tutorials, bug reports, walkthroughs, lessons. The file behind the recording carries more than the screen — device and computer names, timestamps and the tools that made it. This guide covers what recordings contain and how to clean one before it leaves your hands.",
    sections: [
      {
        heading: "What a screen recording carries",
        paragraphs: [
          "A screen recording is a video file, and it is built like one: a container holding video and audio streams plus the tags and headers every video carries. Expect creation and modification timestamps, in the readable tags and in the container headers, plus fields naming the device model and the software or encoder that wrote the file. None of it appears on screen, and all of it travels when the file is emailed, uploaded or sent to a client.",
          "Phone recordings deserve an extra look. A screen recording made on a phone is produced by the same recording stack as camera video, and depending on the device and its location settings it can carry a location atom just as a filmed clip can. It is not guaranteed to be there — which is precisely why you check the file rather than guessing, in either direction."
        ]
      },
      {
        heading: "Desktop recorders write names",
        paragraphs: [
          "Desktop recording and editing tools work inside your environment, and traces of that environment end up in their exports. Depending on the tool and its settings, a recording's file data can include the computer's name — which for many people is their own name — and sometimes the user account name, alongside the application and version that produced the export. An editor used afterwards adds its own layer: project names and render settings in the tags.",
          "Read that from the recipient's side. A client receiving a tutorial does not need your computer's name; a bug-report video sent to a vendor does not need your account name or the time zone your timestamps imply. None of these fields help anyone watch the recording. They are exhaust from the tools, and they are yours to remove before the file goes out.",
          "Meeting and conferencing tools deserve a mention of their own. A locally saved recording of a call can carry the meeting's title in its file data, and exports from the platform may add the host's name, the scheduled time or the workspace it belongs to, in general terms varying by service. A clip forwarded out of a company — to a client, an auditor, a new hire's personal inbox — can therefore describe the meeting it came from before anyone presses play, even when the conversation itself was unremarkable."
        ]
      },
      {
        heading: "The recordings people share most",
        paragraphs: [
          "The pattern repeats across jobs. A support engineer records a bug reproduction for a vendor. A freelancer records a walkthrough of finished work for a client. A teacher records lessons that will be reposted for years. A team records a meeting or a demo and sends the file outside the company. In every case the audience is outside the recorder's own walls, and the file, not a stream, is what changes hands.",
          "Recordings also live longer than expected. A tutorial is downloaded, re-uploaded, quoted and archived; a bug report is forwarded through a vendor's whole support chain. Decisions made about the file in the first minute — what its fields disclose — keep applying for as long as copies circulate, which is a good argument for cleaning being part of the export routine rather than an afterthought."
        ]
      },
      {
        heading: "The visible-content problem is bigger",
        paragraphs: [
          "For recordings, be honest about priorities: the greater risk is usually what the screen showed. A notification sliding in with a message preview, a file path in a title bar, names in a sidebar, a desktop of personal folders behind the app, the clock giving away your hours — none of this is metadata, and no cleaner can remove it, because it is the picture itself.",
          "Deal with the visible layer first. Re-record the segment, or trim and blur in an editor, and tidy the environment before you start: silence notifications, close unrelated tabs and windows, use a clean desktop. Then remember the order of operations — editing and exporting write fresh metadata into the file, so cleaning always comes after the last export, never before it."
        ]
      },
      {
        heading: "A cleaning workflow for recordings",
        paragraphs: [
          "Finish the recording and complete every edit, then export the version you intend to share. Scan that exported file and read what it carries — device, names, timestamps, encoder tags, any location atom — because the export, not the raw capture, is the artefact your audience receives. Surprises are normal; recorders rarely advertise what they write.",
          "Clean the export with a video cleaner that rewrites the container rather than re-encoding. MediaPure's video cleaner accepts MP4, MOV, M4V, WebM, MKV and AVI up to 500 MB, removes container tags, header timestamps and any location or telemetry data, and copies the picture and sound across untouched — particularly important for recordings, where re-encoding visibly softens text. Keep the master recording private; the cleaned export is the share copy."
        ]
      },
      {
        heading: "Verify the result plays correctly",
        paragraphs: [
          "After cleaning, play the file through, not just the first seconds. Confirm the duration matches the master, the audio is present and in sync, and the text on screen is as sharp as the export — it should be identical, because the streams were copied rather than recompressed, and the cleaner checksums them against the original. A difference in sharpness means something re-encoded your file along the way.",
          "Check orientation too, especially for phone recordings: portrait clips rely on a rotation flag that players apply, and a correct cleaner reads it before cleaning and writes it back. Subtitle tracks are programme content and are preserved where the container holds them, while titles and chapter names stored as text tags are removed with the rest of the metadata — know which of those your recording depends on before you share it."
        ]
      },
      {
        heading: "Keep masters separate from share copies",
        paragraphs: [
          "Keep the original recording, unedited fields and all, in your own archive. Masters settle disputes about what was shown or said, feed re-edits when a client asks for changes, and preserve the context that cleaning deliberately strips out. None of that value requires the master to travel — its job is to exist, privately, when you need it.",
          "A simple naming habit makes the separation stick: masters keep their original names in an archive folder, share copies get a plain descriptive name in a delivery folder. If a file is in the delivery folder, it has been through the routine — edited for the eyes, cleaned for the file, verified in playback. Anything that has not been through it does not leave your machine.",
          "Decide how long masters live, too. Support recordings may be needed until a ticket or contract closes; tutorial masters until the product changes enough to re-record; meeting recordings until the decisions in them are no longer disputed. An archive with a rough retention habit — kept while it is useful, deleted when it plainly is not — beats both extremes: deleting everything in a panic, which destroys your evidence, and keeping everything forever, which keeps the exposure the routine was meant to end."
        ]
      }
    ],
    faqs: [
      { q: "Does OBS or my recorder add metadata to exports?", a: "In general terms, yes: exports carry encoder and software tags and creation timestamps, and the exact fields vary by tool, version and settings. Editors used afterwards add their own. Do not guess from the tool's reputation — scan the exported file, since that is the file your audience receives and the only one whose fields matter." },
      { q: "Does cleaning a screen recording reduce its quality?", a: "No, not with a container rewrite. The compressed video and audio are copied byte for byte and then verified against the original, so on-screen text stays exactly as sharp as the export. Quality loss comes from re-encoding, which metadata removal does not require and a proper cleaner does not do." },
      { q: "My recording is a MOV from my phone. Does it contain location?", a: "It can. Phone screen recordings are written by the same recording stack as camera video, and if location access was enabled, a location atom may be present in the container. It is not always there, which is why the practical answer is to scan the file — the report will list location data if the recording carries any." },
      { q: "Can cleaning remove a notification that popped up in my recording?", a: "No. A notification is visible content — part of the picture — and metadata cleaning never touches the picture. Trim that segment out, blur it in an editor, or re-record with notifications silenced. Then clean the final export afterwards, because the editing and export will have written fresh metadata into it." },
      { q: "Why is my cleaned recording a slightly different file size?", a: "Because the metadata is gone and the container has been rebuilt. Tags, header data and any location or telemetry material take up space, and removing them shrinks the file slightly; layout changes in the rebuilt container can shift a few hundred bytes more. The video and audio data itself is byte for byte what you exported." }
    ]
  }
];

export const getGuide = (slug: string) => guides.find((guide) => guide.slug === slug);
