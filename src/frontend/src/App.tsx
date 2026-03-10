import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { NavBar } from "./components/NavBar";

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const BrowseStylesPage = lazy(() => import("./pages/BrowseStylesPage"));
const StyleDetailPage = lazy(() => import("./pages/StyleDetailPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));

function PageFallback() {
  return (
    <div className="min-h-screen pb-28 md:pb-8 md:pt-20 px-4 max-w-2xl mx-auto pt-8">
      <Skeleton className="h-8 w-48 rounded-xl mb-4" />
      <Skeleton className="h-5 w-72 rounded-lg mb-6" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// Root layout with nav
const rootRoute = createRootRoute({
  component: () => (
    <div className="relative">
      <NavBar />
      <Outlet />
      <Toaster position="top-center" richColors />
    </div>
  ),
});

// Routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<PageFallback />}>
      <HomePage />
    </Suspense>
  ),
});

const stylesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/styles",
  component: () => (
    <Suspense fallback={<PageFallback />}>
      <BrowseStylesPage />
    </Suspense>
  ),
});

const styleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/styles/$id",
  component: () => (
    <Suspense fallback={<PageFallback />}>
      <StyleDetailPage />
    </Suspense>
  ),
});

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quiz",
  component: () => (
    <Suspense fallback={<PageFallback />}>
      <QuizPage />
    </Suspense>
  ),
});

const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progress",
  component: () => (
    <Suspense fallback={<PageFallback />}>
      <ProgressPage />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  stylesRoute,
  styleDetailRoute,
  quizRoute,
  progressRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
