'use client';

import { Chatcomp } from "@/components/chat/Chatcomp";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <div className="container mt-4 space-y-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function NewChatPage() {
  return (
    <div className="flex flex-col h-full mt-4">
      <Suspense fallback={<LoadingSkeleton />}>
        <Chatcomp />
      </Suspense>
    </div>
  );
} 