import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Save,
  Pencil,
} from "lucide-react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type ProfileData = {
  uid: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  roll: string;
  branch: string;
  year: string;
  section: string;
  hostel: string;
  room: string;
  subscription: string;
};

const defaultProfile: ProfileData = {
  uid: "",
  name: "",
  email: "",
  role: "Unknown",
  phone: "",
  roll: "",
  branch: "",
  year: "",
  section: "",
  hostel: "",
  room: "",
  subscription: "Premium",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [savedProfile, setSavedProfile] = useState<ProfileData>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoadError("You must be logged in to view your profile.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          setLoadError("Profile not found. Please contact support.");
          setIsLoading(false);
          return;
        }

        const data = snap.data() as Partial<ProfileData>;

        const loadedProfile = {
          ...defaultProfile,
          ...data,
          uid: user.uid,
          email: data.email || user.email || "",
          role: data.role === "student" || data.role === "admin" ? data.role : "Unknown",
        };
        setProfile(loadedProfile);
        setSavedProfile(loadedProfile);
      } catch (error) {
        console.error("Failed to load the authenticated user's profile:", error);
        setLoadError("Failed to load profile. Please try again.");
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || userId !== profile.uid) {
      toast.error("Unable to save profile. User not found.");
      return;
    }

    if (!profile.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    try {
      setIsSaving(true);

      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          roll: profile.roll.trim(),
          branch: profile.branch.trim(),
          year: profile.year.trim(),
          section: profile.section.trim(),
          hostel: profile.hostel.trim(),
          room: profile.room.trim(),
          subscription: profile.subscription.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const updatedProfile = { ...profile, name: profile.name.trim() };
      setProfile(updatedProfile);
      setSavedProfile(updatedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to save the authenticated user's profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          <p className="text-destructive">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card p-8 shadow-lg"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-16 h-16 text-primary" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {profile.name || "Student"}
              </h1>

              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm">
                {profile.subscription}
              </span>
            </div>

            <p className="text-muted-foreground mt-2">
              {profile.branch || "Student Profile"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Personal Information */}
      <div className="rounded-xl border bg-card p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-6">
          Personal Information
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label>Name</label>
            <Input
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />
          </div>

          <div>
            <label>Email</label>
            <Input
              name="email"
              value={profile.email}
              disabled
            />
          </div>

          <div>
            <label>Role</label>
            <Input
              name="role"
              value={profile.role}
              disabled
            />
          </div>

          <div>
            <label>Phone</label>
            <Input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />
          </div>

          <div>
            <label>Subscription</label>
            <Input
              name="subscription"
              value={profile.subscription}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />
          </div>
        </div>
      </div>

      {/* Academic Details */}
      <div className="rounded-xl border bg-card p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-6">
          Academic Details
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label>Roll Number</label>
            <Input
              name="roll"
              value={profile.roll}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />
          </div>

          <div>
            <label>Branch</label>
            <Input
              name="branch"
              value={profile.branch}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />
          </div>

          <div>
            <label>Year</label>
            <Input
              name="year"
              value={profile.year}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />
          </div>

          <div>
            <label>Section</label>
            <Input
              name="section"
              value={profile.section}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />
          </div>
        </div>
      </div>

      {/* Hostel Details */}
      <div className="rounded-xl border bg-card p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-6">
          Hostel Details
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label>Hostel</label>
            <Input
              name="hostel"
              value={profile.hostel}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />
          </div>

          <div>
            <label>Room Number</label>
            <Input
              name="room"
              value={profile.room}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => {
            if (isEditing) setProfile(savedProfile);
            setIsEditing((prev) => !prev);
          }}
          disabled={isSaving}
        >
          <Pencil className="w-4 h-4 mr-2" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>

        <Button onClick={handleSave} disabled={!isEditing || isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
