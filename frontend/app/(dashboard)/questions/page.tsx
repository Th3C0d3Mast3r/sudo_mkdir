import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import AllQuestions from "@/components/AllQuestions";

export default function QuestionPage() {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="h-full py-2 flex flex-col">
        <Suspense fallback={<MultiSkeleton />}>
          <AllQuestions />
        </Suspense>
      </div>
    </div>
  );
}

const MultiSkeleton = () => {
  return (
    <div className="space-y-4 max-w-5xl w-full mx-auto">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
};
