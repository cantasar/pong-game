import prisma from '../db/client.js';
import { isFriendService } from '../services/isFriend.service.js';
import { sendMessageService } from '../services/chat.service.js';
import { addClient, removeClient, broadcastMessage, isUserOnline, broadcastUserList } from '../services/websocket.service.js';

export default async function chatSocket(fastify) {
  fastify.get('/ws', { websocket: true }, async (connection, req) => {
    try {
      // JWT token'ını WebSocket protokolünden al
      const token = req.headers['sec-websocket-protocol'];      
      if (!token) {
        connection.close();
        return;
      }
      
      // Token'ı doğrula
      let user;
      try {
        user = fastify.jwt.verify(token);
      } catch (err) {
        connection.close();
        return;
      }
      
      const userId = user.userId;
      console.log(`User ${userId} connected to WebSocket`);
      
      // Kullanıcıyı bağlı kullanıcılar listesine ekle
      addClient(userId, connection);

      // Mevcut kullanıcı listesini gönder
      setTimeout(() => {
        broadcastUserList();
      }, 100);
      
      // Okunmamış mesajları gönder
      try {
        const unreadMessages = await prisma.message.findMany({
          where: {
            receiverId: parseInt(userId),
            isRead: false
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        if (unreadMessages.length > 0) {
          // Okunmamış mesajları gönder
          unreadMessages.forEach(msg => {
            connection.send(JSON.stringify({
              from: msg.senderId,
              content: msg.content,
              createdAt: msg.createdAt,
              isRead: false
            }));
          });
          
          // Mesajları okunmuş olarak işaretle
          const ids = unreadMessages.map(m => m.id);
          await prisma.message.updateMany({
            where: { id: { in: ids } },
            data: { isRead: true }
          });
        }
      } catch (err) {
        console.error('Error fetching/updating unread messages:', err);
      }
      
      // Gelen mesajları işle
      connection.on('message', async messageRaw => {
        try {
          const { receiverId, content } = JSON.parse(messageRaw.toString());
          
          // Arkadaşlık kontrolü
          const friend = await isFriendService(parseInt(userId), parseInt(receiverId));
          if (!friend) {
            connection.send(JSON.stringify({
              error: 'User is not a friend'
            }));
            return;
          }
          
          // Mesaj formatı kontrolü
          if (!receiverId || !content) {
            connection.send(JSON.stringify({
              error: 'Invalid message format'
            }));
            return;
          }
          
          // Mesajı veritabanına kaydet
          const newMessage = await sendMessageService(parseInt(userId), parseInt(receiverId), content);
          
          // Mesajı diğer kullanıcılara yayınla
          broadcastMessage(parseInt(userId), parseInt(receiverId), content, newMessage.createdAt);

        } catch (err) {
          console.error('Error processing message:', err);
          connection.send(JSON.stringify({
            error: 'Failed to send message'
          }));
        }
      });
      
      // Bağlantı kapandığında temizlik
      connection.on('close', () => {
        removeClient(userId);
        console.log(`User ${userId} disconnected`);
      });
      
      // Hata durumunda temizlik
      connection.on('error', (err) => {
        console.error(`WebSocket error for user ${userId}:`, err);
        removeClient(userId);
      });

    } catch (err) {
      console.error('Error in WebSocket connection:', err);
      connection.close();
    }
  });
}