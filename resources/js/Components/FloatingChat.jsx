import React, { useState, useEffect, useCallback, useRef } from 'react';
import Chat from '@/Components/Chat';
import axios from 'axios';

const FloatingChat = ({ isAdmin = false, adminId = null, auth }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const pusherChannel = useRef(null);

    const setupPusher = useCallback(() => {
        if (!window.Echo) return;

        // Subscribe ke channel untuk notifikasi chat baru
        const userId = isAdmin ? adminId : auth?.user?.id;
        if (!userId) return;

        const channel = window.Echo.private(`notifications.${isAdmin ? 'admin' : 'user'}.${userId}`);
        
        channel.subscribed(() => {
            console.log('Subscribed to notifications channel');
        });

        channel.listen('.chat.message', (event) => {
            console.log('Received chat message notification:', event);
            checkUnreadMessages();
        });

        channel.listen('.chat.created', (event) => {
            console.log('New chat created:', event);
            checkUnreadMessages();
        });

        pusherChannel.current = channel;

        return () => {
            if (pusherChannel.current) {
                pusherChannel.current.stopListening('.chat.message');
                pusherChannel.current.stopListening('.chat.created');
                window.Echo.leave(pusherChannel.current.name);
            }
        };
    }, [isAdmin, adminId, auth?.user?.id]);

    useEffect(() => {
        const handleOpenChat = (event) => {
            console.log('Received open-chat event:', event.detail);
            setSelectedChatId(event.detail.chatId);
            setIsChatOpen(true);
        };

        const cleanup = setupPusher();
        window.addEventListener('open-chat', handleOpenChat);
        checkUnreadMessages();

        // Set interval untuk mengecek pesan baru
        const interval = setInterval(checkUnreadMessages, 30000);

        return () => {
            window.removeEventListener('open-chat', handleOpenChat);
            clearInterval(interval);
            if (cleanup) cleanup();
        };
    }, [setupPusher]);

    const checkUnreadMessages = async () => {
        try {
            const response = await axios.get('/api/chats/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error checking unread messages:', error);
        }
    };

    const handleChatClose = () => {
        setIsChatOpen(false);
        setSelectedChatId(null);
        checkUnreadMessages();
    };

    return (
        <>
            <button
                onClick={() => setIsChatOpen(true)}
                className="fixed z-40 p-4 text-white transition-all duration-300 bg-gray-800 rounded-full shadow-lg bottom-6 right-6 hover:bg-gray-700 hover:scale-110 group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                        {unreadCount}
                    </span>
                )}
                <span className="absolute px-2 py-1 mr-2 text-sm text-white transition-opacity duration-300 bg-gray-900 rounded-lg opacity-0 right-full group-hover:opacity-100 whitespace-nowrap">
                    {isAdmin ? 'Chat Customer' : 'Chat dengan Admin'}
                </span>
            </button>

            <Chat
                isOpen={isChatOpen} 
                onClose={handleChatClose}
                selectedChatId={selectedChatId}
                isAdmin={isAdmin}
                adminId={adminId}
                onMessageReceived={checkUnreadMessages}
            />
        </>
    );
};

export default FloatingChat;