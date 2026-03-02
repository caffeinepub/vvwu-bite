import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageCircle,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { MenuItem } from "../backend.d.ts";
import {
  useAddRating,
  useAverageRating,
  useMenuByDay,
  useRatingsForItem,
} from "../hooks/useQueries";
import { formatDate, getCurrentDay, getItemImage } from "../utils/constants";

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const displayValue = hovered || value;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          disabled={readonly}
          className={cn(
            "transition-transform",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default",
          )}
        >
          <Star
            className={cn(
              size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5",
              star <= displayValue
                ? "text-accent fill-accent"
                : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ItemRatingCard({ item }: { item: MenuItem }) {
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: ratings, isLoading: ratingsLoading } = useRatingsForItem(
    item.id,
  );
  const { data: avgRating = 0 } = useAverageRating(item.id);
  const addRating = useAddRating();

  const handleSubmit = async () => {
    if (myRating === 0) return;
    await addRating.mutateAsync({
      itemId: item.id,
      rating: BigInt(myRating),
      comment: comment.trim(),
      timestamp: BigInt(Date.now() * 1_000_000),
    });
    setSubmitted(true);
    setShowRatingForm(false);
    setMyRating(0);
    setComment("");
  };

  return (
    <motion.div
      layout
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="flex gap-4 p-4">
        {/* Image */}
        <img
          src={getItemImage(item)}
          alt={item.name}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-sm">{item.name}</h3>
          <p className="text-xs text-muted-foreground">{item.category}</p>

          {/* Average Rating */}
          <div className="flex items-center gap-2 mt-2">
            <StarRating value={Math.round(avgRating)} readonly size="sm" />
            <span className="text-xs text-muted-foreground">
              {avgRating > 0 ? (
                <>
                  {avgRating.toFixed(1)} · {ratings?.length ?? 0} review
                  {(ratings?.length ?? 0) !== 1 ? "s" : ""}
                </>
              ) : (
                "No ratings yet"
              )}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs font-heading gap-1 border-accent/40 text-accent hover:bg-accent/10"
              onClick={() => setShowRatingForm(!showRatingForm)}
            >
              <Star className="h-3 w-3" />
              {submitted ? "Rate Again" : "Rate"}
            </Button>
            {ratings && ratings.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs font-heading gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowReviews(!showReviews)}
              >
                <MessageCircle className="h-3 w-3" />
                Reviews
                {showReviews ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Rating Form */}
      <AnimatePresence>
        {showRatingForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4 space-y-3 bg-muted/30">
              <p className="text-xs font-heading font-semibold text-accent uppercase tracking-wider">
                Your Rating
              </p>
              <StarRating value={myRating} onChange={setMyRating} />
              {myRating > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <Textarea
                    placeholder="Share your thoughts about this dish (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-card border-border text-sm min-h-[80px] resize-none font-sans"
                    rows={3}
                  />
                  <Button
                    size="sm"
                    onClick={() => void handleSubmit()}
                    disabled={addRating.isPending || myRating === 0}
                    className="bg-primary hover:bg-primary/90 font-heading text-xs h-8 gap-1.5"
                  >
                    {addRating.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Star className="h-3.5 w-3.5" />
                    )}
                    Submit Rating
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <AnimatePresence>
        {showReviews && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Reviews
              </p>
              {ratingsLoading ? (
                <div className="space-y-2">
                  {["rsk1", "rsk2"].map((id) => (
                    <Skeleton key={id} className="h-12 w-full" />
                  ))}
                </div>
              ) : ratings && ratings.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {[...ratings]
                    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                    .map((r) => (
                      <div
                        key={`${r.itemId}-${r.timestamp.toString()}`}
                        className="bg-muted/40 rounded-lg p-3 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <StarRating
                            value={Number(r.rating)}
                            readonly
                            size="sm"
                          />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(r.timestamp)}
                          </span>
                        </div>
                        {r.comment && (
                          <p className="text-xs text-muted-foreground">
                            {r.comment}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function RatingsPage() {
  const today = getCurrentDay();
  const { data: items, isLoading } = useMenuByDay(today);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-xs font-heading uppercase tracking-widest text-accent mb-2">
            Today&apos;s Menu
          </p>
          <h1 className="font-display font-bold text-3xl md:text-4xl gradient-text mb-2">
            Ratings & Reviews
          </h1>
          <p className="text-muted-foreground text-sm">
            Share your experience with today&apos;s dishes and help other
            students choose better!
          </p>
        </motion.div>

        {/* Items */}
        {isLoading ? (
          <div className="space-y-4">
            {["rsk1", "rsk2", "rsk3", "rsk4"].map((id) => (
              <Skeleton key={id} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <motion.div
            className="space-y-4"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            initial="hidden"
            animate="show"
          >
            {items.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <ItemRatingCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">⭐</p>
            <p className="text-muted-foreground font-heading">
              No menu items available for today yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
