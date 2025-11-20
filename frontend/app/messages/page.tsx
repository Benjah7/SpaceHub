'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Send,
    Search,
    Building2,
    ArrowLeft,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useConversations, useMessages, useSendMessage } from '@/lib/hooks/useApi';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import type { Conversation, Message } from '@/types';
import toast from 'react-hot-toast';

export default function MessagesPage() {
    const { user } = useAuthStore();
    const { conversations, loading: loadingConversations, refetch: refetchConversations } = useConversations();

    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, loading: loadingMessages, refetch: refetchMessages } = useMessages(
        selectedConversation?.id || null
    );

    const { sendMessage, sending } = useSendMessage(selectedConversation?.id || null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Poll for new messages every 5 seconds
    useEffect(() => {
        if (!selectedConversation) return;

        const interval = setInterval(() => {
            refetchMessages();
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedConversation, refetchMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedConversation) return;

        const content = messageText.trim();
        setMessageText('');

        const message = await sendMessage(content);
        if (message) {
            refetchMessages();
            refetchConversations();
        }
    };

    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery) return true;

        const otherParticipant = conv.participants.find(
            (p) => p.userId !== user?.id
        );

        return (
            otherParticipant?.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.property?.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const getOtherParticipant = (conversation: Conversation) => {
        return conversation.participants.find((p) => p.userId !== user?.id)?.user;
    };

    if (loadingConversations) {
        return (
            <div className="min-h-screen bg-neutral-bg py-xl">
                <div className="container-custom">
                    <ListSkeleton count={5} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-bg">
            <div className="container-custom py-lg">
                <h1 className="text-h1 mb-lg">Messages</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                    {/* Conversations List */}
                    <Card className="lg:col-span-1">
                        <div className="p-lg">
                            <div className="mb-md">
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    leftIcon={<Search className="w-4 h-4" />}
                                />
                            </div>

                            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                                {filteredConversations.length === 0 ? (
                                    <EmptyState
                                        icon={MessageSquare}
                                        title="No conversations"
                                        description="Start a conversation with a property owner"
                                    />
                                ) : (
                                    filteredConversations.map((conv) => {
                                        const otherUser = getOtherParticipant(conv);
                                        const isSelected = selectedConversation?.id === conv.id;

                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => setSelectedConversation(conv)}
                                                className={`w-full text-left p-md rounded-lg transition-colors ${isSelected
                                                        ? 'bg-brand-primary/10 border-2 border-brand-primary'
                                                        : 'hover:bg-neutral-bg-secondary'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-sm">
                                                    <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                                                        {otherUser?.profileImage ? (
                                                            <img
                                                                src={otherUser.profileImage}
                                                                alt={otherUser.name}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-h4 text-brand-primary">
                                                                {otherUser?.name.charAt(0) || '?'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between mb-1">
                                                            <p className="text-small font-semibold text-neutral-text-primary truncate">
                                                                {otherUser?.name || 'Unknown User'}
                                                            </p>
                                                            {conv.unreadCount > 0 && (
                                                                <span className="bg-brand-accent text-white text-tiny px-2 py-0.5 rounded-full font-semibold">
                                                                    {conv.unreadCount}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {conv.property && (
                                                            <p className="text-tiny text-neutral-text-tertiary mb-1 truncate flex items-center gap-1">
                                                                <Building2 className="w-3 h-3" />
                                                                {conv.property.propertyName}
                                                            </p>
                                                        )}

                                                        {conv.lastMessage && (
                                                            <p className="text-tiny text-neutral-text-secondary truncate">
                                                                {conv.lastMessage.content}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Messages Panel */}
                    <Card className="lg:col-span-2">
                        {selectedConversation ? (
                            <div className="flex flex-col h-[calc(100vh-200px)]">
                                {/* Header */}
                                <div className="p-lg border-b border-neutral-border">
                                    <div className="flex items-center gap-md">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedConversation(null)}
                                            className="lg:hidden"
                                            leftIcon={<ArrowLeft className="w-4 h-4" />}
                                        />

                                        <div className="flex-1">
                                            <h3 className="text-h4">
                                                {getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
                                            </h3>
                                            {selectedConversation.property && (
                                                <p className="text-small text-neutral-text-secondary flex items-center gap-1">
                                                    <Building2 className="w-4 h-4" />
                                                    {selectedConversation.property.propertyName}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-lg space-y-md">
                                    {loadingMessages ? (
                                        <div className="flex justify-center py-xl">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <EmptyState
                                            icon={MessageSquare}
                                            title="No messages yet"
                                            description="Send a message to start the conversation"
                                        />
                                    ) : (
                                        <AnimatePresence>
                                            {messages.map((message) => {
                                                const isOwnMessage = message.senderId === user?.id;

                                                return (
                                                    <motion.div
                                                        key={message.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] rounded-lg p-md ${isOwnMessage
                                                                    ? 'bg-brand-primary text-white'
                                                                    : 'bg-neutral-bg-secondary text-neutral-text-primary'
                                                                }`}
                                                        >
                                                            <p className="text-small whitespace-pre-wrap break-words">
                                                                {message.content}
                                                            </p>
                                                            <p
                                                                className={`text-tiny mt-1 ${isOwnMessage ? 'text-white/70' : 'text-neutral-text-tertiary'
                                                                    }`}
                                                            >
                                                                {formatRelativeTime(message.createdAt)}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSendMessage} className="p-lg border-t border-neutral-border">
                                    <div className="flex gap-sm">
                                        <Input
                                            placeholder="Type a message..."
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            disabled={sending}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            isLoading={sending}
                                            disabled={!messageText.trim()}
                                            leftIcon={<Send className="w-4 h-4" />}
                                        >
                                            Send
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="p-xl">
                                <EmptyState
                                    icon={MessageSquare}
                                    title="Select a conversation"
                                    description="Choose a conversation from the list to start messaging"
                                />
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}