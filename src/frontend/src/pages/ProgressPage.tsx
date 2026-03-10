import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Star, Target, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { LoginPrompt } from "../components/LoginPrompt";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerStats } from "../hooks/useQueries";
import { useAllArtStyles } from "../hooks/useQueries";

export default function ProgressPage() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: stats, isLoading: statsLoading } = useCallerStats();
  const { data: artStyles } = useAllArtStyles();

  if (!isLoggedIn) {
    return (
      <main
        data-ocid="progress.page"
        className="min-h-screen pb-28 md:pb-8 md:pt-20 px-4 max-w-2xl mx-auto"
      >
        <LoginPrompt message="Sign in to see your learning progress and achievements!" />
      </main>
    );
  }

  const styleMap = new Map(
    artStyles?.map((s) => [s.id.toString(), s.name]) ?? [],
  );

  return (
    <main
      data-ocid="progress.page"
      className="min-h-screen pb-28 md:pb-8 md:pt-20 px-4 max-w-2xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8"
      >
        <h1 className="font-display font-black text-3xl text-foreground mb-1">
          My Progress
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Track your art knowledge journey
        </p>

        {/* Overview stats */}
        {statsLoading ? (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-24 rounded-2xl"
                data-ocid="progress.loading_state"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              {
                label: "Studied",
                icon: BookOpen,
                color: "bg-pastel-lavender",
                value: stats?.stylesStudied.toString() ?? "0",
              },
              {
                label: "Quizzes",
                icon: Target,
                color: "bg-pastel-peach",
                value: stats?.quizzesTaken.toString() ?? "0",
              },
              {
                label: "Avg Score",
                icon: Star,
                color: "bg-pastel-butter",
                value: stats ? `${stats.averageScore.toString()}%` : "—",
              },
            ].map(({ label, icon: Icon, color, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className={`${color} rounded-2xl p-4 flex flex-col items-center gap-1 shadow-soft`}
              >
                <Icon className="w-4 h-4 text-foreground/70" />
                <span className="font-display font-black text-xl text-foreground">
                  {value}
                </span>
                <span className="text-[10px] font-medium text-foreground/60">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Per-style progress */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-display font-bold text-lg text-foreground">
              Style Breakdown
            </h2>
          </div>

          {statsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : !stats || stats.perStyleProgress.length === 0 ? (
            <div
              data-ocid="progress.empty_state"
              className="text-center py-12 bg-card rounded-2xl shadow-soft"
            >
              <TrendingUp className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground font-medium text-sm">
                No quiz attempts yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Take some quizzes to see your progress here!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.perStyleProgress.map(([styleId, progress], i) => {
                const name =
                  styleMap.get(styleId.toString()) ??
                  `Style #${styleId.toString()}`;
                const bestScore = Number(progress.bestScore);
                const attempts = Number(progress.attemptsCount);

                return (
                  <motion.div
                    key={styleId.toString()}
                    data-ocid={`progress.item.${i + 1}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl p-4 shadow-soft"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-foreground">
                        {name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {attempts} attempt{attempts !== 1 ? "s" : ""}
                        </span>
                        <span className="font-display font-bold text-sm text-primary">
                          {bestScore}%
                        </span>
                      </div>
                    </div>
                    <Progress value={bestScore} className="h-2 rounded-full" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
