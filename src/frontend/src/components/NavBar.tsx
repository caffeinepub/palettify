import { Link, useRouterState } from "@tanstack/react-router";
import { HelpCircle, Home, Palette, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, ocid: "nav.home_link" },
  { to: "/styles", label: "Browse", icon: Palette, ocid: "nav.styles_link" },
  { to: "/quiz", label: "Quiz", icon: HelpCircle, ocid: "nav.quiz_link" },
  {
    to: "/progress",
    label: "Progress",
    icon: TrendingUp,
    ocid: "nav.progress_link",
  },
] as const;

export function NavBar() {
  const router = useRouterState();
  const pathname = router.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto">
      {/* Mobile bottom bar */}
      <div className="md:hidden flex items-center justify-around bg-card/90 backdrop-blur-xl border-t border-border px-2 py-2 safe-area-pb">
        {NAV_ITEMS.map(({ to, label, icon: Icon, ocid }) => {
          const active =
            to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl transition-all ${active ? "bg-primary text-primary-foreground shadow-bloom" : "text-muted-foreground"}`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span
                className={`text-[10px] font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Desktop top bar */}
      <div className="hidden md:flex items-center justify-between bg-card/80 backdrop-blur-xl border-b border-border px-8 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/assets/generated/palettify-logo-transparent.dim_120x120.png"
            alt="Palettify"
            className="w-8 h-8 object-contain"
            loading="eager"
          />
          <span className="font-display font-bold text-xl text-foreground">
            Palettify
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, ocid }) => {
            const active =
              to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                data-ocid={ocid}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-bloom"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
