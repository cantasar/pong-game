import { MyProfile } from './types.js';
import { getToken } from './utils.js';

export async function loadUserProfile(): Promise<void> {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch('http://localhost:3000/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error('Failed to fetch user profile');
            return;
        }

        const responseData = await response.json();
		console.log('User profile response:', responseData);
        const profile: MyProfile = responseData.user;
        displayUserProfile(profile);
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

function displayUserProfile(profile: MyProfile): void {
    const profileDiv = document.getElementById('userProfile') as HTMLDivElement;
    profileDiv.innerHTML = `
        <div><strong>Username:</strong> ${profile.username}</div>
        <div><strong>Email:</strong> ${profile.email}</div>
        <div><strong>Wins:</strong> ${profile.wins} | <strong>Losses:</strong> ${profile.losses}</div>
        ${profile.avatar ? `<div><img src="${profile.avatar}" alt="Avatar" style="width: 50px; height: 50px;"></div>` : ''}
    `;
}
