import StaticPageLayout from "@/components/StaticPageLayout";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE, SUPPORT_EMAIL, SUPPORT_EMAIL_2, SUPPORT_PHONE_DISPLAY_2, SUPPORT_PHONE_2 } from "@/lib/brand";

const sections = [
  {
    heading: "Reach out",
    body: [
      "We are here to help with bookings, property questions, and anything related to your stay. Whether you want to confirm a reservation or ask about a destination, our team will be happy to assist.",
      "For urgent assistance, please call us directly or send us an email and we will get back to you as soon as possible."
    ]
  },
  {
    heading: "Contact details",
    list: [
      `Phone: ${SUPPORT_PHONE_DISPLAY} / ${SUPPORT_PHONE_DISPLAY_2}`,
      `Email: ${SUPPORT_EMAIL} / ${SUPPORT_EMAIL_2}`
    ]
  },
  {
    heading: "Hours",
    body: "Our support team is available to assist you during standard business hours and will respond to messages promptly."
  }
];

export default function ContactUsPage() {
  return (
    <StaticPageLayout
      title="Contact Us"
      intro="Need help with a booking, have a question about a property, or want to share feedback? We are here to assist you."
      meta="OneLightStays • Support and inquiries"
      sections={sections}
    />
  );
}
