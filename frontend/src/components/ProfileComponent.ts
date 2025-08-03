import { Component } from '../core/Component.js';

export interface UserProfile {
  name: string;
  level: number;
  wins: number;
  losses: number;
  avatar?: string;
}

export class ProfileComponent extends Component {
  private profile: UserProfile;
  private activeTab: 'friends' | 'requests' | 'add' = 'friends';

  constructor(profile: UserProfile) {
    super({ className: 'w-80 h-full flex flex-col' });
    this.profile = profile;
    this.render(); // Call render after profile is set
    this.setupEvents();
  }

  // Profil verilerini güncelleme
  updateProfile(profile: UserProfile): void {
    this.profile = profile;
    this.render();
  }

  private render(): void {
    const winRate = this.profile.wins + this.profile.losses > 0 
      ? Math.round((this.profile.wins / (this.profile.wins + this.profile.losses)) * 100)
      : 0;

    this.setHTML(`
      <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex-shrink-0">
        <!-- Profile Header -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white text-center">
          <div class="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-blue-600 text-xl font-bold shadow-lg">
            ${this.profile.avatar || this.profile.name.charAt(0).toUpperCase()}
          </div>
          <h2 class="text-lg font-semibold">${this.profile.name}</h2>
          <p class="text-blue-100 text-sm">Level ${this.profile.level}</p>
        </div>
        
        <!-- Stats -->
        <div class="p-4 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-xl font-bold text-green-600">${this.profile.wins}</div>
              <div class="text-xs text-green-500">Wins</div>
            </div>
            <div class="text-center p-3 bg-red-50 rounded-lg">
              <div class="text-xl font-bold text-red-600">${this.profile.losses}</div>
              <div class="text-xs text-red-500">Losses</div>
            </div>
          </div>
          
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">Win Rate</span>
            <span class="font-semibold text-gray-800">${winRate}%</span>
          </div>
          
      </div>
      
      <!-- Menu -->
      <div class="mt-4 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex-1 flex flex-col">
        <!-- Social Tabs -->
        <div class="flex border-b border-gray-100 flex-shrink-0">
          <button class="social-tab flex-1 px-4 py-3 text-center text-sm font-medium transition-colors ${this.activeTab === 'friends' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}" data-tab="friends">
            <svg class="w-4 h-4 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            Friends
          </button>
          <button class="social-tab flex-1 px-4 py-3 text-center text-sm font-medium transition-colors ${this.activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}" data-tab="requests">
            <svg class="w-4 h-4 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            Requests
          </button>
          <button class="social-tab flex-1 px-4 py-3 text-center text-sm font-medium transition-colors ${this.activeTab === 'add' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}" data-tab="add">
            <svg class="w-4 h-4 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
            </svg>
            Add Friend
          </button>
        </div>
        
        <!-- Tab Content -->
        <div class="p-4 flex-1 overflow-y-auto">
          ${this.renderTabContent()}
        </div>
      </div>
    `);
  }

  private renderTabContent(): string {
    switch (this.activeTab) {
      case 'friends':
        return `
          <div class="space-y-3">

            <!-- Friend Item Example -->
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                  A
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-800">Alex Johnson</div>
                  <div class="text-xs text-green-500 flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Online
                  </div>
                </div>
              </div>
              <div class="flex space-x-2">
                <button class="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors">
                  Invite
                </button>
                <button class="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                  Chat
                </button>
              </div>
            </div>
            
            <!-- Another Friend Example -->
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                  M
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-800">Mike Chen</div>
                  <div class="text-xs text-gray-400 flex items-center">
                    <div class="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                    Last seen 2h ago
                  </div>
                </div>
              </div>
              <div class="flex space-x-2">
                <button class="px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded cursor-not-allowed" disabled>
                  Offline
                </button>
              </div>
            </div>
            
          </div>
        `;
        
      case 'requests':
        return `
          <div class="space-y-3">

            <!-- Incoming Request Example -->
            <div class="border border-orange-200 bg-orange-50 rounded-lg p-3">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    S
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-800">Sarah Wilson</div>
                    <div class="text-xs text-orange-600">Wants to be friends</div>
                  </div>
                </div>
                <div class="text-xs text-gray-500">2 min ago</div>
              </div>
              <div class="flex space-x-2">
                <button class="flex-1 px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                  Accept
                </button>
                <button class="flex-1 px-3 py-2 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors">
                  Decline
                </button>
              </div>
            </div>
            
          </div>
        `;
        
      case 'add':
        return `
          <div class="space-y-4">
          
            <!-- Search Section -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Add Friend</label>
              <div class="flex gap-1 w-full">
                <input 
                  type="text" 
                  placeholder="Enter username..." 
                  class=" px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  id="friend-search"
                >
                <button class="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors">
                  Send Request
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-2">Enter the exact username to send a friend request</p>
            </div>
          
          </div>
        `;
        
      default:
        return '';
    }
  }

  private setupEvents(): void {
    // Tab switching
    const tabButtons = this.element.querySelectorAll('.social-tab');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).dataset.tab as 'friends' | 'requests' | 'add';
        if (tab && tab !== this.activeTab) {
          this.activeTab = tab;
          this.render();
          this.setupEvents(); // Re-setup events after re-render
        }
      });
    });
  }
}
