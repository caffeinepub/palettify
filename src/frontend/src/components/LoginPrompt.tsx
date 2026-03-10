import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginPromptProps {
  message?: string;
}

export function LoginPrompt({
  message = "Sign in to track your progress and take quizzes!",
}: LoginPromptProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-pastel-lavender flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h2 className="font-display font-bold text-2xl text-foreground mb-2">
        Join Palettify
      </h2>
      <p className="text-muted-foreground max-w-xs mb-6">{message}</p>
      <Button
        onClick={login}
        disabled={isLoggingIn}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-semibold shadow-bloom hover:opacity-90 transition-all"
        data-ocid="login.primary_button"
      >
        {isLoggingIn ? "Connecting…" : "Sign In"}
      </Button>
    </motion.div>
  );
}
