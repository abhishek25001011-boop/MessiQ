import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChefHat,
  AlertTriangle,
  Users,
  Percent,
  MessageSquare,
  Search,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface AdminMetrics {
  totalStudents: number;
  todaysMealSelections: number;
  mealParticipationPercentage: number;
  feedbackCount: number;
  mealCounts: Record<MealType, number>;
}

type MealType = "breakfast" | "lunch" | "snacks" | "dinner";

interface StudentRecord {
  uid: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  roll?: string;
  branch?: string;
  year?: string;
  section?: string;
  hostel?: string;
  room?: string;
  subscription?: string;
}

interface MealRecord {
  id: string;
  date: string;
  type: MealType;
  name: string;
  description: string;
}

interface FeedbackRecord {
  id: string;
  student: string;
  meal: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp;
}

const initialMetrics: AdminMetrics = {
  totalStudents: 0,
  todaysMealSelections: 0,
  mealParticipationPercentage: 0,
  feedbackCount: 0,
  mealCounts: {
    breakfast: 0,
    lunch: 0,
    snacks: 0,
    dinner: 0,
  },
};

const mealTypeOptions: MealType[] = ["breakfast", "lunch", "snacks", "dinner"];

function getLocalDateString() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
}

const emptyMealForm = {
  date: getLocalDateString(),
  type: "breakfast" as MealType,
  name: "",
  description: "",
};

export default function AdminPanel() {
  const [metrics, setMetrics] = useState<AdminMetrics>(initialMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [feedbackRecords, setFeedbackRecords] = useState<FeedbackRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isMealDialogOpen, setIsMealDialogOpen] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealForm, setMealForm] = useState(emptyMealForm);
  const [isSavingMeal, setIsSavingMeal] = useState(false);

  useEffect(() => {
    let authChangeId = 0;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const requestId = ++authChangeId;
      if (!user) {
        setIsAdmin(false);
        setError("You must be logged in to access admin functionality.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsAdmin(false);
        setError(null);

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (requestId !== authChangeId || auth.currentUser?.uid !== user.uid) return;
        const role = String(userSnap.data()?.role || "");

        if (role !== "admin") {
          setIsAdmin(false);
          setError("Access denied. Admin role is required.");
          setIsLoading(false);
          return;
        }

        setIsAdmin(true);

        const today = getLocalDateString();

        const studentsQuery = query(
          collection(db, "users"),
          where("role", "==", "student"),
        );
        const todaySelectionsQuery = query(
          collection(db, "mealSelections"),
          where("date", "==", today),
        );
        const feedbackQuery = query(collection(db, "feedback"));
        const mealsQuery = query(collection(db, "meals"), orderBy("date", "desc"));

        const [studentsSnap, selectionsSnap, feedbackSnap, mealsSnap] = await Promise.all([
          getDocs(studentsQuery),
          getDocs(todaySelectionsQuery),
          getDocs(feedbackQuery),
          getDocs(mealsQuery),
        ]);
        if (requestId !== authChangeId || auth.currentUser?.uid !== user.uid) return;

        const totalStudents = studentsSnap.size;
        const studentUids = new Set(studentsSnap.docs.map((studentDoc) => studentDoc.id));
        let todaysMealSelections = 0;
        const uniqueParticipants = new Set<string>();
        const mealCounts: AdminMetrics["mealCounts"] = {
          breakfast: 0,
          lunch: 0,
          snacks: 0,
          dinner: 0,
        };

        selectionsSnap.forEach((docSnap) => {
          const uid = String(docSnap.data().uid || "");
          const mealType = String(docSnap.data().mealType || "").toLowerCase() as MealType;
          if (!uid || !studentUids.has(uid) || !mealTypeOptions.includes(mealType)) return;

          todaysMealSelections += 1;
          if (uid) {
            uniqueParticipants.add(uid);
          }

          mealCounts[mealType] += 1;
        });

        const studentRows: StudentRecord[] = [];
        studentsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          studentRows.push({
            uid: docSnap.id,
            name: String(data.name || ""),
            email: String(data.email || ""),
            role: String(data.role || "student"),
            phone: String(data.phone || ""),
            roll: String(data.roll || ""),
            branch: String(data.branch || ""),
            year: String(data.year || ""),
            section: String(data.section || ""),
            hostel: String(data.hostel || ""),
            room: String(data.room || ""),
            subscription: String(data.subscription || ""),
          });
        });

        const mealRows: MealRecord[] = [];
        mealsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const type = String(data.type || "").toLowerCase();
          if (type === "breakfast" || type === "lunch" || type === "snacks" || type === "dinner") {
            mealRows.push({
              id: docSnap.id,
              date: String(data.date || ""),
              type,
              name: String(data.name || ""),
              description: String(data.description || ""),
            });
          }
        });

        const mealParticipationPercentage =
          totalStudents > 0
            ? Math.round((uniqueParticipants.size / totalStudents) * 100)
            : 0;

        const studentsByUid = new Map(studentRows.map((student) => [student.uid, student]));
        const mealsById = new Map(mealRows.map((meal) => [meal.id, meal]));
        const feedbackRows: FeedbackRecord[] = feedbackSnap.docs.map((feedbackDoc) => {
          const data = feedbackDoc.data();
          const student = studentsByUid.get(String(data.uid || ""));
          const mealId = String(data.mealId || "");
          const meal = mealsById.get(mealId);

          return {
            id: feedbackDoc.id,
            student: student?.name || student?.email || String(data.uid || "Unknown student"),
            meal: meal?.name || (mealId ? `Meal (${mealId})` : "Unknown meal"),
            rating: Number(data.rating || 0),
            comment: String(data.comment || ""),
            createdAt: data.createdAt as Timestamp | undefined,
          };
        }).sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));

        setMetrics({
          totalStudents,
          todaysMealSelections,
          mealParticipationPercentage,
          feedbackCount: feedbackSnap.size,
          mealCounts,
        });
        setStudents(studentRows);
        setMeals(mealRows);
        setFeedbackRecords(feedbackRows);
      } catch (loadError) {
        console.error("Failed to load admin dashboard data:", loadError);
        if (requestId === authChangeId) setError("Failed to load admin dashboard data.");
      } finally {
        if (requestId === authChangeId) setIsLoading(false);
      }
    });

    return () => {
      authChangeId += 1;
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, "meals"), orderBy("date", "desc")),
      (snapshot) => {
        const mealRows: MealRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const type = String(data.type || "").toLowerCase();
          if (type === "breakfast" || type === "lunch" || type === "snacks" || type === "dinner") {
            mealRows.push({
              id: docSnap.id,
              date: String(data.date || ""),
              type,
              name: String(data.name || ""),
              description: String(data.description || ""),
            });
          }
        });
        setMeals(mealRows);
      },
      (error) => {
        console.error("Failed to listen for meal entry changes:", error);
        toast.error("Failed to load meal entries.");
      },
    );

    return unsubscribe;
  }, [isAdmin]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;

    return students.filter((student) => {
      const haystack = [
        student.name,
        student.email,
        student.roll,
        student.role,
        student.branch,
        student.year,
        student.section,
        student.hostel,
        student.room,
        student.subscription,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [search, students]);

  const openAddMealDialog = () => {
    setEditingMealId(null);
    setMealForm(emptyMealForm);
    setIsMealDialogOpen(true);
  };

  const openEditMealDialog = (meal: MealRecord) => {
    setEditingMealId(meal.id);
    setMealForm({
      date: meal.date,
      type: meal.type,
      name: meal.name,
      description: meal.description,
    });
    setIsMealDialogOpen(true);
  };

  const handleSaveMeal = async () => {
    if (!mealForm.name.trim() || !mealForm.description.trim() || !mealForm.date.trim()) {
      toast.error("Please complete all meal fields.");
      return;
    }

    try {
      setIsSavingMeal(true);

      if (editingMealId) {
        await updateDoc(doc(db, "meals", editingMealId), {
          date: mealForm.date,
          type: mealForm.type,
          name: mealForm.name.trim(),
          description: mealForm.description.trim(),
        });
      } else {
        await addDoc(collection(db, "meals"), {
          date: mealForm.date,
          type: mealForm.type,
          name: mealForm.name.trim(),
          description: mealForm.description.trim(),
          createdAt: serverTimestamp(),
        });
      }

      toast.success(editingMealId ? "Meal updated successfully!" : "Meal added successfully!");
      setIsMealDialogOpen(false);
      setEditingMealId(null);
      setMealForm(emptyMealForm);
    } catch (saveError) {
      console.error("Failed to save meal entry:", saveError);
      toast.error("Failed to save meal entry.");
    } finally {
      setIsSavingMeal(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteDoc(doc(db, "meals", mealId));
      toast.success("Meal deleted successfully!");
    } catch (deleteError) {
      console.error("Failed to delete meal entry:", deleteError);
      toast.error("Failed to delete meal entry.");
    }
  };


  const isEmpty =
    !isLoading &&
    !error &&
    metrics.totalStudents === 0 &&
    metrics.todaysMealSelections === 0 &&
    metrics.feedbackCount === 0;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          Admin Panel
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time admin overview
        </p>
      </div>

      {isLoading && (
        <div className="glass-card rounded-xl p-6 text-muted-foreground">
          Loading admin dashboard...
        </div>
      )}

      {!isLoading && error && (
        <div className="glass-card rounded-xl p-6 border border-destructive/40 text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && isAdmin && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Students"
              value={metrics.totalStudents}
              subtitle="Registered students"
              icon={Users}
              gradient="primary"
            />

            <StatCard
              title="Today's Meal Selections"
              value={metrics.todaysMealSelections}
              subtitle="Selection records"
              icon={ChefHat}
              gradient="warm"
            />

            <StatCard
              title="Meal Participation"
              value={`${metrics.mealParticipationPercentage}%`}
              subtitle="Students who selected today"
              icon={Percent}
              gradient="cool"
            />

            <StatCard
              title="Feedback Count"
              value={metrics.feedbackCount}
              subtitle="Total feedback records"
              icon={MessageSquare}
              gradient="primary"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-semibold">Meal Analytics</h2>
                  <p className="text-sm text-muted-foreground">Today's Firestore-based breakdown</p>
                </div>
              </div>

              <div className="space-y-3">
                {mealTypeOptions.map((type) => (
                  <div key={type} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="capitalize">{type}</span>
                    <span className="font-medium">{metrics.mealCounts[type]}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-semibold">Students</h2>
                  <p className="text-sm text-muted-foreground">Firestore student list</p>
                </div>
                <div className="w-full max-w-sm relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search students"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="rounded-lg border overflow-x-auto">
                <Table className="min-w-[680px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Hostel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No students found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.uid}>
                          <TableCell>
                            <div className="font-medium">{student.name || "Unnamed"}</div>
                            <div className="text-xs text-muted-foreground">{student.roll || student.subscription || "Student"}</div>
                          </TableCell>
                          <TableCell>{student.email || "-"}</TableCell>
                          <TableCell className="capitalize">{student.role}</TableCell>
                          <TableCell>{[student.branch, student.year, student.section].filter(Boolean).join(" ") || "-"}</TableCell>
                          <TableCell>{[student.hostel, student.room].filter(Boolean).join(" ") || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-display font-semibold">Meal Management</h2>
                <p className="text-sm text-muted-foreground">Add, edit, or delete Firestore meal entries</p>
              </div>
              <Button onClick={openAddMealDialog} className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add Meal
              </Button>
            </div>

            <div className="rounded-lg border overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No meals available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    meals.map((meal) => (
                      <TableRow key={meal.id}>
                        <TableCell>{meal.date}</TableCell>
                        <TableCell className="capitalize">{meal.type}</TableCell>
                        <TableCell>{meal.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{meal.description}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditMealDialog(meal)}>
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteMeal(meal.id)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="mb-4">
              <h2 className="font-display font-semibold">Student Feedback</h2>
              <p className="text-sm text-muted-foreground">Submitted ratings and comments from Firestore</p>
            </div>

            <div className="rounded-lg border overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Meal</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No feedback has been submitted yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedbackRecords.map((feedback) => (
                      <TableRow key={feedback.id}>
                        <TableCell>{feedback.student}</TableCell>
                        <TableCell>{feedback.meal}</TableCell>
                        <TableCell>{feedback.rating} / 5</TableCell>
                        <TableCell className="max-w-sm whitespace-normal break-words">{feedback.comment}</TableCell>
                        <TableCell>
                          {feedback.createdAt?.toDate().toLocaleString() ?? "Pending"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>

          {isEmpty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-6 text-muted-foreground"
            >
              No admin statistics available yet.
            </motion.div>
          )}

          <Dialog open={isMealDialogOpen} onOpenChange={setIsMealDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMealId ? "Edit Meal" : "Add Meal"}</DialogTitle>
                <DialogDescription>
                  Save a Firestore meal entry for breakfast, lunch, snacks, or dinner.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={mealForm.date}
                    onChange={(e) => setMealForm((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={mealForm.type}
                    onValueChange={(value) => setMealForm((prev) => ({ ...prev, type: value as MealType }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mealTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={mealForm.name}
                    onChange={(e) => setMealForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Paneer Butter Masala"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={mealForm.description}
                    onChange={(e) => setMealForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Add ingredients or serving details"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMealDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMeal} disabled={isSavingMeal}>
                  {isSavingMeal ? "Saving..." : editingMealId ? "Update Meal" : "Add Meal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
