import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Frame,
  HelpCircle,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useArtStyle } from "../hooks/useQueries";
import { useAllArtStylesWithProgress } from "../hooks/useQueries";
import {
  useMarkStyleAsStudied,
  useUnmarkStyleAsStudied,
} from "../hooks/useQueries";

const CHIP_COLORS = [
  "bg-pastel-pink text-foreground/80",
  "bg-pastel-lavender text-foreground/80",
  "bg-pastel-peach text-foreground/80",
  "bg-pastel-mint text-foreground/80",
  "bg-pastel-sky text-foreground/80",
  "bg-pastel-butter text-foreground/80",
  "bg-pastel-lilac text-foreground/80",
];

export default function StyleDetailPage() {
  const { id } = useParams({ from: "/styles/$id" });
  const styleId = BigInt(id);
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: artStyle, isLoading } = useArtStyle(styleId);
  const { data: allStyles } = useAllArtStylesWithProgress();
  const progressItem = allStyles?.find((s) => s.artStyle.id === styleId);

  const markStudied = useMarkStyleAsStudied();
  const unmarkStudied = useUnmarkStyleAsStudied();

  const isStudied = progressItem?.isStudied ?? false;
  const isPending = markStudied.isPending || unmarkStudied.isPending;

  const handleToggleStudied = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to track your progress");
      return;
    }
    try {
      if (isStudied) {
        await unmarkStudied.mutateAsync(styleId);
        toast.success("Removed from studied styles");
      } else {
        await markStudied.mutateAsync(styleId);
        toast.success("Marked as studied! 🎨");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pb-28 md:pb-8 md:pt-20 px-4 max-w-2xl mx-auto pt-6">
        <Skeleton className="h-6 w-20 rounded-lg mb-6" />
        <Skeleton className="h-10 w-64 rounded-xl mb-3" />
        <Skeleton className="h-5 w-40 rounded-lg mb-6" />
        <Skeleton className="h-32 w-full rounded-2xl mb-4" />
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
      </main>
    );
  }

  if (!artStyle) {
    return (
      <main className="min-h-screen pb-28 md:pb-8 md:pt-20 px-4 max-w-2xl mx-auto pt-6 text-center">
        <p className="text-muted-foreground mt-12">Style not found.</p>
        <Link to="/styles" className="text-primary underline mt-4 block">
          Browse all styles
        </Link>
      </main>
    );
  }

  return (
    <main
      data-ocid="style_detail.page"
      className="min-h-screen pb-28 md:pb-8 md:pt-20 px-4 max-w-2xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6"
      >
        {/* Back */}
        <Link
          to="/styles"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All styles
        </Link>

        {/* Header */}
        <div className="mb-5">
          <h1 className="font-display font-black text-3xl text-foreground mb-1">
            {artStyle.name}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {artStyle.timePeriod}
          </p>
        </div>

        {/* Description */}
        <div className="bg-card rounded-2xl p-5 shadow-soft mb-5">
          <p className="text-foreground/80 leading-relaxed text-sm">
            {artStyle.description}
          </p>
        </div>

        {/* Characteristics */}
        {artStyle.characteristics.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-5"
          >
            <h2 className="font-display font-bold text-base text-foreground mb-3">
              Key Characteristics
            </h2>
            <div className="flex flex-wrap gap-2">
              {artStyle.characteristics.map((trait, i) => (
                <span
                  key={trait}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${CHIP_COLORS[i % CHIP_COLORS.length]}`}
                >
                  {trait}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Notable Artists */}
        {artStyle.notableArtists.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-5"
          >
            <h2 className="font-display font-bold text-base text-foreground mb-3">
              Notable Artists
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {artStyle.notableArtists.map((artist) => (
                <div
                  key={artist}
                  className="flex items-center gap-2 bg-pastel-sky/40 rounded-xl px-3 py-2"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">
                    {artist}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Example Artworks */}
        {artStyle.artworks.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="font-display font-bold text-base text-foreground mb-3">
              Example Artworks
            </h2>
            <div className="space-y-2">
              {artStyle.artworks.map((artwork) => (
                <div
                  key={`${artwork.title}-${artwork.artist}`}
                  className="flex items-start gap-3 bg-card rounded-xl p-3 shadow-soft"
                >
                  <Frame className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {artwork.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {artwork.artist}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Progress */}
        {progressItem?.progress && (
          <div className="bg-pastel-butter/60 rounded-2xl p-4 mb-5 flex items-center gap-4">
            <div>
              <p className="text-xs text-foreground/60">Best Score</p>
              <p className="font-display font-bold text-xl text-foreground">
                {progressItem.progress.bestScore.toString()}%
              </p>
            </div>
            <div>
              <p className="text-xs text-foreground/60">Attempts</p>
              <p className="font-display font-bold text-xl text-foreground">
                {progressItem.progress.attemptsCount.toString()}
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            data-ocid="style_detail.studied_toggle"
            onClick={handleToggleStudied}
            disabled={isPending}
            variant="outline"
            className={`flex-1 rounded-xl gap-2 font-semibold border-2 transition-all ${
              isStudied
                ? "border-accent bg-accent/20 text-accent-foreground"
                : "border-border"
            }`}
          >
            {isStudied ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Studied!
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" /> Mark as Studied
              </>
            )}
          </Button>

          <Link to="/quiz" className="flex-1">
            <Button
              data-ocid="style_detail.quiz_button"
              className="w-full rounded-xl gap-2 font-semibold bg-primary text-primary-foreground shadow-bloom hover:opacity-90"
            >
              <HelpCircle className="w-4 h-4" />
              Quiz Me
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
