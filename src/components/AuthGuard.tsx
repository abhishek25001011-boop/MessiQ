import { auth, db } from "@/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
};

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo,
}: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        unsubscribeProfile?.();
        unsubscribeProfile = undefined;

        if (!firebaseUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        unsubscribeProfile = onSnapshot(
          doc(db, "users", firebaseUser.uid),
          (profileSnapshot) => {
            if (auth.currentUser?.uid !== firebaseUser.uid) return;
            if (!profileSnapshot.exists()) {
              setUser(null);
              setIsLoading(false);
              return;
            }

            setUser(firebaseUser);
            setIsLoading(false);
          },
          (error) => {
            if (auth.currentUser?.uid !== firebaseUser.uid) return;
            console.error("Failed to load the authenticated user's profile:", error);
            setUser(null);
            setIsLoading(false);
            toast.error("Unable to load your account profile. Please try again.");
          },
        );
      },
      (error) => {
        unsubscribeProfile?.();
        unsubscribeProfile = undefined;
        console.error("Failed to resolve Firebase authentication state:", error);
        setUser(null);
        setIsLoading(false);
        toast.error("Unable to verify your sign-in. Please log in again.");
      },
    );

    return () => {
      unsubscribeProfile?.();
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Checking your session...</div>;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to={redirectTo ?? "/dashboard"} replace />;
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<"loading" | "admin" | "denied" | "signed-out">("loading");

  useEffect(() => {
    let unsubscribeRole: (() => void) | undefined;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribeRole?.();
      unsubscribeRole = undefined;
      if (!user) {
        setAccess("signed-out");
        return;
      }

      setAccess("loading");
      unsubscribeRole = onSnapshot(
        doc(db, "users", user.uid),
        (userSnapshot) => {
          if (auth.currentUser?.uid !== user.uid) return;
          setAccess(userSnapshot.exists() && userSnapshot.data().role === "admin" ? "admin" : "denied");
        },
        (error) => {
          console.error("Failed to verify admin role:", error);
          setAccess("denied");
          toast.error("Unable to verify admin access.");
        },
      );
    });

    return () => {
      unsubscribeRole?.();
      unsubscribe();
    };
  }, []);

  if (access === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Checking administrator access...</div>;
  }
  if (access === "signed-out") return <Navigate to="/login" replace />;
  if (access === "denied") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
