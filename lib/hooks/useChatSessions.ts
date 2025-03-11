import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

// Types
export interface ChatSession {
  id: number;
  userId: number;
  title: string;
  timestamp: string;
  modelName: string;
  modelSubText?: string;
}

export interface CreateSessionInput {
  title: string;
  modelName: string;
  modelSubText?: string;
}

// API functions
const fetchSessions = async (privyId: string): Promise<ChatSession[]> => {
  const response = await fetch(`/api/chat-sessions?privyId=${privyId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }
  return response.json();
};

const fetchSessionById = async (id: number): Promise<ChatSession> => {
  const response = await fetch(`/api/chat-sessions/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }
  return response.json();
};

const createSession = async (data: CreateSessionInput & { privyId: string }): Promise<ChatSession> => {
  const response = await fetch('/api/chat-sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  
  return response.json();
};

const updateSession = async ({ id, ...data }: Partial<ChatSession> & { id: number }): Promise<ChatSession> => {
  const response = await fetch(`/api/chat-sessions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update session');
  }
  
  return response.json();
};

const deleteSession = async (id: number): Promise<void> => {
  const response = await fetch(`/api/chat-sessions/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete session');
  }
};

// React Query hooks
export function useChatSessions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['chatSessions', user?.privyId],
    queryFn: () => fetchSessions(user?.privyId || ''),
    enabled: !!user?.privyId,
  });
}

export function useChatSession(id: number) {
  return useQuery({
    queryKey: ['chatSession', id],
    queryFn: () => fetchSessionById(id),
    enabled: !!id,
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: CreateSessionInput) => 
      createSession({ ...data, privyId: user?.privyId || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions', user?.privyId] });
    },
  });
}

export function useUpdateChatSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: updateSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions', user?.privyId] });
      queryClient.invalidateQueries({ queryKey: ['chatSession', data.id] });
    },
  });
}

export function useDeleteChatSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions', user?.privyId] });
    },
  });
} 