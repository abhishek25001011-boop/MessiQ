import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "@/firebase";

export type MealType = "breakfast" | "lunch" | "snacks" | "dinner";
export type MealChoice = "yes" | "no" | "custom";
export type UserRole = "student" | "admin";

export interface MealSelectionRecord {
  uid: string;
  date: string;
  mealType: MealType;
  choice: MealChoice;
}

interface MealSelectionState {
  records: MealSelectionRecord[];
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
}

const mealTypes: MealType[] = ["breakfast", "lunch", "snacks", "dinner"];

function isMealType(value: unknown): value is MealType {
  return typeof value === "string" && mealTypes.includes(value as MealType);
}

function isMealChoice(value: unknown): value is MealChoice {
  return value === "yes" || value === "no" || value === "custom";
}

export function useMealSelectionRecords(): MealSelectionState {
  const [state, setState] = useState<MealSelectionState>({
    records: [],
    role: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    let requestId = 0;
    let unsubscribeSelections: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      const currentRequest = ++requestId;
      unsubscribeSelections?.();
      unsubscribeSelections = undefined;

      if (!user) {
        setState({ records: [], role: null, isLoading: false, error: "Sign in to view meal selection insights." });
        return;
      }

      setState({ records: [], role: null, isLoading: true, error: null });

      try {
        const profileSnapshot = await getDoc(doc(db, "users", user.uid));
        if (!active || currentRequest !== requestId || auth.currentUser?.uid !== user.uid) return;

        const role = profileSnapshot.exists() ? profileSnapshot.data().role : undefined;
        if (role !== "student" && role !== "admin") {
          setState({ records: [], role: null, isLoading: false, error: "We couldn't verify your account role, so meal insights are unavailable." });
          return;
        }

        const selections = collection(db, "mealSelections");
        const selectionsQuery = role === "admin"
          ? selections
          : query(selections, where("uid", "==", user.uid));

        unsubscribeSelections = onSnapshot(
          selectionsQuery,
          (snapshot) => {
            if (!active || currentRequest !== requestId || auth.currentUser?.uid !== user.uid) return;
            const records: MealSelectionRecord[] = [];
            snapshot.forEach((selection) => {
              const data = selection.data();
              if (!isMealType(data.mealType) || !isMealChoice(data.choice)) return;
              const date = typeof data.date === "string" ? data.date : "";
              const uid = typeof data.uid === "string" ? data.uid : "";
              if (!date || !uid) return;
              records.push({ uid, date, mealType: data.mealType, choice: data.choice });
            });
            setState({ records, role, isLoading: false, error: null });
          },
          (error) => {
            console.error("Failed to load meal selection insights:", error);
            if (!active || currentRequest !== requestId) return;
            setState({ records: [], role, isLoading: false, error: "Meal selection data couldn't be loaded. Please try again later." });
          },
        );
      } catch (error) {
        console.error("Failed to verify role for meal selection insights:", error);
        if (!active || currentRequest !== requestId) return;
        setState({ records: [], role: null, isLoading: false, error: "Meal selection data couldn't be loaded. Please try again later." });
      }
    });

    return () => {
      active = false;
      requestId += 1;
      unsubscribeSelections?.();
      unsubscribeAuth();
    };
  }, []);

  return state;
}
