"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { validateSignupEmail } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuthModal } from "@/lib/auth-modal-context";

type Mode = "login" | "signup" | "forgot";

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export function AuthModal() {
  const { isOpen, mode: contextMode, close } = useAuthModal();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Sync mode and reset form each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(contextMode);
      setEmail("");
      setPassword("");
      setName("");
    }
  }, [isOpen, contextMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/account`,
        });
        if (error) throw error;
        toast.success("Check your email for the reset link!");
        setMode("login");
        return;
      }

      if (mode === "signup") {
        const emailCheck = await validateSignupEmail(email);
        if (!emailCheck.success) {
          toast.error(emailCheck.error);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
        return;
      }

      // Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      close();
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) close();
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />

        {/* Popup */}
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] sm:max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden bg-white shadow-2xl outline-none duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="flex">
            {/* Left panel — brand image, desktop only */}
            <div
              className="hidden sm:flex w-[42%] min-h-[480px] flex-col justify-end p-8 relative bg-brand-navy bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: "url('/og-home.jpg')" }}
            >
              <div className="absolute inset-0 bg-brand-navy/65" />
              <div className="relative z-10 space-y-2">
                <p className="text-brand-gold text-[10px] font-semibold tracking-[0.25em] uppercase">
                  Much Love Jewels
                </p>
                <h2
                  className="text-white text-2xl font-semibold leading-snug"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Feel Like Royalty
                </h2>
                <p className="text-white/65 text-sm leading-relaxed">
                  Premium AD & imitation jewellery for every occasion.
                </p>
              </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
              {/* Close */}
              <div className="flex justify-end mb-3">
                <DialogPrimitive.Close className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </div>

              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-brand-navy">
                  {mode === "login"
                    ? "Welcome Back"
                    : mode === "signup"
                    ? "Create Account"
                    : "Reset Password"}
                </h2>
                <p className="text-sm text-brand-text-muted mt-1">
                  {mode === "login"
                    ? "Sign in to continue shopping"
                    : mode === "signup"
                    ? "Join us for a royal shopping experience"
                    : "We'll send a reset link to your email"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="modal-name" className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="modal-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="mt-1.5 h-11"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="modal-email" className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="modal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="mt-1.5 h-11"
                  />
                </div>

                {mode !== "forgot" && (
                  <div>
                    <Label htmlFor="modal-password" className="text-sm font-medium">
                      Password <span className="text-red-500">*</span>
                      {mode === "signup" && (
                        <span className="text-xs text-gray-400 font-normal ml-1">
                          (min. 6 characters)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="modal-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="mt-1.5 h-11"
                    />
                  </div>
                )}

                {mode === "login" && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-brand-text-muted hover:text-brand-navy transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-brand-navy hover:bg-brand-navy-light text-white font-medium"
                >
                  {loading
                    ? "Please wait…"
                    : mode === "login"
                    ? "Sign In"
                    : mode === "signup"
                    ? "Create Account"
                    : "Send Reset Link"}
                </Button>
              </form>

              {mode !== "forgot" && (
                <>
                  <div className="relative my-5">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
                      or continue with
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 font-medium"
                    onClick={handleGoogle}
                    disabled={loading}
                  >
                    <GoogleIcon />
                    Google
                  </Button>
                </>
              )}

              <div className="mt-6 text-center text-sm">
                {mode === "login" ? (
                  <p className="text-gray-500">
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => setMode("signup")}
                      className="font-medium text-brand-navy hover:text-brand-gold transition-colors"
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-500">
                    Already have an account?{" "}
                    <button
                      onClick={() => setMode("login")}
                      className="font-medium text-brand-navy hover:text-brand-gold transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
