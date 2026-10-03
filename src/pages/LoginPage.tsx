import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UtensilsCrossed, User } from "lucide-react";
import { auth, db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginMode = "student" | "admin";

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("student");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const getAuthErrorMessage = (error: unknown) => {
    if (!(error instanceof FirebaseError)) return "Something went wrong. Please try again.";
    switch (error.code) {
      case "auth/email-already-in-use": return "This email is already registered. Please log in instead.";
      case "auth/invalid-email": return "Please enter a valid email address.";
      case "auth/weak-password": return "Password should be at least 6 characters long.";
      case "auth/user-not-found":
      case "auth/invalid-credential":
      case "auth/wrong-password": return "Invalid email or password.";
      case "auth/too-many-requests": return "Too many attempts. Please wait and try again.";
      case "auth/network-request-failed": return "Network error. Check your connection and try again.";
      default: return "Authentication failed. Please try again.";
    }
  };

  const handleModeChange = (nextMode: LoginMode) => {
    if (isSubmitting || nextMode === mode) return;
    setMode(nextMode);
    setIsSignup(false);
    setErrorMessage("");
  };

  const rejectAuthenticatedLogin = async (message: string) => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out after login verification:", error);
      message += " Please retry sign-in.";
    }
    setErrorMessage(message);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");
    setIsSubmitting(true);
    let authenticatedUserId: string | undefined;

    try {
      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        authenticatedUserId = credential.user.uid;
        await setDoc(doc(db, "users", credential.user.uid), {
          uid: credential.user.uid,
          name: name.trim() || "Student",
          email: credential.user.email,
          role: "student",
          createdAt: serverTimestamp(),
        });
        authenticatedUserId = undefined;
        navigate("/dashboard");
        return;
      }

      const credential = await signInWithEmailAndPassword(auth, email, password);
      authenticatedUserId = credential.user.uid;
      let profile;
      try {
        profile = await getDoc(doc(db, "users", credential.user.uid));
      } catch (error) {
        console.error("Firestore role lookup failed:", error);
        await rejectAuthenticatedLogin("We couldn't verify this account's role. Please try again.");
        authenticatedUserId = undefined;
        return;
      }
      const role = profile.exists() ? profile.data().role : undefined;

      if (role !== "student" && role !== "admin") {
        await rejectAuthenticatedLogin("We couldn't verify this account's role. Please contact support.");
        authenticatedUserId = undefined;
        return;
      }
      if (mode === "student" && role === "admin") {
        await rejectAuthenticatedLogin("This is an admin account. Please use Admin Login.");
        authenticatedUserId = undefined;
        return;
      }
      if (mode === "admin" && role === "student") {
        await rejectAuthenticatedLogin("This account is registered as a student. Please use Student Login.");
        authenticatedUserId = undefined;
        return;
      }

      authenticatedUserId = undefined;
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      console.error("Authentication request failed:", error);
      if (authenticatedUserId && auth.currentUser?.uid === authenticatedUserId) {
        const message = isSignup
          ? "Your account was created, but its profile could not be saved. You have been signed out; please try signing in again or contact support."
          : "We couldn't verify this account's role. Please try again.";
        await rejectAuthenticatedLogin(message);
        authenticatedUserId = undefined;
      } else {
        setErrorMessage(getAuthErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = mode === "admin";
  const ModeIcon = isAdmin ? ShieldCheck : UtensilsCrossed;

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-background to-teal-50/70 px-4 py-10 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-12 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-500/10" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-emerald-900/15 ring-1 ring-white/30">
            <UtensilsCrossed className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gradient-primary">MessIQ</h1>
          <p className="mt-1 text-sm text-muted-foreground">Smart Mess, Smarter Living</p>
        </header>

        <section className="glass-card rounded-3xl p-6 shadow-xl shadow-emerald-950/5 sm:p-8" aria-labelledby="auth-heading">
          <div className="mb-7 rounded-2xl bg-secondary/70 p-1.5" role="group" aria-label="Choose sign-in mode">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                aria-pressed={!isAdmin}
                onClick={() => handleModeChange("student")}
                disabled={isSubmitting}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${!isAdmin ? "bg-card text-primary shadow-sm ring-1 ring-primary/15" : "text-muted-foreground hover:bg-card/60 hover:text-foreground"}`}
              >
                <UtensilsCrossed className="h-4 w-4" aria-hidden="true" /> Student Login
              </button>
              <button
                type="button"
                aria-pressed={isAdmin}
                onClick={() => handleModeChange("admin")}
                disabled={isSubmitting}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isAdmin ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-700 dark:bg-slate-100 dark:text-slate-900" : "text-muted-foreground hover:bg-card/60 hover:text-foreground"}`}
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Admin Login
              </button>
            </div>
          </div>

          <motion.div
            key={`${mode}-${isSignup ? "signup" : "login"}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="mb-6 flex items-start gap-3">
              <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isAdmin ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-primary/10 text-primary"}`}>
                <ModeIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="auth-heading" className="text-xl font-semibold tracking-tight">
                  {isSignup ? "Create your account" : isAdmin ? "Admin Portal" : "Welcome Back"}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {isSignup ? "Get started with your MessIQ student account." : isAdmin ? "Sign in to manage MessIQ." : "Login to manage your meals & mess preferences."}
                </p>
              </div>
            </div>

            {isAdmin && !isSignup && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Secure administrator access · role verified by MessIQ</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input id="full-name" autoComplete="name" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-xl pl-10" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input id="email" type="email" autoComplete="email" placeholder="you@college.edu" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-xl pl-10 transition-shadow focus-visible:ring-2" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input id="password" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-xl pl-10 pr-11 transition-shadow focus-visible:ring-2" required />
                  <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {errorMessage && <p role="alert" aria-live="polite" className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">{errorMessage}</p>}

              <Button type="submit" disabled={isSubmitting} className={`group mt-2 h-11 w-full rounded-xl text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 ${isAdmin ? "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white" : "gradient-primary"}`}>
                {isSubmitting ? (isSignup ? "Creating account..." : "Signing in...") : isSignup ? "Create account" : isAdmin ? "Sign in to Admin Portal" : "Sign in"}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
              </Button>
            </form>

            {!isAdmin && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <button type="button" disabled={isSubmitting} onClick={() => { setIsSignup((signup) => !signup); setErrorMessage(""); }} className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">
                  {isSignup ? "Sign in" : "Sign up"}
                </button>
              </p>
            )}
          </motion.div>
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">Your account access is securely verified by MessIQ.</p>
      </div>
    </main>
  );
}
