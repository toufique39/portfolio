
import { Suspense } from "react";
import PublicHome from "@/components/portfolio/PublicHome";

function LoadingPortfolio() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Loading Toufique Ahmed portfolio...</p>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingPortfolio />}>
      
      <PublicHome />
    </Suspense>
  );
}