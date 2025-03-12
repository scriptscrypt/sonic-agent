'use client';

import { useParams, redirect } from 'next/navigation';
import { ChatSession } from '@/components/chat/ChatSession';
import { useChatSession } from '@/lib/hooks/useChatSessions';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingSkeleton() {
  return (
    <div className="container py-8 space-y-4">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPageContent({ sessionId }: { sessionId: number }) {
  const { data: session, isLoading, error } = useChatSession(sessionId);
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  if (error || !session) {
    redirect('/');
  }
  
  return <ChatSession sessionId={sessionId} />;
}

export default function ChatPage() {
  const params = useParams();
  const sessionId = Number(params.sessionId);
  
  if (isNaN(sessionId)) {
    redirect('/');
  }
  
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ChatPageContent sessionId={sessionId} />
    </Suspense>
  );
} 