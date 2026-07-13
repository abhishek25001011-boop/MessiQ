import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const recentFeedback = [
  { name: "Ankit S.", rating: 5, text: "Biryani was amazing today! Best mess food ever.", time: "2 hours ago" },
  { name: "Priya M.", rating: 4, text: "Lunch was good, but could use more variety in breakfast.", time: "5 hours ago" },
  { name: "Rahul K.", rating: 3, text: "Dinner was okay, roti was a bit hard.", time: "1 day ago" },
  { name: "Sneha R.", rating: 5, text: "Love the new menu additions! Keep it up.", time: "1 day ago" },
  { name: "Vikram D.", rating: 2, text: "Too much oil in today's sabzi.", time: "2 days ago" },
];

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    toast.success("Thank you for your feedback!");
    setRating(0);
    setText("");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Feedback</h1>
        <p className="text-muted-foreground text-sm mt-1">Help us improve your mess experience</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <h2 className="font-semibold mb-4">Rate Today's Meal</h2>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hover || rating) ? "fill-accent text-accent" : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Share your thoughts about the food quality, service, or suggestions..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="mb-4"
        />
        <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground hover:opacity-90">
          <Send className="h-4 w-4 mr-2" /> Submit Feedback
        </Button>
      </motion.div>

      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Recent Feedback</h2>
        <div className="space-y-3">
          {recentFeedback.map((fb, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{fb.name}</span>
                <span className="text-xs text-muted-foreground">{fb.time}</span>
              </div>
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s < fb.rating ? "fill-accent text-accent" : "text-muted-foreground/20"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{fb.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
