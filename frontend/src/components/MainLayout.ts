import { ProfileCard } from './ProfileCard';
import { GameArea } from './GameArea';
import { Tournament } from './Tournament';
import { GeneralChat } from './GeneralChat';
import { PrivateChat } from './PrivateChat';

export function MainLayout(user: { username: string; id?: number }, onLogout?: () => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'w-full h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden relative';

  // Selected friend state
  let selectedFriend: string | null = null;
  let privateChatModal: HTMLElement | null = null;

  // Left sidebar - Profile and Friends
  const leftSidebar = document.createElement('div');
  leftSidebar.className = 'w-80 flex flex-col gap-4 p-4 bg-white/50 backdrop-blur-sm border-r border-gray-200';

  // Friend selection callback function
  const handleFriendSelect = (friend: any) => {
    selectedFriend = friend.username;
    openPrivateChat();
  };

  // Open private chat modal
  const openPrivateChat = () => {
    // Close existing modal if open
    closePrivateChat();
    
    if (selectedFriend) {
      // Create new private chat modal
      privateChatModal = PrivateChat(selectedFriend, closePrivateChat);
      document.body.appendChild(privateChatModal);
    }
  };

  // Close private chat modal
  const closePrivateChat = () => {
    if (privateChatModal) {
      privateChatModal.remove();
      privateChatModal = null;
    }
  };

  // Profile card with friend selection callback
  const profile = ProfileCard(user.username, onLogout, handleFriendSelect);
  leftSidebar.appendChild(profile);

  // Main content area - Full screen game
  const mainContent = document.createElement('div');
  mainContent.className = 'flex-1 flex flex-col p-6';

  const game = GameArea();
  game.className = 'bg-white/80 rounded-2xl shadow-lg flex items-center justify-center flex-1 border border-gray-200 backdrop-blur-sm';
  mainContent.appendChild(game);

  // Right sidebar - Tournament and General Chat
  const rightSidebar = document.createElement('div');
  rightSidebar.className = 'w-80 flex flex-col gap-4 p-4 bg-white/50 backdrop-blur-sm border-l border-gray-200';

  // Tournament
  const tournament = Tournament();
  tournament.className = 'bg-white/70 rounded-xl shadow-sm p-4 min-h-[250px] border border-gray-200 flex flex-col';
  rightSidebar.appendChild(tournament);

  // General chat
  const generalChat = GeneralChat();
  generalChat.className = 'bg-white/70 rounded-xl shadow-sm p-4 min-h-[200px] border border-gray-200 flex flex-col flex-1';
  rightSidebar.appendChild(generalChat);

  // Add layout structure
  container.appendChild(leftSidebar);
  container.appendChild(mainContent);
  container.appendChild(rightSidebar);

  return container;
}