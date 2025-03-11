'use client';

import { Chatcomp } from "@/components/chat/Chatcomp";
import { Suspense } from "react";

export default function NewChatPage() {
  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
        <Chatcomp />
      </Suspense>
    </div>
  );
} 