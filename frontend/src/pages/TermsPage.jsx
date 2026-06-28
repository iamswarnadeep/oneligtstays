import StaticPageLayout from "@/components/StaticPageLayout";

const sections = [
  {
    heading: "Agreement",
    body: [
      "By using our website and booking services, you agree to comply with these terms and conditions. These terms govern your use of our platform, including browsing properties, making reservations, and communicating with us."
    ]
  },
  {
    heading: "Booking responsibilities",
    list: [
      "Guests are responsible for providing accurate booking details and complying with property rules.",
      "Any additional services, special requests, or charges must be agreed in advance where applicable.",
      "We reserve the right to refuse or cancel bookings where terms are not met."
    ]
  },
  {
    heading: "Limitation of liability",
    body: "OneLightStays is not liable for indirect, incidental, or consequential damages arising from the use of our services beyond the value of the booking itself, except where required by law."
  }
];

export default function TermsPage() {
  return (
    <StaticPageLayout
      title="Terms & Conditions"
      intro="These terms outline the responsibilities of both guests and OneLightStays when using our booking platform and services."
      meta="OneLightStays • Platform terms and use"
      sections={sections}
    />
  );
}
