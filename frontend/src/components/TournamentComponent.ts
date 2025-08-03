import { Component } from '../core/Component.js';

export interface Tournament {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  status: 'waiting' | 'in-progress' | 'finished';
  prize?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export class TournamentComponent extends Component {
  private tournaments: Tournament[];
  private leaderboard: LeaderboardEntry[];
  private onJoinTournament?: (tournamentId: string) => void;

  constructor(
    tournaments: Tournament[], 
    leaderboard: LeaderboardEntry[],
    onJoinTournament?: (tournamentId: string) => void
  ) {
    super({ className: 'w-80 h-full flex flex-col' });
    this.tournaments = tournaments;
    this.leaderboard = leaderboard;
    this.onJoinTournament = onJoinTournament;
    this.render();
    this.setupEvents();
  }

  protected init(): void {
    // Don't call render here since data isn't set yet
  }

  // Turnuva verilerini güncelleme
  updateData(tournaments: Tournament[], leaderboard: LeaderboardEntry[]): void {
    this.tournaments = tournaments;
    this.leaderboard = leaderboard;
    this.render();
    this.setupEvents();
  }

  private render(): void {
    this.setHTML(`
      <!-- Tournaments Card -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6 flex-shrink-0">
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-white">
          <h2 class="font-semibold flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Tournaments
          </h2>
        </div>
        
        <div class="p-4 max-h-64 overflow-y-auto">
          ${this.tournaments.length > 0 ? this.tournaments.map(tournament => `
            <div class="border border-gray-200 rounded-lg p-3 mb-3 last:mb-0 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-medium text-gray-800 text-sm">${tournament.name}</h3>
                <span class="text-xs px-2 py-1 rounded-full ${this.getStatusColor(tournament.status)}">
                  ${tournament.status}
                </span>
              </div>
              
              <div class="flex items-center text-xs text-gray-500 mb-2">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                ${tournament.players}/${tournament.maxPlayers} players
              </div>
              
              ${tournament.prize ? `
                <div class="flex items-center text-xs text-yellow-600 mb-3">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                  </svg>
                  ${tournament.prize} prize
                </div>
              ` : ''}
              
              ${tournament.status === 'waiting' ? `
                <button class="join-tournament-btn w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors" data-tournament-id="${tournament.id}">
                  Join Tournament
                </button>
              ` : ''}
            </div>
          `).join('') : `
            <div class="text-center py-8 text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm">No active tournaments</p>
            </div>
          `}
        </div>
      </div>

      <!-- Leaderboard Card -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex-1">
        <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-3 text-white">
          <h2 class="font-semibold flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            Leaderboard
          </h2>
        </div>
        
        <div class="p-4 overflow-y-auto flex-1">
          <div class="space-y-2">
            ${this.leaderboard.slice(0, 8).map((entry, index) => `
              <div class="flex items-center justify-between p-2 rounded-lg ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' : 'hover:bg-gray-50'} transition-colors">
                <div class="flex items-center">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${this.getRankBadgeColor(entry.rank)}">
                    ${entry.rank}
                  </div>
                  <span class="text-sm font-medium text-gray-800">${entry.name}</span>
                </div>
                <span class="text-sm font-semibold text-gray-600">${entry.score.toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `);
  }

  private setupEvents(): void {
    const joinButtons = this.element.querySelectorAll('.join-tournament-btn');
    joinButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tournamentId = (e.target as HTMLElement).dataset.tournamentId;
        if (tournamentId && this.onJoinTournament) {
          this.onJoinTournament(tournamentId);
        }
      });
    });
  }

  private getStatusColor(status: Tournament['status']): string {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-600';
      case 'in-progress': return 'bg-green-100 text-green-600';
      case 'finished': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  private getRankColor(rank: number): string {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-yellow-600';
    return 'text-gray-500';
  }

  private getRankBadgeColor(rank: number): string {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-yellow-600 text-white';
    return 'bg-gray-200 text-gray-600';
  }
}
