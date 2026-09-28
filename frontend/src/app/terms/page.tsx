import { LegalPage } from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Terms & Conditions | MediaPure",
  description: "The terms that apply when you use MediaPure to scan and clean metadata from images and video.",
  path: "/terms",
});

export default function Terms() {
  return (
    <LegalPage crumb="Terms & conditions" path="/terms" title="Terms & conditions" updated="26 September 2026"
      intro={`These terms govern your use of ${site.name}, operated by ${site.company.name}. By using the service, you agree to them.`}
      sections={[
        { h: "The service", p: ["The service lets you inspect and remove metadata from JPG, PNG and WebP images and from MP4, MOV, M4V, WebM, MKV and AVI video. It is provided free of charge for personal and business use, subject to the fair-use limits displayed on the site."] },
        { h: "Your content", p: [
          "You keep all rights to the images and videos you upload. You grant us only the limited permission needed to process each file and return the result to you.",
          "You confirm that you have the right to process the files you upload.",
        ] },
        { h: "Acceptable use", p: ["You agree not to:", [
          "upload content that is illegal, including child sexual abuse material, which we report to the relevant authorities;",
          "use the service to remove copyright or rights-management information in order to infringe someone's rights, or to mislead people about the origin of content where you are legally required to disclose it;",
          "attempt to disrupt, overload, probe or bypass the security or rate limits of the service;",
          "access the service with automated tools beyond reasonable personal use without our written permission.",
        ]] },
        { h: "AI-generated content and disclosure", p: ["Removing metadata does not change any obligation you may have to disclose that content was created or altered with AI, whether under platform rules, advertising standards, contracts or law. You are responsible for meeting those obligations. Metadata removal also does not remove watermarks embedded in the pixels of an image or the frames of a video, because the service never alters them."] },
        { h: "No warranty", p: ["We work hard to make the service accurate and reliable, and every output is verified before it is offered to you: images are compared pixel by pixel with the original, and videos are compared stream by stream using packet checksums. However, the service is provided \"as is\" and \"as available\". We do not guarantee that every possible form of hidden data will be detected, that the service will be uninterrupted, or that it is fit for a particular purpose. Keep your own copy of original files."] },
        { h: "Limitation of liability", p: ["To the extent permitted by law, we are not liable for indirect or consequential losses, or for loss of data, profits or business arising from your use of the service. Our total liability for any claim is limited to USD 100."] },
        { h: "Changes and availability", p: ["We may change, suspend or discontinue any part of the service, and may update these terms. Continued use after changes means you accept the updated terms."] },
        { h: "Governing law", p: [`These terms are governed by the laws of the jurisdiction in which ${site.company.name} is registered, without regard to conflict-of-law rules.`] },
        { h: "Contact", p: [`Questions about these terms: ${site.company.email}`] },
      ]} />
  );
}
