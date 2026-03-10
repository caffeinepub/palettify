import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { QuizResult } from "../backend.d";
import { LoginPrompt } from "../components/LoginPrompt";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useRandomQuizQuestion,
  useSubmitQuizAnswer,
} from "../hooks/useQueries";

const OPTION_COLORS = [
  "bg-pastel-pink hover:bg-pastel-pink/70",
  "bg-pastel-lavender hover:bg-pastel-lavender/70",
  "bg-pastel-peach hover:bg-pastel-peach/70",
  "bg-pastel-sky hover:bg-pastel-sky/70",
];

const OPTION_OCIDS = [
  "quiz.option.1",
  "quiz.option.2",
  "quiz.option.3",
  "quiz.option.4",
];

export default function QuizPage() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const queryClient = useQueryClient();

  const [sessionScore, setSessionScore] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<bigint | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [quizKey, setQuizKey] = useState(0);

  const { data: question, isLoading, isError } = useRandomQuizQuestion();
  const submitAnswer = useSubmitQuizAnswer();

  const handleSelect = useCallback(
    async (optionStyleId: bigint) => {
      if (!question || selectedId !== null) return;
      setSelectedId(optionStyleId);

      const isCorrect = optionStyleId === question.correctStyleId;
      const score = isCorrect ? BigInt(100) : BigInt(0);

      try {
        const res = await submitAnswer.mutateAsync({
          styleId: question.correctStyleId,
          selectedStyleId: optionStyleId,
          score,
        });
        setResult(res);
        setSessionTotal((t) => t + 1);
        if (res.correct) setSessionScore((s) => s + 1);
      } catch {
        toast.error("Could not submit answer");
      }
    },
    [question, selectedId, submitAnswer],
  );

  const handleNext = useCallback(() => {
    setSelectedId(null);
    setResult(null);
    setQuizKey((k) => k + 1);
    void queryClient.invalidateQueries({ queryKey: ["randomQuizQuestion"] });
  }, [queryClient]);

  if (!isLoggedIn) {
    return (
      <main
        data-ocid="quiz.page"
        className="min-h-screen pb-28 md:pb-8 md:pt-20 px-4 max-w-lg mx-auto"
      >
        <LoginPrompt message="Sign in to take quizzes and track your art knowledge!" />
      </main>
    );
  }

  return (
    <main
      data-ocid="quiz.page"
      className="min-h-screen pb-28 md:pb-8 md:pt-20 px-4 max-w-lg mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-black text-2xl text-foreground">
              Art Quiz
            </h1>
            <p className="text-sm text-muted-foreground">
              Identify the style from the clue
            </p>
          </div>
          <div className="bg-pastel-butter rounded-2xl px-4 py-2 text-center">
            <p className="font-display font-black text-xl text-foreground">
              {sessionScore}/{sessionTotal}
            </p>
            <p className="text-xs text-foreground/60">Score</p>
          </div>
        </div>

        {/* Quiz content */}
        <AnimatePresence mode="wait" key={quizKey}>
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              data-ocid="quiz.loading_state"
              className="space-y-4"
            >
              <Skeleton className="h-36 w-full rounded-2xl" />
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </motion.div>
          ) : isError || !question ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-ocid="quiz.error_state"
              className="text-center py-12"
            >
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                {!question
                  ? "No questions available yet."
                  : "Failed to load question."}
              </p>
              <Button
                onClick={handleNext}
                variant="outline"
                className="rounded-xl gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={`question-${quizKey}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Clue card */}
              <div className="bg-card rounded-2xl p-6 shadow-soft mb-5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  {question.clueType === "artwork"
                    ? "🖼 Artwork Clue"
                    : "✨ Characteristic Clue"}
                </span>
                <p className="font-display font-bold text-xl text-foreground leading-snug">
                  "{question.clue}"
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center mb-4 font-medium">
                Which art style does this belong to?
              </p>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {question.options.slice(0, 4).map((option, i) => {
                  const isSelected = selectedId === option.styleId;
                  const isCorrectOption =
                    result && option.styleId === result.correctStyleId;
                  const isWrongSelected =
                    isSelected && result && !result.correct;

                  let optionClass = `w-full text-left px-5 py-4 rounded-2xl font-semibold text-sm transition-all shadow-soft ${OPTION_COLORS[i % OPTION_COLORS.length]}`;

                  if (result) {
                    if (isCorrectOption) {
                      optionClass =
                        "w-full text-left px-5 py-4 rounded-2xl font-semibold text-sm transition-all bg-accent text-accent-foreground shadow-soft ring-2 ring-accent";
                    } else if (isWrongSelected) {
                      optionClass =
                        "w-full text-left px-5 py-4 rounded-2xl font-semibold text-sm transition-all bg-destructive/20 text-destructive shadow-soft ring-2 ring-destructive/40";
                    } else {
                      optionClass =
                        "w-full text-left px-5 py-4 rounded-2xl font-semibold text-sm opacity-50 bg-muted text-muted-foreground cursor-not-allowed";
                    }
                  }

                  return (
                    <motion.button
                      key={option.styleId.toString()}
                      data-ocid={OPTION_OCIDS[i]}
                      whileTap={!result ? { scale: 0.98 } : {}}
                      className={optionClass}
                      disabled={!!result || submitAnswer.isPending}
                      onClick={() => handleSelect(option.styleId)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.styleName}</span>
                        {isCorrectOption && (
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        )}
                        {isWrongSelected && (
                          <XCircle className="w-4 h-4 flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Result feedback */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    data-ocid="quiz.success_state"
                    className={`rounded-2xl p-4 mb-4 flex items-center gap-3 ${
                      result.correct ? "bg-accent/40" : "bg-pastel-peach/60"
                    }`}
                  >
                    {result.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-accent-foreground flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {result.correct ? "Correct! 🎉" : "Not quite!"}
                      </p>
                      <p className="text-xs text-foreground/70">
                        The answer was:{" "}
                        <strong>{result.correctStyleName}</strong>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit / Next */}
              {submitAnswer.isPending && (
                <div className="flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {result && (
                <Button
                  data-ocid="quiz.next_button"
                  onClick={handleNext}
                  className="w-full rounded-2xl bg-primary text-primary-foreground shadow-bloom hover:opacity-90 font-bold gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Next Question
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
