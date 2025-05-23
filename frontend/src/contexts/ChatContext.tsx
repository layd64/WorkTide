import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
    sender?: {
        id: string;
        fullName: string;
        imageUrl?: string;
    };
}

interface ChatContextType {
    socket: Socket | null;
    messages: Message[];
    sendMessage: (receiverId: string, content: string) => void;
    loadHistory: (userId: string) => Promise<void>;
    activeChat: string | null;
    setActiveChat: (userId: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id && token) {
            // Prevent multiple connections for the same user
            if (socket && socket.connected) {
                return;
            }

            console.log('Initializing socket for user:', user.id);
            const newSocket = io('http://localhost:3000', {
                query: { userId: user.id },
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Socket connected');
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            newSocket.on('newMessage', (message: Message) => {
                console.log('New message received:', message);
                setMessages((prev) => [...prev, message]);
            });

            return () => {
                console.log('Cleaning up socket');
                newSocket.close();
            };
        }
    }, [user?.id, token]);

    const sendMessage = React.useCallback((receiverId: string, content: string) => {
        if (socket && user) {
            socket.emit('sendMessage', {
                senderId: user.id,
                receiverId,
                content,
            });
        }
    }, [socket, user]);

    const loadHistory = React.useCallback(async (otherUserId: string) => {
        if (!user || !token) return;
        try {
            const response = await fetch(`http://localhost:3000/chat/history/${user.id}/${otherUserId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const history = await response.json();
                if (Array.isArray(history)) {
                    setMessages(history);
                } else {
                    console.error('Invalid history format:', history);
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error('Failed to load chat history', error);
        }
    }, [user, token]);

    useEffect(() => {
        if (activeChat) {
            loadHistory(activeChat);
        }
    }, [activeChat, loadHistory]);

    const value = React.useMemo(() => ({
        socket,
        messages,
        sendMessage,
        loadHistory,
        activeChat,
        setActiveChat
    }), [socket, messages, sendMessage, loadHistory, activeChat]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
