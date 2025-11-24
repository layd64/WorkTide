import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config/api';

interface Attachment {
    url: string;
    type: string;
    name: string;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    isSystem?: boolean; // True for system messages (e.g., initial chat message)
    createdAt: string;
    sender?: {
        id: string;
        fullName: string;
        imageUrl?: string;
    };
    attachments?: Attachment[];
}

interface ChatContextType {
    socket: Socket | null;
    messages: Message[];
    sendMessage: (receiverId: string, content: string, attachments?: Attachment[]) => void;
    loadHistory: (userId: string) => Promise<void>;
    activeChat: string | null;
    setActiveChat: (userId: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const normalizeAttachments = (attachments: any): Attachment[] => {
    if (!attachments) return [];
    
    if (typeof attachments === 'string') {
        try {
            attachments = JSON.parse(attachments);
        } catch (e) {
            return [];
        }
    }
    
    if (!Array.isArray(attachments)) {
        return [];
    }
    
    return attachments.map((att: any) => ({
        url: att.url || '',
        type: att.type || '',
        name: att.name || 'Attachment',
    })).filter((att: Attachment) => att.url);
};

const normalizeMessage = (msg: any): Message => {
    return {
        ...msg,
        attachments: normalizeAttachments(msg.attachments),
    };
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id && token) {
            const socketUrl = API_BASE_URL.replace('/api', '');
            const newSocket = io(socketUrl, {
                query: { userId: user.id },
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
            });

            newSocket.on('disconnect', () => {
            });

            newSocket.on('newMessage', (message: Message) => {
                const normalizedMessage = normalizeMessage(message);
                setMessages((prev) => {
                    const exists = prev.find(m => m.id === normalizedMessage.id);
                    if (exists) {
                        return prev;
                    }
                    return [...prev, normalizedMessage];
                });
            });

            return () => {
                newSocket.close();
            };
        }
    }, [user?.id, token]);

    const sendMessage = React.useCallback((receiverId: string, content: string, attachments?: Attachment[]) => {
        if (socket && user) {
            socket.emit('sendMessage', {
                senderId: user.id,
                receiverId,
                content,
                attachments,
            });
        }
    }, [socket, user]);

    const loadHistory = React.useCallback(async (otherUserId: string) => {
        if (!user || !token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/chat/history/${user.id}/${otherUserId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const history = await response.json();
                if (Array.isArray(history)) {
                    // Normalize all messages to ensure attachments are properly formatted
                    const normalizedHistory = history.map(normalizeMessage);
                    setMessages(normalizedHistory);
                } else {
                    setMessages([]);
                }
            }
        } catch (error) {
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
