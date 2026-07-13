import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UtensilsCrossed, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("messiq-auth", JSON.stringify({ email, name: name || "Student" }));
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient-primary">MessIQ</h1>
          <p className="text-muted-foreground text-sm mt-1">Smart Mess, Smarter Living</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">{isSignup ? "Create Account" : "Welcome Back"}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="student@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:opacity-90">
              {isSignup ? "Sign Up" : "Login"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-medium hover:underline">
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
