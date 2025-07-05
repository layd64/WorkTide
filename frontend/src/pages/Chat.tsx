import React, { useEffect, useState, useRef } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

interface Conversation {
    partner: {
        id: string;
        fullName: string;
        imageUrl?: string;
    };
    lastMessage: {
        content: string;
        createdAt: string;
    };
}

const Chat: React.FC = () => {
    const { user, token } = useAuth();
    const { messages, sendMessage, activeChat, setActiveChat } = useChat();
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentPartner, setCurrentPartner] = useState<{ id: string; fullName: string; imageUrl?: string } | null>(null);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (userId) {
            setActiveChat(userId);
        }
    }, [userId, setActiveChat]);

    // Fetch partner details when activeChat changes
    useEffect(() => {
        if (activeChat && token) {
            // First try to find partner in existing conversations
            const existingConv = conversations.find(c => c.partner.id === activeChat);
            if (existingConv) {
                setCurrentPartner(existingConv.partner);
            } else {
                // If not found (new chat), fetch user details
                console.log('Fetching user details for:', activeChat);
                fetch(`http://localhost:3000/api/users/${activeChat}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                    .then(res => {
                        console.log('User fetch response status:', res.status);
                        if (!res.ok) throw new Error('Failed to fetch user');
                        return res.json();
                    })
                    .then(data => {
                        console.log('User data received:', data);
                        if (data && data.fullName) {
                            setCurrentPartner(data);
                        } else {
                            console.error('Invalid user data:', data);
                            setCurrentPartner({ id: activeChat, fullName: 'Unknown User' });
                        }
                    })
                    .catch(err => {
                        console.error('Failed to fetch partner details:', err);
                        setCurrentPartner({ id: activeChat, fullName: 'Unknown User' });
                    });
            }
        } else {
            setCurrentPartner(null);
        }
    }, [activeChat, conversations, token]);

    // Fetch conversations - use useCallback to make it stable
    const fetchConversations = React.useCallback(() => {
        if (user && token) {
            console.log('Fetching conversations for user:', user.id);
            fetch(`http://localhost:3000/api/chat/conversations/${user.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    if (!res.ok) throw new Error('Failed to fetch conversations');
                    return res.json();
                })
                .then((data) => {
                    console.log('Conversations fetched:', data);
                    if (Array.isArray(data)) {
                        setConversations(data);
                    } else {
                        console.error('Conversations data is not an array:', data);
                        setConversations([]);
                    }
                })
                .catch((err) => {
                    console.error('Error fetching conversations:', err);
                    setConversations([]);
                });
        }
    }, [user, token]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations, messages]); // Refresh conversations when messages change

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('http://localhost:3000/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                setAttachments([...attachments, data]);
            } catch (err) {
                console.error('Upload failed', err);
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage((prev) => prev + emojiData.emoji);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeChat && (newMessage.trim() || attachments.length > 0)) {
            sendMessage(activeChat, newMessage, attachments);
            setNewMessage('');
            setAttachments([]);
            setShowEmojiPicker(false);
            // Refresh conversations after sending to ensure the new chat appears
            setTimeout(() => fetchConversations(), 500);
        }
    };

    const handleSelectChat = (partnerId: string) => {
        navigate(`/chat/${partnerId}`);
    };

    if (!user) return <div>Please login to chat.</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Messages</h2>
                </div>
                <ul>
                    {conversations.map((conv) => (
                        <li
                            key={conv.partner.id}
                            onClick={() => handleSelectChat(conv.partner.id)}
                            className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${activeChat === conv.partner.id ? 'bg-blue-50 dark:bg-gray-700' : ''
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                                    {conv.partner.imageUrl ? (
                                        <img src={conv.partner.imageUrl} alt={conv.partner.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                                            {conv.partner.fullName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {conv.partner.fullName}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {conv.lastMessage.content}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
                {activeChat ? (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                            {currentPartner ? (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                                        {currentPartner.imageUrl ? (
                                            <img src={currentPartner.imageUrl} alt={currentPartner.fullName || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                                                {(currentPartner.fullName || '?').charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">{currentPartner.fullName || 'Unknown User'}</h3>
                                </>
                            ) : (
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Chat</h3>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === user.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-2 space-y-2">
                                                    {msg.attachments.map((att: any, idx: number) => (
                                                        <div key={idx}>
                                                            {att.type.startsWith('image/') ? (
                                                                <img src={`http://localhost:3000${att.url}`} alt={att.name} className="max-w-full rounded" />
                                                            ) : (
                                                                <a href={`http://localhost:3000${att.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:underline">
                                                                    <span className="text-xl">📎</span>
                                                                    <span className="break-all">{att.name}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-2 items-end">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept="image/png,image/jpeg,application/pdf,application/zip"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                    title="Attach file"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowEmojiPicker(!showEmojiPicker);
                                        }}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                        title="Add emoji"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                    {showEmojiPicker && (
                                        <>
                                            <div className="fixed inset-0 bg-transparent z-40" onClick={() => setShowEmojiPicker(false)}></div>
                                            <div className="absolute bottom-12 left-0 z-50">
                                                <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.AUTO} />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {attachments.map((att, idx) => (
                                                <div key={idx} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm flex items-center">
                                                    <span className="truncate max-w-[100px] text-gray-800 dark:text-gray-200">{att.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                                                        className="ml-2 text-red-500 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && attachments.length === 0) || isUploading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-10"
                                >
                                    {isUploading ? '...' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
