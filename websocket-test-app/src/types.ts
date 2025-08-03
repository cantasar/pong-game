export interface MyProfile {
    id: number;
    username: string;
    email: string;
    avatar?: string | null;
    wins: number;
    losses: number;
    createdAt?: string;
}

export interface Friend {
    requesterID: number;
    recipientID: number;
    status: string;
    friendInfo: {
        id: number;
        username: string;
        avatar?: string | null;
        wins: number;
        losses: number;
    };
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    avatar?: string | null;
    wins: number;
    losses: number;
    createdAt?: string;
}

export interface FriendRequest {
    id: number;
    requesterID: number;
    recipientID: number;
    status: string;
    senderInfo: {
        id: number;
        username: string;
        avatar?: string | null;
        wins?: number;
        losses?: number;
    };
}
