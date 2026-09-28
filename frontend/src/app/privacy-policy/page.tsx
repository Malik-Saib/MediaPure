import { LegalPage } from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Privacy Policy | MediaPure",
  description: "How MediaPure handles uploaded images and videos, contact messages and anonymous usage statistics.",
  path: "/privacy-policy",
});

export default function PrivacyPolicy() {
  return (
    <LegalPage crumb="Privacy policy" path="/privacy-policy" title="Privacy policy" updated="26 September 2026"
      intro={`This policy explains what information ${site.name} ("we", "us") processes, why, and for how long. The service is operated by ${site.company.name}.`}
      sections={[
        { h: "Summary", p: ["We process your files only to remove their metadata and give them back to you. We keep no copy once you are done: cleaned files are deleted automatically after 10 minutes, and your original is discarded as soon as processing ends. We don't sell data, show ads or use third-party tracking."] },
        { h: "Images you upload", p: [
          "When you upload an image, it is transmitted over an encrypted connection and processed in server memory. The original is not written to disk and is discarded when processing finishes.",
          "The cleaned image is stored temporarily on our server under a random identifier so that you can download it. It is deleted automatically 10 minutes after creation, or immediately when you select Delete. We do not view, analyse for other purposes, share or back up these files.",
          "The metadata report shown to you is generated for your browser only. Metadata values found in your images are not recorded.",
        ] },
        { h: "Videos you upload", p: [
          "Video files are far larger than images and cannot be held in memory, so we have to be precise about what happens to them. When you upload a video it is written to a temporary file on our server, in a directory readable only by the service, under a random name that is never shown to anyone. That file exists only for as long as cleaning takes, and it is deleted the moment the job ends, whether it succeeded or failed. A separate sweep removes anything an unexpected shutdown could leave behind.",
          "This is the one place where our handling of video differs from images, and we would rather say so than claim that nothing ever touches disk.",
          "The cleaned video is then treated exactly like a cleaned image: stored under a random identifier, downloadable only by you, and deleted automatically after 10 minutes or immediately when you select Delete. We do not view, analyse for other purposes, share or back up these files.",
        ] },
        { h: "Usage statistics", p: [
          "For each processing request we record: the date and time, whether it was an image or a video, the file format, the file size before and after, the number of metadata fields found and removed, whether location or AI data was present (yes/no), processing time and success or failure. We do not record file names, file contents or any metadata value.",
          "To count unique visitors without storing IP addresses, we record a one-way hash of your IP address combined with a secret key and the current date. The hash changes every day and cannot be reversed or linked across days.",
          "Our servers may keep standard technical logs (such as IP address and request path) for up to 14 days for security and troubleshooting.",
        ] },
        { h: "Contact messages", p: ["If you contact us, we store your name, email address, topic and message so we can reply. We keep messages for up to 24 months unless you ask us to delete them sooner."] },
        { h: "Cookies", p: ["The public website does not use cookies for tracking or advertising. The admin area uses browser session storage for staff sign-in only."] },
        { h: "Third parties", p: ["Cleaning runs entirely on our own servers. Uploaded files are not sent to any third-party service, cloud API or AI provider at any point. The software we use to read and rewrite files (including FFmpeg and ExifTool) runs locally on the same machine."] },
        { h: "Legal bases", p: ["Where data protection laws such as the GDPR apply, we process uploaded files to provide the service you request (contract), and usage statistics and security logs on the basis of our legitimate interest in running a secure and reliable service."] },
        { h: "Your rights", p: [
          "Depending on where you live, you may have rights to access, correct, delete or restrict the use of your personal data, and to object to processing. Because we do not keep your images or videos, and statistics are not linked to you, most requests will concern contact messages.",
          `To make a request, email ${site.company.email} with the subject "Privacy request".`,
        ] },
        { h: "Children", p: ["The service is not directed at children under 13, and we do not knowingly collect their personal data."] },
        { h: "Changes", p: ["We may update this policy. Material changes will be reflected by the date at the top of this page."] },
        { h: "Contact", p: [`${site.company.name} · ${site.company.email} · ${site.company.url}`] },
      ]} />
  );
}
