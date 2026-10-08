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
          "Avoid judging the result only by appearance: metadata is not visible in the image. Also compare the output dimensions and appearance with the source. A metadata cleaner should not blur the image, resize it or remove colour information required for normal display. Keep the original until you have opened the output successfully."
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
        heading: "Choose a practical privacy routine",
        paragraphs: [
          "For everyday pictures, use the share-sheet location toggle when you only need to omit coordinates from that send. For photos that must not be geotagged at all, turn off Camera location access. For client work, public portfolios or AI images, scan a copy for the wider set of metadata fields before it leaves your device.",
          "The right choice depends on your goal: convenience, prevention or removal. None of these steps changes obligations to disclose AI-generated work, copyright details or other information required by a platform or contract. Preserve originals when dates, coordinates or credentials matter to your personal archive, evidence or creative process."
        ]
      }
    ],
    faqs: [
      { q: "Does turning off iPhone location remove GPS from old photos?", a: "No. It prevents or limits location tagging for future pictures. Use the Photos sharing option for a shared copy or clean an existing copy to remove its stored GPS fields." },
      { q: "Does the Photos share option remove all EXIF data?", a: "No. The Location toggle is focused on location sharing. Camera, time and other metadata may remain; use a metadata cleaner when you need a broader scan and removal." },
      { q: "Can I remove metadata without reducing photo quality?", a: "A lossless metadata cleaner removes file information while leaving the encoded image unchanged. Keep the original and check the output before sharing." }
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
          "The gallery preview does not show all of these fields. A person receiving the original file may inspect it with a photo editor or file utility. Location deserves special attention because coordinates can reveal a home, workplace or route. Metadata removal does not erase identifying details that are visible inside the photo itself."
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
          "If your app offers a location removal, save or export a separate copy and check its information again. Do not assume that editing a displayed map pin removes camera, timestamp or AI-related fields too. When a privacy-sensitive image is involved, verify the actual file that will be attached, not just an on-screen preview."
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
          "Renaming a file extension does not remove metadata, and deleting a location field in a gallery does not necessarily erase all EXIF. Prefer a method that reports what it found and creates a separate result. Keep the unmodified original until the cleaned copy opens correctly and you have checked its important properties."
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
      { q: "Can an Android browser remove more than GPS?", a: "Yes, a supported online cleaner can scan and remove several metadata categories from a copy. Consider file sensitivity and verify the downloaded result." }
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
          "The built-in action is convenient for common Windows-readable properties, but it is not a promise that every metadata format or private block is removed. The available options depend on file type and installed codecs. For images that contain AI prompts, C2PA data or less common vendor fields, use a scanner that explicitly checks those categories and review what it reports."
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
          "Also compare file dimensions and open the image in a viewer. A lower file size is normal after removing previews or metadata, but an unexpected change in dimensions or visible quality suggests that the file was resized or recompressed. If the result does not match expectations, do not publish it; use another copy and investigate the report."
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
        heading: "A sensible Windows sharing checklist",
        paragraphs: [
          "Before publishing, make a copy, scan it, remove only the metadata you do not want to disclose, and confirm that the visible image still looks right. Check the downloaded or exported version rather than a temporary preview. If the photo documents an event, preserve the original with its capture information in a secure archive.",
          "For a one-off image, Explorer may be enough to remove common properties. For repeated work or sensitive images, use a workflow that shows a field-by-field report and confirms that the output is intact. Metadata removal does not erase text, signs, reflections or other clues visible in the pixels, so review the content too."
        ]
      }
    ],
    faqs: [
      { q: "Does Windows Remove Properties remove all EXIF?", a: "It removes supported properties exposed to Windows, but may not cover every embedded metadata block. Verify the output with a reader or a broader scanner." },
      { q: "Should I choose a copy or edit the original?", a: "Create a cleaned copy. Keeping the original gives you a fallback and preserves capture details for your archive." },
      { q: "Will File Explorer's removal change image quality?", a: "Removing properties is intended to edit file information, but use a copy and compare the output. Avoid workflows that re-save or recompress the image if preserving image data is important." }
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
          "Instead, clean the exact copy you will upload and verify that copy. For recurring work, make a small checklist: duplicate, scan, remove, inspect the output, and retain the source privately. This is more reliable than guessing what an export or social platform did behind the scenes."
        ]
      },
      {
        heading: "Protect location without losing useful originals",
        paragraphs: [
          "If you use location-based albums, keep geotagging enabled for private originals and clean only the copies meant for public sharing. If you rarely need that feature, review the camera and location permissions on your devices to reduce new location tagging. Neither choice is permanent for every app, so check individual camera software.",
          "Metadata removal is a privacy step, not a substitute for content review. Crop or obscure visible addresses only when you have permission and a legitimate reason, and follow any disclosure rules for AI-generated work. Keep originals securely when timestamps, authorship or credentials matter to your records."
        ]
      }
    ],
    faqs: [
      { q: "Does Preview on Mac remove all photo metadata?", a: "Do not assume a standard Preview export removes every field. Export behavior varies; inspect the saved copy with a metadata reader or use a scanner that lists fields." },
      { q: "Can I remove GPS from a photo in Apple Photos?", a: "Photos may let you adjust or remove a library location, depending on macOS. Verify the exported file if you need to ensure the embedded GPS value is gone." },
      { q: "How do I keep a private original?", a: "Duplicate the image and clean the copy. Store the original in a private archive if its capture details are useful to you." }
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
          "Location data can come from a phone, camera, drone or editing workflow. Not every image has GPS, and a missing map in a gallery does not prove that every coordinate or location field is absent. Check the actual file before sending it, especially for photos taken at a private home or a sensitive event."
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
          "Review permissions after installing another camera application or after a system update. An app may have its own location setting in addition to the operating system permission. If you use a separate editing or export app, test whether it copies coordinates from the source into the new file."
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
      { q: "Will turning off location remove GPS from old pictures?", a: "No. Camera settings affect future captures; existing photos need a separate location-removal or metadata-cleaning step." }
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
        heading: "Consider the trade-offs before removing a credential",
        paragraphs: [
          "A credential can help viewers understand an asset's provenance and may be expected by a client, publisher or platform. Removing it can break the associated verification chain or discard useful evidence about the source and editing history. If authenticity, attribution or auditability matters, retain the credentialed original and check the applicable requirements before making another copy.",
          "There are also privacy reasons to limit what travels with a file, and a credential may disclose a tool or process. The right choice depends on your purpose and obligations. Do not present a file as having a verified history after removing or invalidating its provenance, and do not use metadata removal to evade a platform's AI disclosure rules."
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
          "Keep the credentialed original and the cleaned copy clearly named. Document which copy has provenance data and which one does not, especially in a team workflow. If credentials reappear after another export, inspect the new export rather than assuming the earlier cleanup carried through every stage."
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
      { q: "Does removing C2PA change image quality?", a: "Removing metadata does not require changing pixels. Use a lossless process, retain the original and verify the cleaned output." }
    ]
  }
];

export const getGuide = (slug: string) => guides.find((guide) => guide.slug === slug);
