import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type Timestamp,
} from "firebase/firestore";

interface FeedbackRecord {
  id: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp;
}

interface MealSelectionRecord {
  mealType: string;
  mealId: string;
  choice: string;
}

interface MealRecord {
  id: string;
  type: string;
  name: string;
}

function getCurrentMealType(): string {
  const hour = new Date().getHours();

  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  if (hour < 19) return "snacks";
  return "dinner";
}

function getFeedbackDocId(uid: string, mealId: string) {
  return `${uid}_${mealId}`;
}

function getLocalDateString() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
}

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [isStudent, setIsStudent] = useState<boolean | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [todayMeals, setTodayMeals] = useState<MealRecord[]>([]);
  const [selectedMealId, setSelectedMealId] = useState("");
  const [isMealLoading, setIsMealLoading] = useState(true);
  const [mealError, setMealError] = useState<string | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = getLocalDateString();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUid(user?.uid ?? null);
      setTodayMeals([]);
      setSelectedMealId("");
      setIsMealLoading(Boolean(user));
      setMealError(null);

      if (!user) {
        setIsStudent(false);
        setAccessError("Please log in with a student account to submit feedback.");
        return;
      }

      setIsStudent(null);
      setAccessError(null);
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (auth.currentUser?.uid !== user.uid) return;
        const student = userSnap.exists() && userSnap.data().role === "student";
        setIsStudent(student);
        if (!student) setAccessError("Feedback is available to student accounts only.");
      } catch (error) {
        console.error("Failed to verify the student's profile:", error);
        if (auth.currentUser?.uid !== user.uid) return;
        setIsStudent(false);
        setAccessError("Unable to verify your student account.");
      }
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!uid || isStudent !== true) {
      setFeedbackList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFeedbackError(null);

    const feedbackQuery = query(
      collection(db, "feedback"),
      where("uid", "==", uid),
    );

    const unsubscribeFeedback = onSnapshot(
      feedbackQuery,
      (snapshot) => {
        const rows: FeedbackRecord[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          rows.push({
            id: docSnap.id,
            rating: Number(data.rating || 0),
            comment: String(data.comment || ""),
            createdAt: data.createdAt as Timestamp | undefined,
          });
        });

        rows.sort((a, b) => {
          const aMs = a.createdAt?.toMillis?.() ?? 0;
          const bMs = b.createdAt?.toMillis?.() ?? 0;
          return bMs - aMs;
        });

        setFeedbackList(rows);
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to load feedback records:", error);
        setFeedbackError("Failed to load feedback.");
        setIsLoading(false);
      },
    );

    return unsubscribeFeedback;
  }, [uid, isStudent]);

  useEffect(() => {
    if (!uid || isStudent !== true) {
      setTodayMeals([]);
      setSelectedMealId("");
      setIsMealLoading(false);
      return;
    }

    let active = true;
    const resolveCurrentMealId = async () => {
      setIsMealLoading(true);
      setMealError(null);
      setTodayMeals([]);
      setSelectedMealId("");

      try {
        const mealsQuery = query(
          collection(db, "meals"),
          where("date", "==", today),
        );
        const mealsSnapshot = await getDocs(mealsQuery);
        if (!active || auth.currentUser?.uid !== uid) return;

        const meals: MealRecord[] = [];
        mealsSnapshot.forEach((mealDoc) => {
          const data = mealDoc.data();
          const type = String(data.type || "").toLowerCase();
          const name = String(data.name || "").trim();
          if (["breakfast", "lunch", "snacks", "dinner"].includes(type) && name) {
            meals.push({ id: mealDoc.id, type, name });
          }
        });
        setTodayMeals(meals);

        if (!meals.length) {
          setSelectedMealId("");
          return;
        }

        const selections: MealSelectionRecord[] = [];
        try {
          const selectionQuery = query(
            collection(db, "mealSelections"),
            where("uid", "==", uid),
            where("date", "==", today),
          );
          const snapshot = await getDocs(selectionQuery);
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            selections.push({
              mealType: String(data.mealType || ""),
              mealId: String(data.mealId || ""),
              choice: String(data.choice || ""),
            });
          });
        } catch (error) {
          console.error("Failed to load saved meal choice for feedback:", error);
        }
        if (!active || auth.currentUser?.uid !== uid) return;

        const preferredType = getCurrentMealType();
        const mealIds = new Set(meals.map((meal) => meal.id));
        const preferred = selections.find((selection) =>
          selection.mealType === preferredType &&
          selection.choice !== "no" &&
          mealIds.has(selection.mealId),
        );
        const fallback = selections.find((selection) =>
          selection.choice !== "no" && mealIds.has(selection.mealId),
        );

        setSelectedMealId(preferred?.mealId || fallback?.mealId || (meals.length === 1 ? meals[0].id : ""));
      } catch (error) {
        console.error("Failed to resolve today's meal for feedback:", error);
        if (active) setMealError("Unable to load today's meal. Please try again later.");
      } finally {
        if (active) setIsMealLoading(false);
      }
    };

    resolveCurrentMealId();
    return () => {
      active = false;
    };
  }, [uid, isStudent, today]);

  const handleSubmit = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || userId !== uid || isStudent !== true) {
      toast.error("Please log in with a student account to submit feedback.");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim() === "") {
      toast.error("Please write your feedback");
      return;
    }

    if (!selectedMealId) {
      toast.error("Please select today's meal before submitting feedback.");
      return;
    }

    try {
      setIsSubmitting(true);

      const feedbackId = getFeedbackDocId(userId, selectedMealId);
      const feedbackRef = doc(db, "feedback", feedbackId);
      await runTransaction(db, async (transaction) => {
        const existingFeedback = await transaction.get(feedbackRef);
        if (existingFeedback.exists()) throw new Error("FEEDBACK_ALREADY_EXISTS");

        transaction.set(feedbackRef, {
          uid: userId,
          mealId: selectedMealId,
          rating,
          comment: comment.trim(),
          createdAt: serverTimestamp(),
        });
      });

      toast.success("Thank you for your feedback!");

      setRating(0);
      setComment("");
    } catch (error) {
      if (!(error instanceof Error && error.message === "FEEDBACK_ALREADY_EXISTS")) {
        console.error("Failed to submit meal feedback:", error);
      }
      toast.error(
        error instanceof Error && error.message === "FEEDBACK_ALREADY_EXISTS"
          ? "Feedback already submitted for this meal."
          : "Failed to submit feedback. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          Feedback
        </h1>

        <p className="text-muted-foreground text-sm mt-1">
          Help us improve your mess experience
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <h2 className="font-semibold mb-4">
          Rate Today's Meal
        </h2>

        {accessError && <p className="mb-4 text-sm text-destructive">{accessError}</p>}
        {isMealLoading && <p className="mb-4 text-sm text-muted-foreground">Finding your meal...</p>}
        {!isMealLoading && mealError && <p className="mb-4 text-sm text-destructive">{mealError}</p>}
        {!isMealLoading && !mealError && isStudent && todayMeals.length === 0 && (
          <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">No meal is available to rate today.</p>
        )}

        {!isMealLoading && !mealError && todayMeals.length > 1 && (
          <div className="mb-4 space-y-2">
            <label htmlFor="feedback-meal" className="text-sm font-medium">Meal to rate</label>
            <select
              id="feedback-meal"
              value={selectedMealId}
              onChange={(event) => {
                setSelectedMealId(event.target.value);
                setRating(0);
                setComment("");
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting || isStudent !== true}
            >
              <option value="">Choose a meal to rate</option>
              {todayMeals.map((meal) => (
                <option key={meal.id} value={meal.id}>
                  {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} — {meal.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isMealLoading && !mealError && todayMeals.length === 1 && (
          <p className="mb-4 text-sm text-muted-foreground">Meal to rate: <span className="font-medium text-foreground">{todayMeals[0].name}</span></p>
        )}

        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`Rate ${star} out of 5`}
              aria-pressed={rating === star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
              disabled={isSubmitting || isStudent !== true || isMealLoading || !selectedMealId}
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hover || rating)
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>

        <Textarea
          aria-label="Feedback comment"
          placeholder="Share your thoughts about today's food..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="mb-4"
          disabled={isSubmitting || isStudent !== true || isMealLoading || !selectedMealId}
        />

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isStudent !== true || isMealLoading || !selectedMealId || !rating || !comment.trim()}
          className="gradient-primary text-primary-foreground hover:opacity-90"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </motion.div>

      <div>
        <h2 className="font-display font-semibold text-lg mb-4">
          Recent Feedback
        </h2>

        <div className="space-y-3">
          {isLoading ? (
            <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
              Loading feedback...
            </div>
          ) : feedbackError ? (
            <div className="glass-card rounded-xl p-6 text-center text-destructive">
              {feedbackError}
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
              No feedback submitted yet.
            </div>
          ) : (
            <>
              {feedbackList
                .map((fb, i) => (
                  <motion.div
                    key={fb.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        Student
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {fb.createdAt
                          ? new Date(fb.createdAt.toMillis()).toLocaleString()
                          : "Just now"}
                      </span>
                    </div>

                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s < fb.rating
                              ? "fill-accent text-accent"
                              : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {fb.comment}
                    </p>
                  </motion.div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
