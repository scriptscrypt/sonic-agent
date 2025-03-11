'use client';

import { useParams, redirect } from 'next/navigation';
import { ChatSession } from '@/components/chat/ChatSession';
import { useChatSession } from '@/lib/hooks/useChatSessions';
import { Suspense } from 'react';

function ChatPageContent({ sessionId }: { sessionId: number }) {
  const { data: session, isLoading, error } = useChatSession(sessionId);
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading session...</div>;
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
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <ChatPageContent sessionId={sessionId} />
    </Suspense>
  );
} 