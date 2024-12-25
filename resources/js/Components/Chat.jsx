import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { debounce } from 'lodash';
import { usePage } from '@inertiajs/react';

const Chat = ({ isOpen, onClose, selectedChatId, isAdmin, adminId }) => {
    const { auth } = usePage().props;

    if (!auth?.user) {
        return null;
    }

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeChats, setActiveChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const messagesEndRef = useRef(null);
    const chatChannelRef = useRef(null);
    const notificationChannelRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const cleanupChannels = () => {
        // Cleanup notification channel
        if (notificationChannelRef.current) {
            notificationChannelRef.current.stopListening('.chat.notification');
            window.Echo.leave(notificationChannelRef.current.name);
            notificationChannelRef.current = null;
        }

        // Cleanup chat channel
        if (chatChannelRef.current) {
            chatChannelRef.current.stopListening('.message.sent');
            window.Echo.leave(chatChannelRef.current.name);
            chatChannelRef.current = null;
        }
    };

    // Setup Pusher untuk chat spesifik
    useEffect(() => {
        if (!selectedChat || !window.Echo) return;

        console.log(`Setting up chat channel for chat ${selectedChat.id}`);
        const channel = window.Echo.private(`chat.${selectedChat.id}`);

        // Tambahkan handler untuk subscription succeeded
        channel.subscribed(() => {
            console.log(`✅ Successfully subscribed to chat channel ${selectedChat.id}`);
        });

        channel.listen('.message.sent', (event) => {
            console.log('📨 Received message:', event);
            
            setMessages(prevMessages => {
                // Cek apakah pesan sudah ada
                if (prevMessages.some(msg => msg.id === event.message.id)) {
                    return prevMessages;
                }

                // Tambahkan pesan baru
                const newMessages = [...prevMessages, event.message];
                setTimeout(scrollToBottom, 100);
                return newMessages;
            });
        });

        chatChannelRef.current = channel;

        // Cleanup function yang lebih baik
        return () => {
            if (chatChannelRef.current) {
                console.log(`Unsubscribing from chat channel ${selectedChat.id}`);
                chatChannelRef.current.stopListening('.message.sent');
                window.Echo.leaveChannel(`private-chat.${selectedChat.id}`);
                chatChannelRef.current = null;
            }
        };
    }, [selectedChat?.id]);

    // Setup Pusher untuk notifikasi global
    useEffect(() => {
        if (!window.Echo || !auth?.user?.id) return;

        console.log('Setting up global notification channel');
        const channel = window.Echo.private(`notifications.chat.${auth.user.id}`);
        
        channel.subscribed(() => {
            console.log('✅ Successfully subscribed to notification channel');
        });

        channel.listen('.chat.notification', (event) => {
            console.log('📬 Received notification:', event);
            
            if (event.type === 'new_message') {
                if (selectedChat?.id === event.data.chat_id) {
                    setMessages(prevMessages => {
                        if (prevMessages.some(msg => msg.id === event.data.message.id)) {
                            return prevMessages;
                        }
                        
                        const newMessages = [...prevMessages, event.data.message];
                        setTimeout(scrollToBottom, 100);
                        return newMessages;
                    });
                }
                
                // Update daftar chat
                loadActiveChats();
            }
        });

        notificationChannelRef.current = channel;

        return () => {
            if (notificationChannelRef.current) {
                console.log('Unsubscribing from notification channel');
                notificationChannelRef.current.stopListening('.chat.notification');
                window.Echo.leaveChannel(`private-notifications.chat.${auth.user.id}`);
                notificationChannelRef.current = null;
            }
        };
    }, [auth?.user?.id]);

    // Load active chats on mount
    useEffect(() => {
        loadActiveChats();
        return () => cleanupChannels();
    }, []);

    const loadActiveChats = async () => {
        try {
            const response = await axios.get('/api/chats');
            setActiveChats(response.data);
            return response.data;
        } catch (error) {
            console.error('Error loading chats:', error);
            return [];
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        const messageText = newMessage;
        setNewMessage('');

        try {
            console.log('📤 Sending message:', {
                chatId: selectedChat.id,
                message: messageText,
                is_admin: isAdmin
            });

            const response = await axios.post(`/api/chats/${selectedChat.id}/messages`, {
                message: messageText,
                is_admin: isAdmin
            });

            console.log('✅ Message sent:', response.data);

            // Tambahkan pesan ke state lokal
            const newMsg = {
                id: response.data.id,
                message: response.data.message,
                is_admin: response.data.is_admin,
                created_at: response.data.created_at,
                user: response.data.user
            };
            
            setMessages(prevMessages => [...prevMessages, newMsg]);
            setTimeout(scrollToBottom, 100);

        } catch (error) {
            console.error('❌ Error sending message:', error);
            setNewMessage(messageText);
            toast.error(error.response?.data?.error || 'Gagal mengirim pesan');
        }
    };

    // Handle selectedChatId changes
    useEffect(() => {
        if (selectedChatId) {
            const chat = activeChats.find(c => c.id === selectedChatId);
            if (chat) {
                selectChat(chat);
            } else {
                loadActiveChats().then(chats => {
                    const foundChat = chats.find(c => c.id === selectedChatId);
                    if (foundChat) {
                        selectChat(foundChat);
                    }
                });
            }
        }
    }, [selectedChatId]);

    const selectChat = async (chat) => {
        try {
            setSelectedChat(chat);
            const response = await axios.get(`/api/chats/${chat.id}/messages`);
            setMessages(response.data);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error('Gagal memuat pesan');
        }
    };

    // Tambahkan useEffect untuk auto-refresh messages
    useEffect(() => {
        if (!selectedChat) return;

        // Initial load
        loadMessages(selectedChat.id);

        // Set interval untuk polling
        const interval = setInterval(() => {
            loadMessages(selectedChat.id, true); // true = silent update
        }, 5000); // Poll setiap 5 detik

        return () => clearInterval(interval);
    }, [selectedChat?.id]);

    const loadMessages = async (chatId, silent = false) => {
        try {
            const response = await axios.get(`/api/chats/${chatId}/messages`);
            
            // Update messages hanya jika ada pesan baru
            setMessages(prevMessages => {
                const newMessages = response.data;
                if (JSON.stringify(prevMessages) !== JSON.stringify(newMessages)) {
                    if (!silent) {
                        setTimeout(scrollToBottom, 100);
                    }
                    return newMessages;
                }
                return prevMessages;
            });
        } catch (error) {
            console.error('Error loading messages:', error);
            if (!silent) {
                toast.error('Gagal memuat pesan');
            }
        }
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 text-white bg-gray-800">
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">
                        {isAdmin ? 'Chat dengan Customer' : 'Chat dengan Admin'}
                    </h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {!selectedChat ? (
                // Chat List View
                <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {activeChats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p>Belum ada percakapan</p>
                            </div>
                        ) : (
                            activeChats.map((chat) => (
                                <button
                                    key={chat.id}
                                    onClick={() => selectChat(chat)}
                                    className="flex items-center w-full p-3 space-x-3 text-left transition-colors duration-200 rounded-lg hover:bg-gray-100"
                                >
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{chat.chat_with}</p>
                                        <p className="text-sm text-gray-600">{chat.content_name}</p>
                                        <p className="text-sm text-gray-500">{chat.last_message}</p>
                                    </div>
                                    {chat.unread_count > 0 && (
                                        <span className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full">
                                            {chat.unread_count}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                // Chat View
                <div className="flex flex-col h-[calc(100vh-64px)]">
                    <div className="flex items-center px-4 py-2 space-x-3 bg-gray-100 border-b">
                        <button
                            onClick={() => setSelectedChat(null)}
                            className="p-2 text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h3 className="font-semibold text-gray-800">{selectedChat.chat_with}</h3>
                            <p className="text-sm text-gray-600">{selectedChat.content_name}</p>
                        </div>
                    </div>

                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {messages.map((message) => {
                            const isCurrentUser = message.is_admin === isAdmin;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                            isCurrentUser
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        <p>{message.message}</p>
                                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {new Date(message.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="sticky bottom-0 bg-white border-t">
                        <form onSubmit={handleSendMessage} className="p-4">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Ketik pesan Anda..."
                                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white transition-colors duration-200 bg-gray-800 rounded-lg hover:bg-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;