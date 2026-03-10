import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import type { ArtStyleWithProgress } from "../backend.d";

const PALETTE_COLORS = [
  "bg-pastel-pink",
  "bg-pastel-lavender",
  "bg-pastel-peach",
  "bg-pastel-mint",
  "bg-pastel-sky",
  "bg-pastel-butter",
  "bg-pastel-lilac",
];

const GLOW_COLORS = [
  "card-glow-pink",
  "card-glow-lav",
  "card-glow-peach",
  "card-glow-mint",
  "card-glow-sky",
  "card-glow-peach",
  "card-glow-lav",
];

interface StyleCardProps {
  item: ArtStyleWithProgress;
  index: number;
  ocid: string;
}

export function StyleCard({ item, index, ocid }: StyleCardProps) {
  const colorIdx = Number(item.artStyle.id) % PALETTE_COLORS.length;
  const bgColor = PALETTE_COLORS[colorIdx];
  const glow = GLOW_COLORS[colorIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      data-ocid={ocid}
    >
      <Link
        to="/styles/$id"
        params={{ id: item.artStyle.id.toString() }}
        className={`block rounded-2xl overflow-hidden bg-card shadow-soft ${glow} transition-all`}
      >
        {/* Color band */}
        <div className={`h-2 w-full ${bgColor} opacity-70`} />

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-bold text-lg text-foreground leading-tight">
              {item.artStyle.name}
            </h3>
            {item.isStudied && (
              <CheckCircle2 className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
            )}
          </div>

          <p className="text-xs text-muted-foreground font-medium mb-3">
            {item.artStyle.timePeriod}
          </p>

          <p className="text-sm text-foreground/70 line-clamp-2 mb-4">
            {item.artStyle.description}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {item.isStudied && (
              <Badge className="bg-pastel-mint text-accent-foreground text-xs font-semibold">
                ✓ Studied
              </Badge>
            )}
            {item.progress && (
              <Badge variant="outline" className="text-xs">
                Best: {item.progress.bestScore.toString()}%
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {item.artStyle.characteristics.length} traits
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
