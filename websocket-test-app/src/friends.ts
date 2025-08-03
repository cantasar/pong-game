import { Friend, FriendRequest, UserProfile } from './types.js';
import { getToken } from './utils.js';
import { openDmBox } from './dm.js';

// Online durumları takip etmek için
const onlineStatuses = new Map<number, boolean>();
let currentFriends: Friend[] = [];

// Online durumu güncelle
export function updateOnlineStatus(userId: number, isOnline: boolean) {
    onlineStatuses.set(userId, isOnline);
    
    // Arkadaş listesini güncelle
    refreshFriendsListDisplay();
}

function refreshFriendsListDisplay(): void {
    // Mevcut arkadaş listesini yeniden göster
    if (currentFriends.length > 0) {
        displayFriendsList(currentFriends);
    }
}

export async function loadFriendsList(): Promise<void> {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch('http://localhost:3000/friends', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error('Failed to fetch friends list');
            return;
        }

        const friendsResponse = await response.json();
        
        // Arkadaş listesini sakla
        currentFriends = friendsResponse.friends;
        
        displayFriendsList(currentFriends);
    } catch (error) {
        console.error('Error loading friends list:', error);
    }
}

export async function loadFriendRequests(): Promise<void> {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch('http://localhost:3000/friends/requests/incoming', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error('Failed to fetch friend requests');
            displayFriendRequests([]);
            return;
        }

        const data = await response.json();
        console.log('Friend requests data:', data);
        displayFriendRequests(data.requests || []);
    } catch (error) {
        console.error('Error loading friend requests:', error);
        displayFriendRequests([]);
    }
}

export async function sendFriendRequest(username: string): Promise<void> {
    const token = getToken();
    if (!token || !username.trim()) {
        alert('Enter username!');
        return;
    }

	const user = await fetch(`http://localhost:3000/users/${username.trim()}`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});

	if (!user.ok) {
		alert('User not found!');
		return;
	}

	const userResponse = await user.json();
	console.log('User response:', userResponse);
	const userData: UserProfile = userResponse.user;
	console.log('User found:', userData);

    try {
		console.log('Sending friend request to:', userData.id);
        const response = await fetch(`http://localhost:3000/friends/add/${userData.id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
		console.log('Friend request response:', response);

        if (response.ok) {
            alert('Friend request sent!');
            const input = document.getElementById('friendRequestInput') as HTMLInputElement;
            input.value = '';
            loadFriendRequests();
        } else {
            alert('Failed to send friend request');
        }
    } catch (error) {
        alert('Error sending friend request');
    }
}

export async function respondToFriendRequest(requestId: number, action: 'accept' | 'reject'): Promise<void> {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`http://localhost:3000/friends/${requestId}/${action}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert(`Friend request ${action}ed!`);
            loadFriendRequests();
            loadFriendsList();
        } else {
            alert(`Failed to ${action} friend request`);
        }
    } catch (error) {
        console.error(`Error ${action}ing friend request:`, error);
    }
}

function displayFriendsList(friends: Friend[]): void {
    const friendsListDiv = document.getElementById('friendsList') as HTMLDivElement;
    friendsListDiv.innerHTML = '';

    if (friends.length === 0) {
        friendsListDiv.innerHTML = '<div style="text-align: center; color: gray; padding: 20px;">No friends yet. Send some friend requests!</div>';
        return;
    }

    friends.forEach((friend: Friend) => {
        const friendId = friend.friendInfo.id;
        const isOnline = onlineStatuses.get(friendId) || false;
        
        const friendElement = document.createElement('div');
        friendElement.className = 'friend-item';
        friendElement.style.cssText = 'border: 1px solid #ddd; margin: 5px; padding: 10px; cursor: pointer; position: relative;';
        
        const onlineIndicator = isOnline ? 
            '<span style="color: green; font-weight: bold;">● Online</span>' : 
            '<span style="color: gray;">● Offline</span>';
        
        friendElement.innerHTML = `
            <div>
                <strong>${friend.friendInfo.username}</strong> (ID: ${friend.friendInfo.id})<br>
                Wins: ${friend.friendInfo.wins || 0} | Losses: ${friend.friendInfo.losses || 0}<br>
                <small>Status: ${friend.status}</small><br>
                <small>${onlineIndicator}</small>
            </div>
        `;
        
        friendElement.addEventListener('click', () => {
            openDmBox(friend.friendInfo.id, friend.friendInfo.username);
        });
        
        friendsListDiv.appendChild(friendElement);
    });
}

function displayFriendRequests(requests: FriendRequest[]): void {
    const requestsDiv = document.getElementById('friendRequests') as HTMLDivElement;
    requestsDiv.innerHTML = '';

    if (requests.length === 0) {
        requestsDiv.innerHTML = '<div style="text-align: center; color: gray; padding: 20px;">No friend requests</div>';
        return;
    }

    requests.forEach((request: FriendRequest) => {
        const requestElement = document.createElement('div');
        requestElement.style.cssText = 'border: 1px solid #ddd; margin: 5px; padding: 10px;';
        requestElement.innerHTML = `
            <div>
                <strong>${request.senderInfo.username}</strong> wants to be your friend<br>
                <button onclick="window.respondToFriendRequest(${request.requesterID}, 'accept')">Accept</button>
                <button onclick="window.respondToFriendRequest(${request.requesterID}, 'reject')">Reject</button>
            </div>
        `;
        requestsDiv.appendChild(requestElement);
    });
}
