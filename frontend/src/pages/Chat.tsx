import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';

interface Conversation {
    partner: {
        id: string;
        fullName: string;
        imageUrl?: string;
        userType?: string;
    };
    lastMessage: {
        content: string;
        createdAt: string;
    };
}

const Chat: React.FC = () => {
    const { user, token } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { t } = useTranslation();
    const { messages, sendMessage, activeChat, setActiveChat } = useChat();
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentPartner, setCurrentPartner] = useState<{ id: string; fullName: string; imageUrl?: string; userType?: string } | null>(null);

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
                            setCurrentPartner({ id: activeChat, fullName: t('unknownUser') });
                        }
                    })
                    .catch(err => {
                        console.error('Failed to fetch partner details:', err);
                        setCurrentPartner({ id: activeChat, fullName: t('unknownUser') });
                    });
            }
        } else {
            setCurrentPartner(null);
        }
    }, [activeChat, conversations, token, t]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations, messages]); // Refresh conversations when messages change

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Check if click is outside the emoji picker and emoji button
            if (showEmojiPicker && !target.closest('.emoji-picker-container') && !target.closest('button[title="Add emoji"]')) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);


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

    const handleNavigateToProfile = (partnerId: string) => {
        // Unified profile route for all user types
        navigate(`/profile/${partnerId}`);
    };

    if (!user) return <div className="p-4">{t('pleaseLoginChat')}</div>;

    return (
        <div className={`flex h-[calc(100vh-64px)] ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* Sidebar */}
            <div className={`w-1/3 border-r ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} overflow-y-auto`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('messages')}</h2>
                </div>
                <ul>
                    {conversations.map((conv) => (
                        <li
                            key={conv.partner.id}
                            onClick={() => handleSelectChat(conv.partner.id)}
                            className={`p-4 cursor-pointer ${activeChat === conv.partner.id ? isDark ? 'bg-gray-700' : 'bg-blue-50' : ''} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} overflow-hidden cursor-pointer`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNavigateToProfile(conv.partner.id);
                                    }}
                                >
                                    {conv.partner.imageUrl ? (
                                        <img src={conv.partner.imageUrl} alt={conv.partner.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center ${isDark ? 'text-gray-300' : 'text-gray-600'} font-bold`}>
                                            {conv.partner.fullName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm font-medium ${isDark ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} truncate cursor-pointer`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNavigateToProfile(conv.partner.id);
                                        }}
                                    >
                                        {conv.partner.fullName}
                                    </p>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                        {conv.lastMessage.content}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {activeChat ? (
                    <>
                        {/* Header */}
                        <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center space-x-3`}>
                            {currentPartner ? (
                                <>
                                    <div
                                        className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} overflow-hidden cursor-pointer`}
                                        onClick={() => handleNavigateToProfile(currentPartner.id)}
                                    >
                                        {currentPartner.imageUrl ? (
                                            <img src={currentPartner.imageUrl} alt={currentPartner.fullName || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'text-gray-300' : 'text-gray-600'} font-bold`}>
                                                {(currentPartner.fullName || '?').charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3
                                        className={`text-lg font-medium ${isDark ? 'text-white hover:text-blue-400' : 'text-gray-800 hover:text-blue-600'} cursor-pointer`}
                                        onClick={() => handleNavigateToProfile(currentPartner.id)}
                                    >{currentPartner.fullName || t('unknownUser')}</h3>
                                </>
                            ) : (
                                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {t('unknownUser')}
                                </h3>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === user.id;
                                const isSystemMessage = msg.isSystem;

                                // Render system messages differently (centered)
                                if (isSystemMessage) {
                                    return (
                                        <div key={msg.id} className="flex justify-center my-4">
                                            <div className={`max-w-md px-4 py-2 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-lg text-center text-sm`}>
                                                <p>{msg.content}</p>
                                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                // Regular messages
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : (isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800') + ' rounded-bl-none shadow-sm'
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
                                            <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
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
                                    className={`p-2 transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
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
                                        className={`p-2 transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                        title="Add emoji"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-12 left-0 z-50 emoji-picker-container">
                                            <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.AUTO} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {attachments.map((att, idx) => (
                                                <div key={idx} className={`${isDark ? 'bg-gray-700' : 'bg-gray-200'} px-2 py-1 rounded text-sm flex items-center`}>
                                                    <span className={`truncate max-w-[100px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{att.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                                                        className={`ml-2 ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
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
                                        placeholder={t('typeMessage')}
                                        className={`w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && attachments.length === 0) || isUploading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-10"
                                >
                                    {isUploading ? '...' : t('send')}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className={`flex-1 flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('selectChat')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
