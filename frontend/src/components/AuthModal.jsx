import { useState, useEffect } from "react";
import { X, Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from "lucide-react";
import api, { formatError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal({ open, onClose, initialMode = "login" }) {
  const { loginWithToken } = useAuth();
  const [mode, setMode] = useState(initialMode); // login | register | otp | forgot | reset
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

  const titles = {
    login: { h: "Welcome back", s: "Sign in to manage bookings & wishlist" },
    register: { h: "Create your account", s: "Discover crafted stays across India" },
    otp: { h: "Verify your email", s: `Enter the 6-digit code sent to ${pendingEmail}` },
    forgot: { h: "Forgot password", s: "We'll email a code to reset it" },
    reset: { h: "Reset password", s: "Enter OTP and new password" },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" data-testid="auth-modal">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl grid md:grid-cols-2 overflow-hidden shadow-2xl reveal">
        <div className="hidden md:block relative">
          <img src="https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=1200&q=85" alt="Stay" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="ols-label text-stone-300 mb-2">OneLightStays</div>
            <div className="font-serif text-3xl leading-tight">Sign in. Stay magnificently.</div>
          </div>
        </div>
        <div className="p-8 md:p-10 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-stone-100" data-testid="auth-close"><X className="w-5 h-5" /></button>
          <div className="ols-label mb-2">{mode === "login" ? "Sign in" : mode === "register" ? "Register" : "Verify"}</div>
          <h2 className="font-serif text-3xl mb-1">{titles[mode].h}</h2>
          <p className="text-sm text-stone-500 mb-6">{titles[mode].s}</p>

          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 mb-4" data-testid="auth-error">{err}</div>}
          {info && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-3 py-2 mb-4" data-testid="auth-info">{info}</div>}

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <>
                <Field icon={User} value={form.name} onChange={update("name")} placeholder="Full name" required testid="auth-name" />
                <Field icon={Phone} value={form.phone} onChange={update("phone")} placeholder="Phone (optional)" testid="auth-phone" />
              </>
            )}
            {(mode === "login" || mode === "register" || mode === "forgot") && (
              <Field icon={Mail} type="email" value={form.email} onChange={update("email")} placeholder="Email address" required testid="auth-email" />
            )}
            {(mode === "login" || mode === "register") && (
              <Field icon={Lock} type="password" value={form.password} onChange={update("password")} placeholder="Password" required testid="auth-password" />
            )}
            {(mode === "otp" || mode === "reset") && (
              <Field icon={ShieldCheck} value={form.otp} onChange={update("otp")} placeholder="6-digit OTP" required testid="auth-otp" />
            )}
            {mode === "reset" && (
              <Field icon={Lock} type="password" value={form.new_password} onChange={update("new_password")} placeholder="New password" required testid="auth-new-password" />
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2" data-testid="auth-submit">
              {loading ? "Please wait..." : (
                <>
                  {mode === "login" && "Sign in"}
                  {mode === "register" && "Create account"}
                  {mode === "otp" && "Verify"}
                  {mode === "forgot" && "Send OTP"}
                  {mode === "reset" && "Reset password"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-sm text-stone-500 space-y-2">
            {mode === "login" && (
              <>
                <div>New to OneLightStays? <button onClick={() => setMode("register")} className="text-[var(--ols-primary)] font-medium" data-testid="auth-switch-register">Create an account</button></div>
                <div><button onClick={() => setMode("forgot")} className="text-[var(--ols-primary)] font-medium" data-testid="auth-switch-forgot">Forgot password?</button></div>
              </>
            )}
            {mode === "register" && (
              <div>Already have an account? <button onClick={() => setMode("login")} className="text-[var(--ols-primary)] font-medium" data-testid="auth-switch-login">Sign in</button></div>
            )}
            {mode === "otp" && (
              <div>Didn't get it? <button onClick={resendOtp} className="text-[var(--ols-primary)] font-medium" data-testid="auth-resend-otp">Resend OTP</button></div>
            )}
            {(mode === "forgot" || mode === "reset") && (
              <div>Back to <button onClick={() => setMode("login")} className="text-[var(--ols-primary)] font-medium">Sign in</button></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, testid, ...props }) {
  return (
    <div className="flex items-center border border-stone-300 focus-within:border-[var(--ols-primary)] transition">
      <Icon className="w-4 h-4 text-stone-400 mx-3" />
      <input {...props} className="flex-1 py-3 pr-3 text-sm outline-none bg-transparent" data-testid={testid} />
    </div>
  );
}
