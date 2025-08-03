import { ProfileComponent, UserProfile } from '../components/ProfileComponent.js';
import { GameComponent, GameConfig } from '../components/GameComponent.js';
import { TournamentComponent, Tournament, LeaderboardEntry } from '../components/TournamentComponent.js';

export function createHomePage(): HTMLElement {
  // Ana container
  const container = document.createElement('div');
  container.className = 'h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden';

  // İçerik wrapper - geniş ekranlarda sınırlı genişlik
  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-[1600px] mx-auto h-full p-6 flex gap-6';

  // Mock data - gerçek uygulamada API'den gelecek
  const userProfile: UserProfile = {
    name: 'Player One',
    level: 5,
    wins: 15,
    losses: 3,
  };

  const gameConfig: GameConfig = {
    modes: ['1v1', 'AI', 'Train'],
    isPlaying: false
  };

  const tournaments: Tournament[] = [
    {
      id: '1',
      name: 'Summer Cup',
      players: 16,
      maxPlayers: 32,
      status: 'waiting',
      prize: '100'
    },
    {
      id: '2',
      name: 'League',
      players: 24,
      maxPlayers: 50,
      status: 'in-progress'
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'ProPlayer', score: 2450 },
    { rank: 2, name: 'GamerX', score: 2380 },
    { rank: 3, name: 'PongMaster', score: 2320 },
    { rank: 4, name: 'Champion', score: 2280 },
    { rank: 5, name: 'TopPlayer', score: 2250 }
  ];

  // Component'leri oluştur
  const profileComponent = new ProfileComponent(userProfile);
  
  const gameComponent = new GameComponent(gameConfig, (mode: string) => {
    console.log(`Starting game with mode: ${mode}`);
    gameConfig.isPlaying = true;
    gameComponent.updateGameState(gameConfig);
  });
  
  const tournamentComponent = new TournamentComponent(
    tournaments, 
    leaderboard,
    (tournamentId: string) => {
      console.log(`Joining tournament: ${tournamentId}`);
      // Turnuva katılım logigi burada olacak
    }
  );

  // Component'leri wrapper'a ekle
  wrapper.appendChild(profileComponent.getElement());
  wrapper.appendChild(gameComponent.getElement());
  wrapper.appendChild(tournamentComponent.getElement());

  // Wrapper'ı container'a ekle
  container.appendChild(wrapper);

  return container;
}
