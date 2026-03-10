import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { StyleCard } from "../components/StyleCard";
import { useAllArtStylesWithProgress } from "../hooks/useQueries";

export default function BrowseStylesPage() {
  const [search, setSearch] = useState("");
  const { data: styles, isLoading } = useAllArtStylesWithProgress();

  const filtered = useMemo(() => {
    if (!styles) return [];
    const q = search.toLowerCase();
    if (!q) return styles;
    return styles.filter(
      (s) =>
        s.artStyle.name.toLowerCase().includes(q) ||
        s.artStyle.timePeriod.toLowerCase().includes(q) ||
        s.artStyle.description.toLowerCase().includes(q),
    );
  }, [styles, search]);

  return (
    <main
      data-ocid="styles.page"
      className="min-h-screen pb-28 md:pb-8 md:pt-20 px-4 max-w-2xl mx-auto"
    >
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8 pb-4"
      >
        <h1 className="font-display font-black text-3xl text-foreground mb-1">
          Browse Styles
        </h1>
        <p className="text-muted-foreground text-sm mb-5">
          Explore the world's greatest art movements
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="styles.search_input"
            placeholder="Search styles, periods…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-card border-border"
          />
        </div>
      </motion.section>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {Array.from({ length: 6 }, (_, i) => `skel-${i}`).map((k) => (
            <Skeleton
              key={k}
              className="h-52 rounded-2xl"
              data-ocid="styles.loading_state"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center gap-3"
          data-ocid="styles.empty_state"
        >
          <div className="w-12 h-12 rounded-2xl bg-pastel-lavender flex items-center justify-center">
            <Search className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">
            {search ? `No results for "${search}"` : "No styles available yet"}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {filtered.map((item, i) => (
            <StyleCard
              key={item.artStyle.id.toString()}
              item={item}
              index={i}
              ocid={`styles.item.${i + 1}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
