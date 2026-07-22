import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Home,
  Save,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Abhishek Kumar",
    email: "student@college.edu",
    phone: "9876543210",
    roll: "2400290100001",
    branch: "Computer Science & Engineering",
    year: "2nd Year",
    section: "A",
    hostel: "H-2",
    room: "305",
    subscription: "Premium",
  });

  useEffect(() => {
    const saved = localStorage.getItem("messiq-profile");

    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    localStorage.setItem(
      "messiq-profile",
      JSON.stringify(profile)
    );

    toast.success("Profile updated successfully!");
  };

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
                {profile.name}
              </h1>

              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm">
                {profile.subscription}
              </span>
            </div>

            <p className="text-muted-foreground mt-2">
              {profile.branch}
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
            />
          </div>

          <div>
            <label>Email</label>
            <Input
              name="email"
              value={profile.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Phone</label>
            <Input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Subscription</label>
            <Input
              name="subscription"
              value={profile.subscription}
              onChange={handleChange}
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
            />
          </div>

          <div>
            <label>Branch</label>
            <Input
              name="branch"
              value={profile.branch}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Year</label>
            <Input
              name="year"
              value={profile.year}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Section</label>
            <Input
              name="section"
              value={profile.section}
              onChange={handleChange}
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
            />
          </div>

          <div>
            <label>Room Number</label>
            <Input
              name="room"
              value={profile.room}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      Hostel Details
     ↓
QR CODE SECTION   <-- Yahan paste karo
     ↓
<div className="flex justify-end gap-4">
   Edit Profile
   Save Profile
</div>
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          <Pencil className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>

        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Profile
        </Button>
      </div>
    </div>
  );
}