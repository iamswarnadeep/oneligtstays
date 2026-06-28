import StaticPageLayout from "@/components/StaticPageLayout";

const sections = [
  {
    heading: "Our story",
    body: [
      "OneLightStays was created to make luxury holiday stays feel effortless, personal, and memorable. We believe the best travel experiences come from thoughtful design, seamless planning, and stays that feel like a true escape.",
      "From private villas to scenic retreats, we handpick properties that combine comfort, character, and exceptional hospitality."
    ]
  },
  {
    heading: "What we offer",
    list: [
      "Curated holiday homes in some of India’s most loved destinations.",
      "Comfort-focused stays with modern amenities and attentive service.",
      "Flexible planning support for weekends, family trips, and special occasions."
    ]
  },
  {
    heading: "Why guests choose us",
    body: "We blend local charm with dependable service so every booking feels easy, inviting, and designed around your travel style."
  }
];

export default function AboutUsPage() {
  return (
    <StaticPageLayout
      title="About Us"
      intro="We help travelers discover beautiful, comfortable places to stay and create lasting memories in every destination."
      meta="OneLightStays • Curated stays and memorable escapes"
      sections={sections}
    />
  );
}
