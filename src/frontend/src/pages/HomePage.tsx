import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { BookOpen, Sparkles, Star, Target } from "lucide-react";
import { motion } from "motion/react";
import { StyleCard } from "../components/StyleCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerStats } from "../hooks/useQueries";
import { useAllArtStylesWithProgress } from "../hooks/useQueries";

const STAT_CARDS = [
  {
    label: "Styles Studied",
    icon: BookOpen,
    color: "bg-pastel-lavender",
    key: "stylesStudied" as const,
  },
  {
    label: "Quizzes Taken",
    icon: Target,
    color: "bg-pastel-peach",
    key: "quizzesTaken" as const,
  },
  {
    label: "Avg. Score",
    icon: Star,
    color: "bg-pastel-butter",
    key: "averageScore" as const,
  },
];

const FEATURED_STYLES_COUNT = 4;

export default function HomePage() {
  const { identity, isInitializing } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: stats, isLoading: statsLoading } = useCallerStats();
  const { data: stylesWithProgress, isLoading: stylesLoading } =
    useAllArtStylesWithProgress();

  const featuredStyles =
    stylesWithProgress?.slice(0, FEATURED_STYLES_COUNT) ?? [];

  return (
    <main
      data-ocid="home.page"
      className="min-h-screen pb-28 md:pb-8 md:pt-20 px-4 max-w-2xl mx-auto"
    >
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-8 pb-6 text-center"
      >
        <div className="flex justify-center mb-4">
          <img
            src="/assets/generated/palettify-logo-transparent.dim_120x120.png"
            alt="Palettify logo"
            className="w-20 h-20 object-contain"
            loading="eager"
          />
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl text-foreground mb-2 tracking-tight">
          Palettify
        </h1>
        <p className="text-muted-foreground text-lg font-medium mb-6">
          Master Every Brushstroke
        </p>

        <Link to="/quiz">
          <Button
            data-ocid="home.start_quiz_button"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold text-base shadow-bloom hover:opacity-90 transition-all gap-2"
            size="lg"
          >
            <Sparkles className="w-4 h-4" />
            Start a Quiz
          </Button>
        </Link>
      </motion.section>

      {/* Stats */}
      {isLoggedIn && !isInitializing && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="font-display font-bold text-lg text-foreground mb-3">
            Your Journey
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {STAT_CARDS.map(({ label, icon: Icon, color, key }, i) => (
              <motion.div
                key={key}
                data-ocid="home.stats.card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className={`${color} rounded-2xl p-4 flex flex-col items-center gap-1 shadow-soft`}
              >
                <Icon className="w-5 h-5 text-foreground/70" />
                {statsLoading ? (
                  <Skeleton
                    className="h-7 w-10 rounded-lg"
                    data-ocid="home.stats.loading_state"
                  />
                ) : (
                  <span className="font-display font-black text-2xl text-foreground">
                    {stats ? stats[key].toString() : "—"}
                  </span>
                )}
                <span className="text-[10px] text-foreground/60 font-medium text-center leading-tight">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Continue Learning */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-foreground">
            Explore Styles
          </h2>
          <Link
            to="/styles"
            data-ocid="nav.styles_link"
            className="text-sm text-primary font-semibold hover:underline"
          >
            View all →
          </Link>
        </div>

        {stylesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from(
              { length: FEATURED_STYLES_COUNT },
              (_, i) => `skel-${i}`,
            ).map((k) => (
              <Skeleton key={k} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : featuredStyles.length === 0 ? (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="home.empty_state"
          >
            <p>No styles available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredStyles.map((item, i) => (
              <StyleCard
                key={item.artStyle.id.toString()}
                item={item}
                index={i}
                ocid={`styles.item.${i + 1}`}
              />
            ))}
          </div>
        )}
      </motion.section>

      {/* Quick actions */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-2 gap-3 mb-8"
      >
        <Link to="/styles">
          <div className="bg-pastel-sky rounded-2xl p-4 flex flex-col gap-2 shadow-soft hover:shadow-bloom transition-all cursor-pointer">
            <BookOpen className="w-6 h-6 text-foreground/70" />
            <span className="font-display font-bold text-foreground text-sm">
              Browse All Styles
            </span>
            <span className="text-xs text-foreground/60">
              Discover art movements
            </span>
          </div>
        </Link>
        <Link to="/progress">
          <div className="bg-pastel-mint rounded-2xl p-4 flex flex-col gap-2 shadow-soft hover:shadow-bloom transition-all cursor-pointer">
            <Star className="w-6 h-6 text-foreground/70" />
            <span className="font-display font-bold text-foreground text-sm">
              My Progress
            </span>
            <span className="text-xs text-foreground/60">
              Track your mastery
            </span>
          </div>
        </Link>
      </motion.section>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pb-4">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </main>
  );
}
