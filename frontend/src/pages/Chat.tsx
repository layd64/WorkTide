import React, { useEffect, useState, useRef } from 'react';
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
                fetch(`http://localhost:3000/users/${activeChat}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                    .then(res => {
                        if (!res.ok) throw new Error('Failed to fetch user');
                        return res.json();
                    })
                    .then(data => {
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

    useEffect(() => {
        if (user && token) {
            console.log('Fetching conversations for user:', user.id);
            fetch(`http://localhost:3000/chat/conversations/${user.id}`, {
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
    }, [user, token, messages]); // Refresh conversations when messages change

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeChat && newMessage.trim()) {
            sendMessage(activeChat, newMessage);
            setNewMessage('');
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
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Send
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
