import StaticPageLayout from "@/components/StaticPageLayout";

const sections = [
  {
    heading: "General policy",
    body: [
      "Cancellations are handled based on the timing of the request relative to the check-in date. Guests are encouraged to review the booking terms at the time of reservation, as cancellation conditions may vary by property and stay type.",
      "If you need to cancel or modify a reservation, please contact us as soon as possible so we can assist with the available options."
    ]
  },
  {
    heading: "What to expect",
    list: [
      "Bookings cancelled well in advance may be eligible for a partial or full refund depending on the booking terms.",
      "Late cancellations may be non-refundable or subject to a cancellation fee as stated in the booking confirmation.",
      "Special event, holiday, or peak season bookings may have different rules."
    ]
  },
  {
    heading: "Need help?",
    body: "Please contact our support team for specific cancellation requests and the latest availability of options for your reservation."
  }
];

export default function CancellationPolicyPage() {
  return (
    <StaticPageLayout
      title="Cancellation Policy"
      intro="Our cancellation terms are designed to be clear and fair while allowing flexibility where possible."
      meta="OneLightStays • Booking and reservation terms"
      sections={sections}
    />
  );
}
