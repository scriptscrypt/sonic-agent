'use client';

import { Chatcomp } from "@/components/chat/Chatcomp";
import { useChatSessions } from "@/lib/hooks/useChatSessions";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
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

function HomeContent() {
  const { data: sessions, isLoading } = useChatSessions();
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  return <div className="mt-4"><Chatcomp /></div>;
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
