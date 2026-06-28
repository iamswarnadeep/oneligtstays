import { useState, useRef } from "react";
import { ChevronDown, ChevronUp, Check, ArrowLeft, ArrowRight, Upload, X, Phone, Mail, Globe2, Building2, MapPin, Trophy, Sparkles, ShieldCheck, IndianRupee, Headphones, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import api, { formatError } from "@/lib/api";
import { inr, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE } from "@/lib/brand";

const PLAN_FEES_IMG = "https://customer-assets.emergentagent.com/job_resort-finder-21/artifacts/ijico62r_Plan_Fees.jpg";
const HERO_IMG = "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=2000&q=85";
const WHY_IMG = "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=1200&q=85";

const CURRENCIES = [
  { code: "INR", label: "₹ INR — Indian Rupee" }, { code: "USD", label: "$ USD — US Dollar" },
  { code: "EUR", label: "€ EUR — Euro" }, { code: "GBP", label: "£ GBP — British Pound" },
  { code: "AED", label: "د.إ AED — UAE Dirham" }, { code: "SGD", label: "$ SGD — Singapore Dollar" },
  { code: "AUD", label: "$ AUD — Australian Dollar" }, { code: "CAD", label: "$ CAD — Canadian Dollar" },
  { code: "JPY", label: "¥ JPY — Japanese Yen" }, { code: "CNY", label: "¥ CNY — Chinese Yuan" },
  { code: "THB", label: "฿ THB — Thai Baht" }, { code: "MYR", label: "RM MYR — Malaysian Ringgit" },
  { code: "IDR", label: "Rp IDR — Indonesian Rupiah" }, { code: "ZAR", label: "R ZAR — South African Rand" },
  { code: "CHF", label: "CHF — Swiss Franc" }, { code: "SEK", label: "kr SEK — Swedish Krona" },
  { code: "NZD", label: "$ NZD — New Zealand Dollar" }, { code: "HKD", label: "HK$ HKD — Hong Kong Dollar" },
  { code: "BRL", label: "R$ BRL — Brazilian Real" }, { code: "TRY", label: "₺ TRY — Turkish Lira" },
];

const PLANS = [
  { id: "startup", name: "Startup", price: 14999, sub: "Get listed & start receiving bookings", perks: ["OTA Registration", "Dynamic Rates", "Booking Engine", "Revenue Report"] },
  { id: "plus", name: "Plus", price: 11999, sub: "Best for growing properties", perks: ["Everything in Startup", "OTA Management", "Property Support (Business hours)", "0% Commission Bookings"], popular: true },
  { id: "executive", name: "Executive", price: 9999, sub: "Premium 24×7 white-glove service", perks: ["Everything in Plus", "24×7 Property Support", "Dedicated Revenue Manager", "Guest Inquiry Helpline"] },
];

const FAQS = [
  { q: "How long does the listing approval take?", a: "Once you submit the form and upload the required 25+ photos, our team reaches out within 24 working hours. Live listing typically goes up within 3–5 business days after agreement & onboarding." },
  { q: "What does the onboarding fee cover?", a: "The one-time onboarding fee covers professional content writing, OTA setup, channel-manager configuration, and dedicated account-manager assistance for the first month." },
  { q: "Can I switch plans later?", a: "Yes. You can upgrade or downgrade your plan from your partner dashboard at any anniversary cycle." },
  { q: "Do I need to send the photos professionally?", a: "We recommend high-resolution photos (min 1920px wide) shot during daylight. If you need help, our partner-success team can recommend a local photographer." },
  { q: "Is there a contract lock-in?", a: "No long-term lock-in. The agreement runs annually and can be cancelled with a 30-day written notice." },
  { q: "How do I receive payments?", a: "Bookings are paid out fortnightly to your registered bank account, after deducting the agreed PMS commission." },
];

export default function BecomePartnerPage() {
  return (
    <div className="bg-white" data-testid="become-partner-page">
      {/* HERO */}
      <section className="relative h-[60vh] min-h-[440px] overflow-hidden">
        <img src={HERO_IMG} alt="Become a partner" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div className="badge badge-pink mb-4"><Trophy className="w-3.5 h-3.5" /> Partner With Us</div>
          <h1 className="font-display text-4xl md:text-6xl text-white max-w-3xl leading-tight">Turn your property into a high-revenue holiday destination</h1>
          <p className="text-white/85 mt-4 max-w-2xl text-base md:text-lg">Join OneLightStays' curated network. Get exposure, expert support, and grow your bookings — without the headaches of running it alone.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {/* <a href="#onboard-form" className="btn-primary" data-testid="hero-cta">Start Listing — Receive a Callback</a>
            <a href={`tel:${SUPPORT_PHONE}`} className="btn-outline"><Phone className="w-4 h-4" /> {SUPPORT_PHONE_DISPLAY}</a> */}
          </div>
        </div>
      </section>

      {/* PLAN & FEES */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 my-16">
        <div className="text-center mb-8">
          <div className="ols-label mb-2">Transparent pricing</div>
          <h2 className="font-display text-3xl md:text-4xl">Plan & Fees</h2>
          <p className="text-stone-600 mt-2 max-w-2xl mx-auto">Pick the plan that fits where you are today. Switch anytime as your property grows.</p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-stone-200 bg-white">
          <img src={PLAN_FEES_IMG} alt="OneLightStays Plan & Fees comparison chart" className="w-full h-auto" data-testid="plan-fees-image" />
        </div>
      </section>

      {/* WHY BECOME A PARTNER */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 my-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl overflow-hidden aspect-[4/3] order-2 md:order-1">
            <img src={WHY_IMG} alt="Why partner with us" className="w-full h-full object-cover" />
          </div>
          <div className="order-1 md:order-2">
            <div className="ols-label mb-3">Why Become a Partner With Us?</div>
            <h2 className="font-display text-3xl md:text-4xl mb-5">Hospitality made effortless — at a premium</h2>
            <p className="text-stone-600 mb-6">From day-one onboarding to 24×7 guest support, OneLightStays plugs every gap so you can focus on hospitality, not paperwork.</p>
            <ul className="space-y-4" data-testid="why-list">
              {[
                { icon: Sparkles, t: "Premium brand exposure", d: "Get featured across our curated marketing channels and partner OTAs." },
                { icon: BarChart3, t: "Dynamic revenue management", d: "AI-driven pricing & demand forecasting to maximise occupancy and ADR." },
                { icon: Headphones, t: "Dedicated account manager", d: "A single point of contact who treats your property like their own." },
                { icon: ShieldCheck, t: "Verified guests, every time", d: "Identity checks, damage protection & 24×7 guest helpline." },
                { icon: IndianRupee, t: "Fortnightly payouts", d: "Predictable, transparent settlements direct to your bank account." },
              ].map((x, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0"><x.icon className="w-5 h-5 text-stone-700" strokeWidth={1.5} /></div>
                  <div>
                    <div className="font-semibold">{x.t}</div>
                    <div className="text-sm text-stone-600 mt-0.5">{x.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="onboard-form" className="bg-stone-50 py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-8">
            <div className="ols-label mb-2">Get started</div>
            <h2 className="font-display text-3xl md:text-4xl">Onboard with OneLightStays</h2>
            <p className="text-stone-600 mt-2">5 quick steps · We'll call you within 24 hours.</p>
          </div>
          <PartnerWizard />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 my-20">
        <div className="text-center mb-8">
          <div className="ols-label mb-2">Frequently asked</div>
          <h2 className="font-display text-3xl md:text-4xl">Partner FAQs</h2>
        </div>
        <FAQAccordion items={FAQS} />
      </section>
    </div>
  );
}

// =============================================================================
// WIZARD
// =============================================================================
function PartnerWizard() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", property_location: "",
    property_name: "", address: "", rooms_count: 1, city: "", country: "India", currency: "INR",
    images: [],
    agreed_terms: false,
    plan: "plus",
  });

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target?.value ?? e });

  const validate = () => {
    setErr("");
    if (step === 0) {
      if (!form.full_name || !form.email || !form.phone || !form.property_location) { setErr("Please fill all fields"); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setErr("Invalid email"); return false; }
    }
    if (step === 1) {
      if (!form.property_name || !form.address || !form.city || !form.country || !form.currency) { setErr("Please fill all property fields"); return false; }
      if (!form.rooms_count || form.rooms_count < 1) { setErr("Rooms count must be at least 1"); return false; }
    }
    if (step === 2) {
      if (form.images.length < 25) { setErr(`Please upload at least 25 photos (you've added ${form.images.length}).`); return false; }
    }
    if (step === 3) {
      if (!form.agreed_terms) { setErr("Please accept the terms to continue"); return false; }
    }
    if (step === 4) {
      if (!form.plan) { setErr("Please select a plan"); return false; }
    }
    return true;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(4, s + 1)); };
  const prev = () => { setErr(""); setStep((s) => Math.max(0, s - 1)); };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true); setErr("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "images") return;
        if (k === "agreed_terms") fd.append(k, v ? "true" : "false");
        else fd.append(k, String(v));
      });
      form.images.forEach((f) => fd.append("images", f));
      const { data } = await api.post("/partner-listings", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSubmitted(data.request);
    } catch (e) { setErr(formatError(e)); }
    finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center" data-testid="partner-success">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8" /></div>
        <h3 className="font-display text-2xl">Listing request received!</h3>
        <p className="text-stone-600 mt-2">Your request <b className="font-mono">{submitted.request_number}</b> is being reviewed. Our partner-success team will call you within 24 working hours.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
      </div>
    );
  }

  const TITLES = ["Onboard with us", "Property details", "Property images", "Agreement", "Choose your plan"];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8">
      {/* Steps */}
      <div className="flex items-center gap-1.5 mb-6">
        {TITLES.map((t, i) => (
          <div key={i} className="flex-1 flex items-center gap-1.5">
            <div className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-stone-900" : "bg-stone-200"}`} />
          </div>
        ))}
      </div>
      <div className="ols-label">Step {step + 1} of 5</div>
      <h3 className="font-display text-2xl mt-1 mb-5">{TITLES[step]}</h3>

      {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4" data-testid="form-error">{err}</div>}

      {/* STEP 1 */}
      {step === 0 && (
        <div className="space-y-4" data-testid="step-1">
          <Field label="Full Name" required value={form.full_name} onChange={upd("full_name")} testid="field-name" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email" required type="email" value={form.email} onChange={upd("email")} testid="field-email" />
            <Field label="Phone Number" required value={form.phone} onChange={upd("phone")} testid="field-phone" />
          </div>
          <Field label="Property Location" required textarea value={form.property_location} onChange={upd("property_location")} placeholder="Tell us roughly where the property is — locality, landmarks, state" testid="field-location" />
        </div>
      )}

      {/* STEP 2 */}
      {step === 1 && (
        <div className="space-y-4" data-testid="step-2">
          <Field label="Name of Property" required value={form.property_name} onChange={upd("property_name")} testid="field-property-name" />
          <Field label="Address" required textarea value={form.address} onChange={upd("address")} testid="field-address" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="No. of Rooms" required type="number" min={1} value={form.rooms_count} onChange={upd("rooms_count")} testid="field-rooms" />
            <Field label="City" required value={form.city} onChange={upd("city")} testid="field-city" />
            <Field label="Country" required value={form.country} onChange={upd("country")} testid="field-country" />
          </div>
          <label className="block">
            <div className="ols-label mb-1">Currency<span className="text-red-500"> *</span></div>
            <select value={form.currency} onChange={upd("currency")} className="w-full border border-stone-300 rounded-md px-3 py-2.5 text-sm outline-none bg-white" data-testid="field-currency">
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </label>
        </div>
      )}

      {/* STEP 3 */}
      {step === 2 && (
        <div data-testid="step-3">
          <ImageDropzone files={form.images} onChange={(files) => setForm({ ...form, images: files })} />
        </div>
      )}

      {/* STEP 4 */}
      {step === 3 && (
        <div data-testid="step-4">
          <div className="h-48 overflow-y-scroll border border-stone-300 p-4 text-sm text-stone-700 rounded-lg leading-relaxed bg-stone-50" data-testid="terms-scroll">
            <p className="mb-2"><b>Partner Onboarding Agreement</b></p>
            <p className="mb-2">By submitting this form you confirm that you are the legal owner or authorised representative of the property listed and have full authority to enter into a hospitality-management agreement with OneLightStays Pvt. Ltd. ("OLS").</p>
            <p className="mb-2">1. <b>Scope.</b> OLS will provide listing, marketing, channel-management, dynamic pricing and (where included) guest-support services as per the plan selected. The exact service-level shall be governed by the formal Partner Agreement executed after onboarding.</p>
            <p className="mb-2">2. <b>Fees.</b> The one-time onboarding fee and recurring management commission ("PMS %") shall apply as displayed on the public Plan & Fees comparison chart. Fees are exclusive of applicable taxes.</p>
            <p className="mb-2">3. <b>Content rights.</b> You grant OLS a non-exclusive licence to use property photos, descriptions and reviews on its owned channels and partner OTAs for the duration of this engagement.</p>
            <p className="mb-2">4. <b>Bookings & payouts.</b> All guest bookings remain the property of OLS; payouts to you will be processed fortnightly after deduction of commission, refunds, and taxes.</p>
            <p className="mb-2">5. <b>Cancellation & refunds.</b> Cancellations are subject to the published guest-refund policy. Owner-initiated cancellations may attract penalty deductions.</p>
            <p className="mb-2">6. <b>Standards.</b> You agree to maintain the property in a clean, safe and well-maintained condition, comply with all local laws, hold valid insurance and provide an itemised inventory list.</p>
            <p className="mb-2">7. <b>Term & termination.</b> Initial term is twelve (12) months, auto-renewing annually. Either party may terminate with a 30-day written notice.</p>
            <p className="mb-2">8. <b>Confidentiality.</b> Pricing, guest data, booking analytics and contract terms are confidential and may not be shared with third parties.</p>
            <p className="mb-2">9. <b>Dispute resolution.</b> All disputes shall be subject to arbitration in accordance with the laws of India. The seat of arbitration shall be Mumbai.</p>
            <p>10. <b>Acceptance.</b> Ticking "I agree" below constitutes an electronic signature and acknowledgement of these terms.</p>
          </div>
          <label className="flex items-start gap-3 mt-4 cursor-pointer">
            <input type="checkbox" checked={form.agreed_terms} onChange={(e) => setForm({ ...form, agreed_terms: e.target.checked })} className="mt-1 accent-stone-900 w-4 h-4" data-testid="agree-checkbox" />
            <span className="text-sm text-stone-700">I have read and agree to the <b>Partner Onboarding Agreement</b>.</span>
          </label>
        </div>
      )}

      {/* STEP 5 */}
      {step === 4 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="step-5">
          {PLANS.map((p) => (
            <button key={p.id} type="button" onClick={() => setForm({ ...form, plan: p.id })} className={`text-left p-5 rounded-2xl border-2 transition relative ${form.plan === p.id ? "border-stone-900 bg-stone-50" : "border-stone-200 bg-white hover:border-stone-400"}`} data-testid={`plan-${p.id}`}>
              {p.popular && <div className="absolute -top-3 left-4 badge badge-dark text-[0.6rem]">Most Popular</div>}
              <div className="ols-label">{p.name}</div>
              <div className="font-display text-3xl mt-1">{inr(p.price)}</div>
              <div className="text-xs text-stone-500 mt-1">{p.sub}</div>
              <ul className="mt-4 space-y-1.5 text-sm">
                {p.perks.map((k) => <li key={k} className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />{k}</li>)}
              </ul>
              {form.plan === p.id && <div className="mt-3 text-xs text-emerald-700 font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Selected</div>}
            </button>
          ))}
        </div>
      )}

      {/* NAV */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 mt-7 pt-5 border-t border-stone-200">
        <button type="button" onClick={prev} disabled={step === 0} className="btn-outline text-sm disabled:opacity-40 disabled:cursor-not-allowed" data-testid="prev-btn">
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        {step < 4 ? (
          <button type="button" onClick={next} className="btn-primary text-sm" data-testid="next-btn">Next <ArrowRight className="w-4 h-4" /></button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting} className="btn-primary text-sm" data-testid="submit-btn">
            {submitting ? "Submitting…" : "Submit & Receive a Call Back"} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// DROPZONE
// =============================================================================
function ImageDropzone({ files, onChange }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const handle = (incoming) => {
    const arr = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    onChange([...files, ...arr]);
  };
  const remove = (i) => onChange(files.filter((_, idx) => idx !== i));
  return (
    <div>
      <button type="button"
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
        onClick={() => ref.current?.click()}
        className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition ${drag ? "border-stone-900 bg-stone-50" : "border-stone-300 hover:border-stone-500"}`}
        data-testid="dropzone"
      >
        <Upload className="w-7 h-7 mx-auto text-stone-500 mb-2" strokeWidth={1.5} />
        <div className="font-semibold text-sm">Drop photos here, or click to browse</div>
        <div className="text-xs text-stone-500 mt-1">JPEG/PNG · Minimum 25 photos required · High resolution (≥1920px) recommended</div>
      </button>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handle(e.target.files)} data-testid="file-input" />
      <div className="mt-4 flex items-center justify-between">
        <div className={`text-sm font-semibold ${files.length >= 25 ? "text-emerald-700" : "text-stone-700"}`}>
          {files.length} photo{files.length === 1 ? "" : "s"} added · {files.length >= 25 ? "✓ Minimum met" : `${25 - files.length} more required`}
        </div>
        {files.length > 0 && <button type="button" onClick={() => onChange([])} className="text-xs text-red-700 underline">Clear all</button>}
      </div>
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2" data-testid="thumbs-grid">
          {files.map((f, i) => (
            <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-stone-200 bg-stone-50">
              <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
              <button type="button" onClick={() => remove(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SHARED
// =============================================================================
function Field({ label, required, textarea, value, onChange, placeholder, type = "text", min, testid }) {
  return (
    <label className="block">
      <div className="ols-label mb-1">{label}{required && <span className="text-red-500"> *</span>}</div>
      {textarea ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3} className="w-full border border-stone-300 rounded-md px-3 py-2.5 text-sm outline-none focus:border-stone-900" data-testid={testid} />
      ) : (
        <input type={type} min={min} value={value} onChange={onChange} placeholder={placeholder} className="w-full border border-stone-300 rounded-md px-3 py-2.5 text-sm outline-none focus:border-stone-900" data-testid={testid} />
      )}
    </label>
  );
}

function FAQAccordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-2" data-testid="faq-accordion">
      {items.map((f, i) => (
        <div key={i} className={`border rounded-xl transition ${open === i ? "border-stone-900 bg-stone-50" : "border-stone-200 bg-white"}`}>
          <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold" data-testid={`faq-${i}`}>
            {f.q} {open === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {open === i && <div className="p-4 pt-0 text-sm text-stone-600 leading-relaxed">{f.a}</div>}
        </div>
      ))}
    </div>
  );
}
