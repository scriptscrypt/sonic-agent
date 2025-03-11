import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface ChatMessage {
  id: number;
  sessionId: number;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface CreateMessageInput {
  content: string;
  role: 'user' | 'assistant';
}

// API functions
const fetchMessages = async (sessionId: number): Promise<ChatMessage[]> => {
  const response = await fetch(`/api/chat-sessions/${sessionId}/messages`);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
};

const createMessage = async (sessionId: number, data: CreateMessageInput): Promise<ChatMessage> => {
  const response = await fetch(`/api/chat-sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create message');
  }
  
  return response.json();
};

// React Query hooks
export function useChatMessages(sessionId: number) {
  return useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: () => fetchMessages(sessionId),
    enabled: !!sessionId,
  });
}

export function useCreateChatMessage(sessionId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMessageInput) => createMessage(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });
    },
  });
}

// Function to send a message to the AI and get a response
export async function sendMessageToAI(message: string, modelName: string): Promise<string> {
  console.log("Sending message to AI:", { message, modelName });
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, modelName }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to get AI response:", errorText);
      throw new Error(`Failed to get AI response: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("AI response received:", data);
    return data.response;
  } catch (error) {
    console.error("Error in sendMessageToAI:", error);
    throw error;
  }
}

// Hook for sending a message to the AI and storing both the user message and AI response
export function useSendMessageToAI(sessionId: number) {
  const createMessage = useCreateChatMessage(sessionId);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ message, modelName }: { message: string; modelName: string }) => {
      console.log("useSendMessageToAI called with:", { message, modelName, sessionId });
      
      try {
        // First, create the user message
        const userMessage = await createMessage.mutateAsync({
          content: message,
          role: 'user',
        });
        
        console.log("User message created:", userMessage);
        
        // Then, get the AI response
        const aiResponse = await sendMessageToAI(message, modelName);
        
        console.log("AI response received:", aiResponse);
        
        // Finally, create the assistant message
        const assistantMessage = await createMessage.mutateAsync({
          content: aiResponse,
          role: 'assistant',
        });
        
        console.log("Assistant message created:", assistantMessage);
        
        return aiResponse;
      } catch (error) {
        console.error("Error in useSendMessageToAI:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });
    },
    onError: (error) => {
      console.error("Mutation error in useSendMessageToAI:", error);
    }
  });
} 