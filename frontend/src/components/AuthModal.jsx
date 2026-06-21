import { useState, useEffect } from "react";
import { X, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import api, { formatError } from "@/lib/api";
import { LOGO_URL } from "@/lib/brand";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal({ open, onClose, initialMode = "login" }) {
  const { loginWithToken } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", otp: "", new_password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpPurpose, setOtpPurpose] = useState("register");

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setErr(""); setInfo("");
      setForm({ name: "", email: "", phone: "", password: "", otp: "", new_password: "" });
    }
  }, [open, initialMode]);

  if (!open) return null;

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr(""); setInfo("");
    try {
      if (mode === "login") {
        const { data } = await api.post("/auth/login", { email: form.email, password: form.password });
        loginWithToken(data.access_token, data.user);
        onClose();
      } else if (mode === "register") {
        const { data } = await api.post("/auth/register", { name: form.name, email: form.email, phone: form.phone, password: form.password });
        setPendingEmail(form.email);
        setOtpPurpose("register");
        setMode("otp");
        if (data.demo_otp) setInfo(`Demo OTP: ${data.demo_otp}`);
        else setInfo("OTP sent to your email.");
      } else if (mode === "otp") {
        const { data } = await api.post("/auth/verify-otp", { email: pendingEmail, otp: form.otp, purpose: otpPurpose });
        if (otpPurpose === "register") {
          loginWithToken(data.access_token, data.user);
          onClose();
        } else {
          setMode("reset");
          setInfo("OTP verified. Set a new password.");
        }
      } else if (mode === "forgot") {
        const { data } = await api.post("/auth/forgot-password", { email: form.email });
        setPendingEmail(form.email);
        setOtpPurpose("reset");
        setMode("reset");
        if (data.demo_otp) setInfo(`Demo OTP: ${data.demo_otp}`);
        else setInfo("OTP sent to your email.");
      } else if (mode === "reset") {
        await api.post("/auth/reset-password", { email: pendingEmail, otp: form.otp, new_password: form.new_password });
        setInfo("Password reset. Please login.");
        setMode("login");
      }
    } catch (e) {
      setErr(formatError(e));
    } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    try {
      const { data } = await api.post("/auth/resend-otp", { email: pendingEmail, purpose: otpPurpose });
      if (data.demo_otp) setInfo(`New Demo OTP: ${data.demo_otp}`);
      else setInfo("OTP resent.");
    } catch (e) { setErr(formatError(e)); }
  };

  const heading = mode === "login" ? "Login" : mode === "register" ? "Signup" : mode === "otp" ? "Verify OTP" : mode === "forgot" ? "Forgot Password" : "Reset Password";
  const canBack = mode !== "login" && mode !== "register";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" data-testid="auth-modal">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl rounded-2xl grid md:grid-cols-[300px_1fr] overflow-hidden shadow-2xl reveal">
        {/* LEFT IMAGE PANEL */}
        <div className="hidden md:block relative bg-gradient-to-br from-indigo-200 via-rose-100 to-amber-100">
          <img src="https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=900&q=85" alt="Stay" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50" />
          <div className="relative h-full flex flex-col justify-between p-8 text-white">
            <div className="logo-mark inline-block">
              <img src={LOGO_URL} alt="OneLightStays" className="h-12 md:h-14 w-auto" />
            </div>
            <div>
              <div className="font-display text-2xl leading-tight">Book a Stay.<br />Live a Story.</div>
              <div className="text-sm text-white/85 mt-3">Enjoy the luxuries & privacy of a villa with</div>
              <div className="mt-3 inline-block px-3 py-1.5 border border-dashed border-white/70 rounded-md text-sm font-semibold">Rooms Starting at ₹2,000*</div>
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="p-7 md:p-10 relative">
          <div className="flex items-center justify-between mb-6">
            {canBack ? (
              <button onClick={() => setMode("login")} className="p-1 hover:bg-stone-100 rounded-full" data-testid="auth-back"><ArrowLeft className="w-4 h-4" /></button>
            ) : <span />}
            <button onClick={onClose} className="text-xs font-medium text-stone-600 underline" data-testid="auth-close">Close</button>
          </div>

          <h2 className="font-display text-3xl">{heading}</h2>
          <p className="text-sm text-stone-500 mt-1 mb-6">
            {mode === "login" && "Welcome back to OneLightStays"}
            {mode === "register" && "Create your account in 30 seconds"}
            {mode === "otp" && `Enter the 6-digit code sent to ${pendingEmail}`}
            {mode === "forgot" && "We'll email a code to reset your password"}
            {mode === "reset" && "Enter OTP and set your new password"}
          </p>

          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 mb-4 rounded-lg" data-testid="auth-error">{err}</div>}
          {info && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-3 py-2 mb-4 rounded-lg" data-testid="auth-info">{info}</div>}

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <Floating label="Full Name" required value={form.name} onChange={update("name")} testid="auth-name" />
            )}
            {mode === "register" && (
              <Floating label="Mobile Number" value={form.phone} onChange={update("phone")} testid="auth-phone" />
            )}
            {(mode === "login" || mode === "register" || mode === "forgot") && (
              <Floating label="Email Id" required type="email" value={form.email} onChange={update("email")} testid="auth-email" />
            )}
            {(mode === "login" || mode === "register") && (
              <Floating label="Password" required type="password" value={form.password} onChange={update("password")} testid="auth-password" />
            )}
            {(mode === "otp" || mode === "reset") && (
              <Floating label="6-digit OTP" required value={form.otp} onChange={update("otp")} icon={ShieldCheck} testid="auth-otp" />
            )}
            {mode === "reset" && (
              <Floating label="New Password" required type="password" value={form.new_password} onChange={update("new_password")} testid="auth-new-password" />
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full !rounded-md py-3.5" data-testid="auth-submit">
              {loading ? "Please wait..." : (
                <>
                  {mode === "login" && "Continue"}
                  {mode === "register" && "Continue"}
                  {mode === "otp" && "Verify & Continue"}
                  {mode === "forgot" && "Send OTP"}
                  {mode === "reset" && "Reset Password"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-sm text-stone-500 space-y-1.5">
            {mode === "login" && (
              <>
                <div>New to OneLightStays? <button onClick={() => setMode("register")} className="text-stone-900 font-semibold underline" data-testid="auth-switch-register">Create account</button></div>
                <div><button onClick={() => setMode("forgot")} className="text-stone-900 font-semibold underline" data-testid="auth-switch-forgot">Forgot password?</button></div>
              </>
            )}
            {mode === "register" && (
              <div className="text-xs text-stone-500">By signing up, you agree to our <span className="text-blue-600 underline">Terms & Conditions</span> and <span className="text-blue-600 underline">Privacy Policy</span></div>
            )}
            {mode === "register" && (
              <div className="mt-2">Have an account? <button onClick={() => setMode("login")} className="text-stone-900 font-semibold underline" data-testid="auth-switch-login">Sign in</button></div>
            )}
            {mode === "otp" && (
              <div>Didn't get it? <button onClick={resendOtp} className="text-stone-900 font-semibold underline" data-testid="auth-resend-otp">Resend OTP</button></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Floating({ label, required, icon: Icon, testid, type = "text", value, onChange }) {
  const [focused, setFocused] = useState(false);
  const filled = value && value.length > 0;
  return (
    <label className="block relative">
      <div className={`border rounded-md px-3 pt-5 pb-1.5 transition ${focused ? "border-stone-900" : "border-stone-300"}`}>
        <div className={`absolute left-3 transition-all pointer-events-none ${focused || filled ? "text-[0.6rem] top-1.5 text-stone-500" : "top-3.5 text-sm text-stone-500"}`}>
          {label}{required && <span className="text-red-500"> *</span>}
        </div>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-stone-400" />}
          <input
            type={type} value={value} onChange={onChange} required={required}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            className="w-full outline-none bg-transparent text-sm"
            data-testid={testid}
          />
        </div>
      </div>
    </label>
  );
}
