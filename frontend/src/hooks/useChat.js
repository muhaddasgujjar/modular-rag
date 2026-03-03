import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(() => uuidv4());

    // Start a brand new chat session
    const newChat = useCallback(() => {
        setMessages([]);
        setSessionId(uuidv4());
    }, []);

    const sendMessage = useCallback(async (text) => {
        if (!text.trim()) return;

        // 1. Instantly append user's message
        const userMessage = { role: 'user', content: text };
        setMessages((prev) => [...prev, userMessage]);

        // 2. Set loading state
        setIsLoading(true);

        try {
            // 3. Execute fetch POST request
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(${apiUrl}/chat, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: text,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rawData = await response.json();

            // Handle the nested strict schema expected from Phase 0
            if ((rawData.status === 'success' || rawData.status === 'rejected') && rawData.data) {
                // 4. Capture text and tool, append AI message
                const aiMessage = {
                    role: 'ai',
                    content: rawData.data.reply,
                    tool_used: rawData.data.tool_used
                };
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                throw new Error('Unexpected JSON schema received from server.');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            // Fallback AI message for connection/server errors
            setMessages((prev) => [...prev, {
                role: 'ai',
                content: `Error: Unable to reach the Modular RAG server. (${error.message})`,
                tool_used: 'none'
            }]);
        } finally {
            // 5. Set loading to false
            setIsLoading(false);
        }
    }, [sessionId]);

    return {
        messages,
        isLoading,
        sessionId,
        sendMessage,
        newChat,
    };
}

