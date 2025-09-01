import {rooms, userRoom, startGame} from '../controller/game.controller.js'
import { sendMessage, createRoom, addPlayerToRoom } from '../utils/join.utils.js';

// Single matchmaking queue
export const matchmakingQueue = new Map(); // userId -> queueEntry
export const matchmakingStatus = new Map(); // userId -> status info

export async function joinMatchmakingQueue(data, userId, connection) {
    console.log(`🔍 MATCHMAKING: Join request received -> User: ${userId}`);
    
    // Check if user is already in a room
    const existingRoomId = userRoom.get(userId);
    if (existingRoomId) {
        console.log(`❌ MATCHMAKING: User ${userId} already in room ${existingRoomId}`);
        await sendMessage(connection, 'game', 'error', {
            message: `You are already in room ${existingRoomId}. Leave first.`
        });
        return;
    }

    // Check if already in queue
    if (matchmakingStatus.has(userId)) {
        console.log(`❌ MATCHMAKING: User ${userId} already in queue`);
        await sendMessage(connection, 'game', 'error', {
            message: 'You are already in matchmaking queue'
        });
        return;
    }

    // Create queue entry
    const queueEntry = {
        userId,
        connection,
        joinTime: Date.now()
    };

    // Add to queue
    matchmakingQueue.set(userId, queueEntry);
    
    // Set status
    matchmakingStatus.set(userId, {
        status: 'searching',
        joinTime: Date.now()
    });

    console.log(`✅ MATCHMAKING: User ${userId} added to queue (position: ${matchmakingQueue.size})`);

    await sendMessage(connection, 'game', 'matchmaking-joined', {
        position: matchmakingQueue.size,
        message: `Joined matchmaking queue`
    });

    // Try to find match
    await attemptMatchmaking();
}

export async function leaveMatchmakingQueue(data, userId, connection) {
    if (!matchmakingStatus.has(userId)) {
        await sendMessage(connection, 'game', 'error', {
            message: 'You are not in any matchmaking queue'
        });
        return;
    }

    matchmakingQueue.delete(userId);
    matchmakingStatus.delete(userId);

    console.log(`✅ MATCHMAKING: User ${userId} left queue`);

    await sendMessage(connection, 'game', 'matchmaking-left', {
        message: `Left matchmaking queue`
    });
}

export async function cancelMatchmaking(data, userId, connection) {
    await leaveMatchmakingQueue(data, userId, connection);
}

export async function getMatchmakingStatus(data, userId, connection) {
    const status = matchmakingStatus.get(userId);
    
    if (!status) {
        await sendMessage(connection, 'game', 'matchmaking-status', {
            inQueue: false,
            message: 'Not in any matchmaking queue'
        });
        return;
    }
    // Calculate wait time
    const waitTime = Date.now() - status.joinTime;

    await sendMessage(connection, 'game', 'matchmaking-status', {
        inQueue: true,
        waitTime: Math.floor(waitTime / 1000),
        status: status.status
    });
}

async function attemptMatchmaking() {
    if (matchmakingQueue.size < 2) return;

    // Simple pairing: take first two players
    const players = Array.from(matchmakingQueue.values()).slice(0, 2);
    const [player1, player2] = players;

    // Remove from queue
    matchmakingQueue.delete(player1.userId);
    matchmakingQueue.delete(player2.userId);
    matchmakingStatus.delete(player1.userId);
    matchmakingStatus.delete(player2.userId);


    try {
        // Create room for the match
        const roomId = await createRoom(player1.userId, player1.connection, rooms, null, null, true);
        const room = rooms.get(roomId);

        if (!room) {
            throw new Error('Failed to create room for matchmaking');
        }

        // Add second player to room
        await addPlayerToRoom(room, player2.userId, player2.connection);


        // Notify players about match and room
        await sendMessage(player1.connection, 'game', 'match-found', {
            roomId,
            opponent: player2.userId,
            message: 'Match found! Game starting...'
        });

        await sendMessage(player2.connection, 'game', 'match-found', {
            roomId,
            opponent: player1.userId,
            message: 'Match found! Game starting...'
        });

        // Auto-start the game after a short delay
        setTimeout(async () => {
            try {
                await startGame({ roomId }, player1.userId, player1.connection);
                console.log(`🎮 MATCHMAKING: Game auto-started -> Room: ${roomId}`);
            } catch (error) {
                console.error('Error auto-starting matchmaking game:', error);
            }
        }, 5000); // 2 second delay for players to prepare

    } catch (error) {
        console.error('Error creating match from queue:', error);
        
        // Re-add players to queue on error
        matchmakingQueue.set(player1.userId, player1);
        matchmakingQueue.set(player2.userId, player2);
        matchmakingStatus.set(player1.userId, { status: 'searching', joinTime: player1.joinTime });
        matchmakingStatus.set(player2.userId, { status: 'searching', joinTime: player2.joinTime });

        // Notify players about error
        await sendMessage(player1.connection, 'game', 'error', {
            message: 'Failed to create match. Please try again.'
        });
        await sendMessage(player2.connection, 'game', 'error', {
            message: 'Failed to create match. Please try again.'
        });
    }
}