import StaticPageLayout from "@/components/StaticPageLayout";

const sections = [
  {
    heading: "Refund overview",
    body: [
      "Refunds, where applicable, are processed in accordance with the cancellation terms of the booking and the payment method used at the time of reservation.",
      "Once a refund is approved, the time taken to reflect the amount in your account depends on the payment provider and banking partner."
    ]
  },
  {
    heading: "Refund conditions",
    list: [
      "Refunds may be issued for eligible cancellations or approved service adjustments.",
      "Some bookings may be non-refundable or subject to a deduction based on the terms agreed at the time of booking.",
      "Any refund amount will be communicated clearly in the confirmation email or support response."
    ]
  },
  {
    heading: "Contact support",
    body: "If you believe a refund is due or need assistance with an existing request, please reach out to our support team with your booking details."
  }
];

export default function RefundPolicyPage() {
  return (
    <StaticPageLayout
      title="Refund Policy"
      intro="We aim to process eligible refunds fairly and transparently, with timely support at every step."
      meta="OneLightStays • Refund processing and eligibility"
      sections={sections}
    />
  );
}
