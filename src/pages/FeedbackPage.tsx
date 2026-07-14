import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveFeedback, getFeedback } from "@/lib/storage";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");

  const [feedbackList, setFeedbackList] = useState(getFeedback());

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (text.trim() === "") {
      toast.error("Please write your feedback");
      return;
    }

    const newFeedback = {
      rating,
      text,
      date: new Date().toLocaleString(),
    };

    saveFeedback(newFeedback);
    setFeedbackList(getFeedback());

    toast.success("Thank you for your feedback!");

    setRating(0);
    setText("");
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

        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
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
          placeholder="Share your thoughts about today's food..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="mb-4"
        />

        <Button
          onClick={handleSubmit}
          className="gradient-primary text-primary-foreground hover:opacity-90"
        >
          <Send className="h-4 w-4 mr-2" />
          Submit Feedback
        </Button>
      </motion.div>

      <div>
        <h2 className="font-display font-semibold text-lg mb-4">
          Recent Feedback
        </h2>

        <div className="space-y-3">
          {feedbackList.length === 0 ? (
            <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
              No feedback submitted yet.
            </div>
          ) : (
            feedbackList
              .slice()
              .reverse()
              .map((fb, i) => (
                <motion.div
                  key={i}
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
                      {fb.date}
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
                    {fb.text}
                  </p>
                </motion.div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}