import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async sendMessage(senderId: string, receiverId: string, content: string, attachments?: any[], isSystem: boolean = false) {
        return this.prisma.message.create({
            data: {
                senderId,
                receiverId,
                content,
                attachments: attachments || [],
                isSystem,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                    },
                },
            },
        });
    }

    async getMessages(userId1: string, userId2: string) {
        return this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                    },
                },
            },
        });
    }

    async getConversations(userId: string) {
        // Get all messages where user is sender or receiver
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                    },
                },
            },
        });

        // Group by conversation partner
        const conversations = new Map();

        messages.forEach((msg) => {
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!conversations.has(partner.id)) {
                conversations.set(partner.id, {
                    partner,
                    lastMessage: msg,
                });
            }
        });

        return Array.from(conversations.values());
    }

    async createInitialChatMessage(freelancerId: string, clientId: string) {
        // Create initial system message from freelancer to client
        // This ensures the conversation appears in both users' conversation lists
        return this.sendMessage(
            freelancerId,
            clientId,
            'This chat has been started since both participants decided to work together.',
            [],
            true // Mark as system message
        );
    }
}
