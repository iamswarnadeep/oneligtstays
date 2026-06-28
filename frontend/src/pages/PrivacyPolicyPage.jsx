import StaticPageLayout from "@/components/StaticPageLayout";

const sections = [
  {
    heading: "Information we collect",
    body: [
      "We collect information that helps us provide a seamless booking experience, including contact details, booking preferences, payment information, and communication records.",
      "We may also collect technical information such as browser details and usage data to improve our services and website experience."
    ]
  },
  {
    heading: "How we use it",
    list: [
      "To process bookings, respond to enquiries, and provide customer support.",
      "To improve website functionality, personalise content, and maintain account security.",
      "To comply with legal responsibilities and protect the interests of guests and hosts."
    ]
  },
  {
    heading: "Your choices",
    body: "You may contact us at any time to request information about your data, ask for updates, or raise privacy concerns."
  }
];

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      intro="We take privacy seriously and handle your information responsibly in line with applicable laws and best practices."
      meta="OneLightStays • Privacy, data handling, and protection"
      sections={sections}
    />
  );
}
