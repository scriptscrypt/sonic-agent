'use client';

import { Chatcomp } from "@/components/chat/Chatcomp";
import { useChatSessions } from "@/lib/hooks/useChatSessions";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

function HomeContent() {
  const { data: sessions, isLoading } = useChatSessions();
  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  return <Chatcomp />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
