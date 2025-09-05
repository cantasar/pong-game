import { AppState } from '../../core/AppState.js';
import { TournamentService } from '../../services/TournamentService.js';
import { UserService } from '../../services/UserService.js';
import { notify } from '../../core/notify.js';

interface TournamentData {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'completed';
  currentPlayers: number;
  participants: Array<{
    id: number;
    username: string;
  }>;
  matches?: Array<{
    id: number;
    player1Id: number;
    player2Id: number;
    player1Username: string;
    player2Username: string;
    winnerId?: number;
    round: number;
  }>;
}

interface MatchDetails {
  matchId: number;
  opponent: string;
  round: number;
  roomId?: string;
}

export function init() {
  console.log('🏆 Tournament page initializing...');
  const appState = AppState.getInstance();
  const tournamentService = new TournamentService();
  const userService = new UserService();

  let currentTournament: TournamentData | null = null;
  let currentUser: any = null;
  let currentMatch: MatchDetails | null = null;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  // DOM elements
  const tournamentStatus = document.getElementById('tournament-status');
  const tournamentStatusMobile = document.getElementById('tournament-status-mobile');
  const participantCount = document.getElementById('participant-count');
  const participantCountMobile = document.getElementById('participant-count-mobile');
  const participantsGrid = document.getElementById('participants-grid');
  const waitingMessage = document.getElementById('waiting-message');
  const waitingText = document.getElementById('waiting-text');
  const currentMatchInfo = document.getElementById('current-match-info');
  const matchDetails = document.getElementById('match-details');
  const bracketContainer = document.getElementById('bracket-container');
  const leaveTournamentBtn = document.getElementById('leave-tournament-btn');
  const tournamentEndModal = document.getElementById('tournament-end-modal');
  const tournamentResultText = document.getElementById('tournament-result-text');
  const returnHomeBtn = document.getElementById('return-home-btn');
  const roundTransition = document.getElementById('round-transition');
  const transitionMessage = document.getElementById('transition-message');
  const countdownTimer = document.getElementById('countdown-timer');
  const countdownDisplay = document.getElementById('countdown-display');
  const countdownMessage = document.getElementById('countdown-message');
  const countdownBar = document.getElementById('countdown-bar');
  const countdownText = document.getElementById('countdown-text');
  const roundCountdownBar = document.getElementById('round-countdown-bar');
  const roundCountdownText = document.getElementById('round-countdown-text');
  const connectionStatus = document.getElementById('connection-status');
  const connectionIndicator = document.getElementById('connection-indicator');
  const connectionText = document.getElementById('connection-text');

  let countdownInterval: number | null = null;
  let wsReconnectInterval: number | null = null;

  // Initialize
  initPage();

  async function initPage() {
    try {
      // User'ı al
      currentUser = await userService.getCurrentUser();
      if (!currentUser) {
        notify('Please login first');
        (window as any).router.navigate('login');
        return;
      }

      // Reload guard: If there is no active tournament in state, redirect to home
      if (!appState.isInTournament()) {
        const tournamentInfo = appState.getCurrentTournament();
        console.log('Current tournament from AppState:', tournamentInfo);
        console.log('❌ TOURNAMENT PAGE: No active tournament in AppState, redirecting to home');
        (window as any).router.navigate('home');
        return;
      }

      // Ensure WebSocket is connected on reload
      const wsManager = (tournamentService as any)['wsManager'] as any;
      if (!wsManager?.isConnected?.()) {
        console.log('🔌 TOURNAMENT PAGE: WS not connected, attempting reconnect...');
        if (wsManager?.reconnect) {
          wsManager.reconnect();
        }
      }

      // Tournament durumunu kontrol et - sadece initial request
      requestInitialTournamentData();
      
      // Event listeners'ı kurulum
      setupEventListeners();
      
      // Tournament service listeners
      setupTournamentListeners();
      
      // WebSocket reconnection handling
      setupWebSocketReconnection();
      
    } catch (error) {
      console.error('Error initializing tournament page:', error);
      notify('Failed to load tournament data');
      (window as any).router.navigate('home');
    }
  }

  function requestInitialTournamentData() {
    console.log('🔄 TOURNAMENT PAGE: Requesting initial tournament data...');
    
    if (!currentUser) {
      console.error('❌ TOURNAMENT PAGE: No current user, cannot load tournament data');
      return;
    }
    
    // Initial request for tournament details - only once at startup
    console.log('📡 TOURNAMENT PAGE: Requesting initial tournament details...');
    tournamentService.getTournamentDetails();
    
    // Also request bracket information
    setTimeout(() => {
      console.log('📡 TOURNAMENT PAGE: Requesting initial tournament bracket...');
      tournamentService.getTournamentBracket();
    }, 500);
  }

  function setupEventListeners() {
    // Leave tournament button
    leaveTournamentBtn?.addEventListener('click', handleLeaveTournament);
    
    // Return home button
    returnHomeBtn?.addEventListener('click', () => {
      (window as any).router.navigate('home');
    });
  }

  function setupTournamentListeners() {
    // Tournament details geldiğinde
    tournamentService.onTournamentDetails((data) => {
      console.log('📊 TOURNAMENT PAGE: Tournament details received:', data);
      currentTournament = data.tournament;
      
      if (!currentTournament) {
        console.log('❌ TOURNAMENT PAGE: No tournament data received');
        // Tournament sayfasındaysak ve kullanıcı tournament'ta ise bekle (max 3 retry)
        if (currentUser && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`⏳ TOURNAMENT PAGE: User exists, retrying tournament data in 2 seconds... (${retryCount}/${MAX_RETRIES})`);
          setTimeout(() => {
            tournamentService.getTournamentDetails();
          }, 2000);
          return;
        }
        console.log('❌ TOURNAMENT PAGE: Max retries reached or no user, navigating to home');
        (window as any).router.navigate('home');
        return;
      }
      
      // Reset retry count on successful data
      retryCount = 0;
      
      console.log(`📊 TOURNAMENT PAGE: Tournament ${currentTournament.id} status: ${currentTournament.status}, participants: ${currentTournament.participants?.length || 0}`);
      
      // Handle elimination status
      if (data.userStatus === 'eliminated') {
        console.log('❌ TOURNAMENT PAGE: User is eliminated');
        showEliminationStatus();
      } else if (data.userStatus === 'spectator') {
        console.log('👁️ TOURNAMENT PAGE: User is spectator');
        showSpectatorMode();
      } else {
        console.log('✅ TOURNAMENT PAGE: User is active participant');
      }
      
      updateTournamentDisplay();
    });

    // Player joined/left events
    tournamentService.onTournamentPlayerJoined((data) => {
      console.log('🎯 Player joined:', data);
      if (currentTournament) {
        currentTournament.currentPlayers = data.currentPlayers;
        // Update display without making new requests
        updateTournamentDisplay();
      }
      notify(`Player joined tournament (${data.currentPlayers}/4)`);
    });

    tournamentService.onTournamentPlayerLeft((data) => {
      console.log('🎯 Player left:', data);
      if (currentTournament) {
        currentTournament.currentPlayers = data.currentPlayers;
        // Update display without making new requests
        updateTournamentDisplay();
      }
      notify(`Player left tournament (${data.currentPlayers}/4)`);
    });

    // Tournament started
    tournamentService.onTournamentStarted((data) => {
      console.log('🏆 Tournament started:', data);
      // Update tournament with complete data from the event
      currentTournament = data.tournament || data;
      updateTournamentDisplay();
      notify('Tournament has started! Matches begin now.');
    });

    // Match pairings revealed
    tournamentService.onTournamentMatchPairings((data) => {
      console.log('🎯 Match pairings revealed:', data);
      showMatchPairingsCountdown(data);
    });

    // Match started
    tournamentService.onTournamentMatchStarted((data) => {
      console.log('🎮 Tournament match starting:', data);
      console.log('🎮 Tournament match players order from server:', data.players);
      console.log('🎮 TOURNAMENT POSITION ASSIGNMENT - LEFT (BLUE):', data.players?.[0], ', RIGHT (RED):', data.players?.[1]);
      
      currentMatch = {
        matchId: data.matchId,
        opponent: data.opponent,
        round: data.round,
        roomId: data.roomId
      };
      
      notify(`Your match vs ${data.opponent} is starting!`);
      
      // Navigate directly to remote-game for tournaments (skip lobby)
      appState.setCurrentRoom({
        roomId: data.roomId,
        players: data.players || [],
        createdAt: Date.now()
      });
      (window as any).router.navigate('remote-game');
    });

    // Round completed (show winners)
    tournamentService.onTournamentRoundCompleted((data) => {
      console.log('🏆 Round completed:', data);
      showRoundCompletionDisplay(data);
      notify(data.message);
    });

    // Next round started
    tournamentService.onTournamentNextRound((data) => {
      console.log('🏆 Next round started:', data);
      // Update tournament data from the received event data
      if (data.tournament) {
        currentTournament = data.tournament;
        updateTournamentDisplay();
      }
      notify(`${data.roundName || `Round ${data.round}`} has begun!`);
    });

    // Tournament ended
    tournamentService.onTournamentEnded((data) => {
      console.log('🏆 Tournament ended:', data);
      showTournamentEndModal(data);
    });

    // New tournament created
    tournamentService.onNewTournamentCreated((data) => {
      console.log('🆕 New tournament created:', data);
      notify('A new tournament has been created!');
      // Don't navigate away if user is still in current tournament
      if (!currentUser || !currentTournament || currentTournament.status === 'completed') {
        (window as any).router.navigate('home');
      }
    });

    // Tournament bracket updates
    tournamentService.onTournamentBracket((data) => {
      console.log('📊 TOURNAMENT PAGE: Bracket data received:', data);
      if (data.tournament) {
        currentTournament = { ...currentTournament, ...data.tournament };
        updateTournamentDisplay();
      }
    });
  }

  function showPendingBracket() {
    if (!bracketContainer || !currentTournament) return;
    
    // Enhanced compact bracket design for pending tournament
    bracketContainer.innerHTML = `
      <div class="space-y-4">
        <!-- Semifinals Section -->
        <div class="text-center mb-3">
          <div class="text-neon-green text-sm font-bold uppercase tracking-wide mb-2 flex items-center justify-center">
            <span style="text-shadow: 0 0 10px #39FF14;">SEMIFINALS</span>
          </div>
          <div class="w-16 h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent mx-auto rounded-full"></div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <!-- Semifinal 1 -->
          <div class="bg-gradient-to-br from-green-900 to-black border border-neon-green rounded-lg p-3 shadow-terminal hover:scale-105 transition-all">
            <div class="text-center">
              <div class="text-neon-green text-xs font-bold mb-2 uppercase tracking-wide">SEMIFINAL #1</div>
              
              <div class="space-y-2">
                <div class="flex items-center justify-center space-x-2 p-2 bg-black bg-opacity-60 rounded border border-neon-green border-opacity-50">
                  <div class="w-6 h-6 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center text-black font-bold text-xs">W</div>
                  <span class="text-neon-white font-bold text-xs">WARRIOR #1</span>
                </div>
                
                <div class="text-neon-green font-bold text-xs flex items-center justify-center">
                  <span style="text-shadow: 0 0 10px #39FF14;">VS</span>
                </div>
                
                <div class="flex items-center justify-center space-x-2 p-2 bg-black bg-opacity-60 rounded border border-neon-green border-opacity-50">
                  <div class="w-6 h-6 bg-gradient-to-br from-neon-blue to-neon-green rounded-full flex items-center justify-center text-black font-bold text-xs">W</div>
                  <span class="text-neon-white font-bold text-xs">WARRIOR #2</span>
                </div>
              </div>
              
              <div class="mt-2 p-2 bg-gradient-to-r from-yellow-900 to-black border border-neon-yellow rounded">
                <span class="text-neon-yellow text-xs font-bold animate-pulse">BATTLE INCOMING</span>
              </div>
            </div>
          </div>
          
          <!-- Semifinal 2 -->
          <div class="bg-gradient-to-br from-green-900 to-black border border-neon-green rounded-lg p-3 shadow-terminal hover:scale-105 transition-all">
            <div class="text-center">
              <div class="text-neon-green text-xs font-bold mb-2 uppercase tracking-wide">SEMIFINAL #2</div>
              
              <div class="space-y-2">
                <div class="flex items-center justify-center space-x-2 p-2 bg-black bg-opacity-60 rounded border border-neon-green border-opacity-50">
                  <div class="w-6 h-6 bg-gradient-to-br from-neon-purple to-neon-blue rounded-full flex items-center justify-center text-black font-bold text-xs">W</div>
                  <span class="text-neon-white font-bold text-xs">WARRIOR #3</span>
                </div>
                
                <div class="text-neon-green font-bold text-xs flex items-center justify-center">
                  <span style="text-shadow: 0 0 10px #39FF14;">VS</span>
                </div>
                
                <div class="flex items-center justify-center space-x-2 p-2 bg-black bg-opacity-60 rounded border border-neon-green border-opacity-50">
                  <div class="w-6 h-6 bg-gradient-to-br from-neon-red to-neon-purple rounded-full flex items-center justify-center text-black font-bold text-xs">W</div>
                  <span class="text-neon-white font-bold text-xs">WARRIOR #4</span>
                </div>
              </div>
              
              <div class="mt-2 p-2 bg-gradient-to-r from-yellow-900 to-black border border-neon-yellow rounded">
                <span class="text-neon-yellow text-xs font-bold animate-pulse">BATTLE INCOMING</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Connection Flow -->
        <div class="flex justify-center mb-3">
          <div class="flex flex-col items-center">
            <div class="text-neon-green text-lg">↓</div>
            <div class="text-neon-green text-xs uppercase tracking-wide">WINNERS ADVANCE</div>
          </div>
        </div>
        
        <!-- Final Section -->
        <div class="text-center mb-3">
          <div class="text-neon-yellow text-sm font-bold uppercase tracking-wide mb-2 flex items-center justify-center">
            <span style="text-shadow: 0 0 10px #FACD1E;">GRAND FINAL</span>
          </div>
          <div class="w-20 h-1 bg-gradient-to-r from-transparent via-neon-yellow to-transparent mx-auto rounded-full"></div>
        </div>
        
        <div class="flex justify-center">
          <div class="bg-gradient-to-br from-yellow-900 to-black border border-neon-yellow rounded-lg p-4 w-full max-w-sm shadow-terminal">
            <div class="text-center">
              <div class="text-neon-yellow text-xs font-bold mb-3 uppercase tracking-wide">CHAMPIONSHIP MATCH</div>
              
              <div class="space-y-2">
                <div class="flex items-center justify-center space-x-2 p-2 bg-black bg-opacity-60 rounded border border-gray-500">
                  <div class="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-gray-400 font-bold text-xs">?</div>
                  <span class="text-gray-400 font-bold text-xs">SEMIFINAL WINNER</span>
                </div>
                
                <div class="text-gray-500 font-bold text-xs flex items-center justify-center">
                  <span>VS</span>
                </div>
                
                <div class="flex items-center justify-center space-x-2 p-2 bg-black bg-opacity-60 rounded border border-gray-500">
                  <div class="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-gray-400 font-bold text-xs">?</div>
                  <span class="text-gray-400 font-bold text-xs">SEMIFINAL WINNER</span>
                </div>
              </div>
              
              <div class="mt-3 p-2 bg-black bg-opacity-60 border border-gray-500 rounded">
                <span class="text-gray-400 text-xs font-bold">AWAITING CHAMPIONS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function updateTournamentDisplay() {
    if (!currentTournament) return;

    // Update header - both desktop and mobile
    const status = currentTournament.status.charAt(0).toUpperCase() + currentTournament.status.slice(1);
    const playerCount = currentTournament.currentPlayers.toString();
    
    if (tournamentStatus) {
      tournamentStatus.textContent = status;
    }
    if (tournamentStatusMobile) {
      tournamentStatusMobile.textContent = status;
    }

    // Update participant count - both desktop and mobile
    if (participantCount) {
      participantCount.textContent = playerCount;
    }
    if (participantCountMobile) {
      participantCountMobile.textContent = playerCount;
    }

    // Update participants grid
    updateParticipantsGrid();

    // Update waiting message
    updateWaitingMessage();

    // Update bracket
    updateBracket();

    // Update current match info
    updateCurrentMatchInfo();
  }

  async function updateParticipantsGrid() {
    if (!participantsGrid || !currentTournament) return;

    let html = '';
    
    // Show current participants with enhanced design and real avatars
    for (const participant of currentTournament.participants) {
      const isCurrentUser = participant.id === currentUser?.id;
      const borderClass = isCurrentUser ? 'border-neon-green bg-gradient-to-r from-green-900 to-black' : 'border-neon-blue border-opacity-50 bg-black';
      const glowClass = isCurrentUser ? 'shadow-btn-glow' : '';
      
      // Fetch user details for avatar
      let avatarUrl = '';
      try {
        const userDetails = await userService.getUserById(participant.id);
        avatarUrl = userDetails?.avatar || '';
      } catch (error) {
        console.log('Could not fetch user details for avatar');
      }
      
      html += `
        <div class="flex items-center space-x-3 p-3 border ${borderClass} rounded-lg bg-opacity-60 ${glowClass} transition-all hover:scale-105">
          <div class="relative">
            <div class="w-10 h-10 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center border-2 border-neon-green overflow-hidden">
              ${avatarUrl ? `<img src="${avatarUrl}" alt="${participant.username}" class="w-full h-full rounded-full object-cover">` : `<span class="text-black font-bold text-sm">${participant.username[0].toUpperCase()}</span>`}
            </div>
            ${isCurrentUser ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full border border-black flex items-center justify-center"><span class="text-black text-xs">✓</span></div>' : ''}
          </div>
          <div class="flex-1">
            <div class="text-neon-white font-bold text-sm uppercase tracking-wide">${participant.username}</div>
            <div class="text-xs uppercase tracking-wide ${isCurrentUser ? 'text-neon-green font-bold' : 'text-neon-blue'}">${isCurrentUser ? 'YOU' : 'WARRIOR'}</div>
          </div>
          ${isCurrentUser ? '<div class="status-dot"></div>' : '<div class="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>'}
        </div>
      `;
    }

    // Show empty slots with enhanced design
    const emptySlots = 4 - currentTournament.participants.length;
    for (let i = 0; i < emptySlots; i++) {
      html += `
        <div class="flex items-center space-x-3 p-3 border border-dashed border-gray-500 border-opacity-50 rounded-lg bg-black bg-opacity-30 hover:border-neon-green hover:border-opacity-50 transition-all">
          <div class="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center border-2 border-gray-500">
            <span class="text-gray-400 text-sm">?</span>
          </div>
          <div class="flex-1">
            <div class="text-gray-400 text-sm uppercase tracking-wide">WAITING FOR WARRIOR...</div>
            <div class="text-gray-500 text-xs uppercase tracking-wide">SEARCHING</div>
          </div>
          <div class="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
        </div>
      `;
    }

    participantsGrid.innerHTML = html;
  }

  function updateWaitingMessage() {
    if (!waitingMessage || !waitingText || !currentTournament) return;

    if (currentTournament.status === 'pending') {
      const remaining = 4 - currentTournament.currentPlayers;
      if (remaining > 0) {
        waitingText.textContent = `WAITING FOR ${remaining} MORE PLAYER${remaining !== 1 ? 'S' : ''} TO JOIN...`;
        waitingMessage.classList.remove('hidden');
      } else {
        waitingText.textContent = 'TOURNAMENT IS FULL! STARTING SOON...';
        waitingMessage.classList.remove('hidden');
      }
    } else {
      waitingMessage.classList.add('hidden');
    }
  }

  async function updateBracket() {
    if (!bracketContainer || !currentTournament) return;

    if (currentTournament.status === 'pending') {
      // 4 kişi dolmuşsa bracket'i göster, değilse bekleme mesajı
      if (currentTournament.currentPlayers === 4) {
        showPendingBracket();
      } else {
        bracketContainer.innerHTML = `
          <div class="flex items-center justify-center h-48 text-neon-green">
            <div class="text-center">
              <div class="w-12 h-12 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <span class="text-black text-lg font-bold">T</span>
              </div>
              <div class="text-neon-green text-sm uppercase tracking-wide font-bold mb-1">TOURNAMENT BRACKET</div>
              <div class="text-neon-blue text-xs uppercase tracking-wide">WILL APPEAR WHEN ALL 4 WARRIORS JOIN</div>
              <div class="mt-3 flex justify-center space-x-1">
                <div class="w-1 h-1 bg-neon-green rounded-full animate-pulse"></div>
                <div class="w-1 h-1 bg-neon-blue rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
                <div class="w-1 h-1 bg-neon-purple rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
              </div>
            </div>
          </div>
        `;
      }
      return;
    }

    if (!currentTournament.matches || currentTournament.matches.length === 0) {
      bracketContainer.innerHTML = `
        <div class="flex items-center justify-center h-48 text-neon-green">
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center mx-auto mb-3 animate-spin">
              <span class="text-black text-lg font-bold">M</span>
            </div>
            <div class="text-neon-green text-sm uppercase tracking-wide font-bold mb-1">LOADING MATCHES</div>
            <div class="text-neon-blue text-xs uppercase tracking-wide">PREPARING BATTLE ARENA...</div>
            <div class="mt-3 flex justify-center space-x-1">
              <div class="w-1 h-1 bg-neon-green rounded-full animate-bounce"></div>
              <div class="w-1 h-1 bg-neon-blue rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
              <div class="w-1 h-1 bg-neon-purple rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Group matches by round
    const rounds: { [key: number]: any[] } = {};
    currentTournament.matches.forEach(match => {
      if (!rounds[match.round]) {
        rounds[match.round] = [];
      }
      rounds[match.round].push(match);
    });

    // Create enhanced tournament bracket with modern compact design
    let html = '<div class="space-y-4">';
    
    for (const roundKey of Object.keys(rounds)) {
      const round = parseInt(roundKey);
      const roundMatches = rounds[round];
      const roundName = round === 1 ? 'SEMIFINALS' : round === 2 ? 'GRAND FINAL' : `ROUND ${round}`;
      const roundColor = round === 2 ? 'text-neon-yellow' : 'text-neon-green';
      const roundColorClass = round === 2 ? 'neon-yellow' : 'neon-green';
      
      html += `
        <div class="w-full">
          <div class="text-center mb-3">
            <div class="${roundColor} text-sm font-bold uppercase tracking-wide mb-2 flex items-center justify-center">
              <span style="text-shadow: 0 0 10px ${round === 2 ? '#FACD1E' : '#39FF14'};">${roundName}</span>
            </div>
            <div class="w-16 h-1 bg-gradient-to-r from-transparent via-${roundColorClass} to-transparent mx-auto rounded-full"></div>
          </div>
          <div class="${round === 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'flex justify-center'}">
      `;
      
      // Process matches and get user avatars
      for (let index = 0; index < roundMatches.length; index++) {
        const match = roundMatches[index];
        
        // Fetch user avatars
        let player1Avatar = '';
        let player2Avatar = '';
        
        try {
          const player1Details = await userService.getUserById(match.player1Id);
          const player2Details = await userService.getUserById(match.player2Id);
          player1Avatar = player1Details?.avatar || '';
          player2Avatar = player2Details?.avatar || '';
        } catch (error) {
          console.log('Could not fetch user avatars for match');
        }
        
        const isCompleted = match.winnerId !== null;
        const isUserInMatch = match.player1Id === currentUser?.id || match.player2Id === currentUser?.id;
        const winner = match.winnerId === match.player1Id ? match.player1Username : match.player2Username;
        const winnerIsPlayer1 = match.winnerId === match.player1Id;
        const winnerIsPlayer2 = match.winnerId === match.player2Id;
        
        let containerClass = round === 2 ? 'bg-gradient-to-br from-yellow-900 to-black border border-neon-yellow' : 'bg-gradient-to-br from-green-900 to-black border border-neon-green';
        let statusText = '';
        let statusClass = '';
        
        if (isCompleted) {
          statusText = `${winner.toUpperCase()} WINS!`;
          statusClass = round === 2 ? 'bg-gradient-to-r from-yellow-900 to-black border border-neon-yellow text-neon-yellow' : 'bg-gradient-to-r from-green-900 to-black border border-neon-green text-neon-green';
        } else if (isUserInMatch) {
          statusText = 'YOUR BATTLE';
          statusClass = 'bg-gradient-to-r from-purple-900 to-black border border-neon-purple text-neon-purple animate-pulse';
        } else {
          statusText = 'BATTLE IN PROGRESS';
          statusClass = 'bg-gradient-to-r from-blue-900 to-black border border-neon-blue text-neon-blue animate-pulse';
        }
        
        const matchNumber = round === 1 ? `#${index + 1}` : '';
        const matchLabel = round === 1 ? `SEMIFINAL ${matchNumber}` : 'CHAMPIONSHIP MATCH';
        
        html += `
          <div class="${containerClass} rounded-lg p-3 shadow-terminal hover:scale-105 transition-all ${round === 2 ? 'w-full max-w-md' : ''}">
            <div class="text-center">
              <div class="${roundColor} text-xs font-bold mb-2 uppercase tracking-wide">${matchLabel}</div>
              
              <div class="space-y-2">
                <div class="flex items-center justify-center space-x-2 p-2 bg-black bg-opacity-60 rounded border ${winnerIsPlayer1 ? 'border-neon-yellow bg-yellow-900 bg-opacity-20' : 'border-gray-500'}">
                  <div class="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center border border-neon-green overflow-hidden">
                    ${player1Avatar ? `<img src="${player1Avatar}" alt="${match.player1Username}" class="w-full h-full rounded-full object-cover">` : `<span class="text-black font-bold text-xs">${match.player1Username[0].toUpperCase()}</span>`}
                  </div>
                  <div class="flex-1 text-center">
                    <span class="font-bold text-neon-white text-xs block">${match.player1Username}</span>
                    ${winnerIsPlayer1 ? '<div class="text-neon-yellow text-sm">★</div>' : ''}
                    ${isUserInMatch && match.player1Id === currentUser?.id ? '<div class="text-neon-green text-xs font-bold">YOU</div>' : ''}
                  </div>
                </div>
                
                <div class="${roundColor} font-bold text-xs flex items-center justify-center">
                  <span style="text-shadow: 0 0 10px ${round === 2 ? '#FACD1E' : '#39FF14'};">VS</span>
                </div>
                
                <div class="flex items-center justify-center space-x-2 p-2 bg-black bg-opacity-60 rounded border ${winnerIsPlayer2 ? 'border-neon-yellow bg-yellow-900 bg-opacity-20' : 'border-gray-500'}">
                  <div class="flex-1 text-center">
                    <span class="font-bold text-neon-white text-xs block">${match.player2Username}</span>
                    ${winnerIsPlayer2 ? '<div class="text-neon-yellow text-sm">★</div>' : ''}
                    ${isUserInMatch && match.player2Id === currentUser?.id ? '<div class="text-neon-green text-xs font-bold">YOU</div>' : ''}
                  </div>
                  <div class="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-red rounded-full flex items-center justify-center border border-neon-purple overflow-hidden">
                    ${player2Avatar ? `<img src="${player2Avatar}" alt="${match.player2Username}" class="w-full h-full rounded-full object-cover">` : `<span class="text-black font-bold text-xs">${match.player2Username[0].toUpperCase()}</span>`}
                  </div>
                </div>
              </div>
              
              <div class="mt-2 p-2 ${statusClass} rounded">
                <span class="font-bold text-xs">${statusText}</span>
              </div>
            </div>
          </div>
        `;
      }
      
      html += '</div></div>';
      
      // Add connection flow between rounds
      if (round === 1 && rounds[2]) {
        html += `
          <div class="flex justify-center mb-3">
            <div class="flex flex-col items-center">
              <div class="text-neon-green text-lg">↓</div>
              <div class="text-neon-green text-xs uppercase tracking-wide font-bold">WINNERS ADVANCE</div>
            </div>
          </div>
        `;
      }
    }
    
    html += '</div>';
    bracketContainer.innerHTML = html;
  }

  function updateCurrentMatchInfo() {
    if (!currentMatchInfo || !currentTournament) return;

    // Find user's current match
    if (currentTournament.matches) {
      const userMatch = currentTournament.matches.find(match => 
        (match.player1Id === currentUser?.id || match.player2Id === currentUser?.id) && !match.winnerId
      );

      if (userMatch) {
        const opponent = userMatch.player1Id === currentUser?.id ? userMatch.player2Username : userMatch.player1Username;
        const roundName = userMatch.round === 1 ? 'Semifinal' : userMatch.round === 2 ? 'Final' : `Round ${userMatch.round}`;
        
        if (matchDetails) {
          matchDetails.innerHTML = `
            <div class="flex items-center justify-center space-x-4">
              <div class="text-center">
                <div class="w-12 h-12 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center text-black font-bold text-lg mb-2 border-2 border-neon-green shadow-btn-glow">
                  ${currentUser?.username[0].toUpperCase()}
                </div>
                <div class="text-xs text-neon-white font-bold uppercase">${currentUser?.username}</div>
                <div class="text-xs text-neon-green font-bold">YOU</div>
              </div>
              
              <div class="text-center">
                <div class="text-neon-purple font-bold text-xl mb-1" style="text-shadow: 0 0 15px #c187fc;">VS</div>
                <div class="text-neon-purple text-xs font-bold uppercase">${roundName}</div>
              </div>
              
              <div class="text-center">
                <div class="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-red rounded-full flex items-center justify-center text-black font-bold text-lg mb-2 border-2 border-neon-purple shadow-btn-glow">
                  ${opponent[0].toUpperCase()}
                </div>
                <div class="text-xs text-neon-white font-bold uppercase">${opponent}</div>
                <div class="text-xs text-neon-red font-bold">OPPONENT</div>
              </div>
            </div>
          `;
        }
        
        currentMatchInfo.classList.remove('hidden');
      } else {
        currentMatchInfo.classList.add('hidden');
      }
    } else {
      currentMatchInfo.classList.add('hidden');
    }
  }

  function handleLeaveTournament() {
    if (confirm('Are you sure you want to leave the tournament?')) {
      tournamentService.leaveTournament();
      (window as any).router.navigate('home');
    }
  }

  function handleStartMatch() {
    // This function is deprecated - match start is handled by the backend
    notify('Waiting for match to start...');
  }

  function showMatchPairingsCountdown(data: any) {
    // Show 6-second countdown with new design
    if (countdownTimer && countdownDisplay && countdownMessage && countdownBar) {
      const pairingsText = data.pairings.map((p: any) => `${p.player1} vs ${p.player2}`).join(' | ');
      
      countdownMessage.textContent = `${data.roundName.toUpperCase()} STARTING`;
      if (countdownText) countdownText.textContent = 'GET READY!';
      
      // Hide waiting message and show countdown
      waitingMessage?.classList.add('hidden');
      countdownTimer.classList.remove('hidden');
      
      // Reset countdown bar
      (countdownBar as HTMLElement).style.width = '0%';
      
      // Start 6-second countdown
      let timeLeft = 6;
      if (countdownInterval) clearInterval(countdownInterval);
      
      countdownInterval = setInterval(() => {
        if (countdownDisplay) {
          countdownDisplay.textContent = timeLeft.toString();
        }
        if (countdownBar) {
          const progress = ((6 - timeLeft) / 6) * 100;
          (countdownBar as HTMLElement).style.width = `${progress}%`;
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
          clearInterval(countdownInterval!);
          countdownInterval = null;
          
          if (countdownMessage) countdownMessage.textContent = 'MATCHES STARTING!';
          if (countdownText) countdownText.textContent = 'BATTLE TIME!';
          if (countdownDisplay) countdownDisplay.textContent = 'GO!';
          
          // Hide countdown after 2 seconds
          setTimeout(() => {
            countdownTimer?.classList.add('hidden');
            if (countdownBar) {
              (countdownBar as HTMLElement).style.width = '0%';
            }
          }, 2000);
        }
      }, 1000) as any;
    }
    
    // Display will be updated by WebSocket events - no need for additional requests
  }

  function showEliminationStatus() {
    // Show eliminated status with enhanced compact design
    if (currentMatchInfo) {
      currentMatchInfo.innerHTML = `
        <div class="bg-gradient-to-r from-red-900 to-black border border-neon-red rounded-lg p-4 text-center shadow-terminal">
          <div class="w-12 h-12 bg-gradient-to-br from-neon-red to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-neon-red">
            <span class="text-lg text-white font-bold">X</span>
          </div>
          <div class="text-sm font-bold text-neon-white mb-1 uppercase tracking-wide">ELIMINATED</div>
          <div class="text-neon-red text-xs mb-3 uppercase tracking-wide">YOUR JOURNEY ENDS HERE</div>
          <div class="text-neon-blue text-xs mb-3 uppercase tracking-wide">YOU CAN SPECTATE REMAINING BATTLES</div>
          <button id="leave-after-elimination" class="terminal-btn bg-btn-gradient border border-neon-red text-neon-red px-4 py-2 text-xs font-bold uppercase tracking-wide rounded hover:shadow-btn-glow transition-all">
            LEAVE TOURNAMENT
          </button>
        </div>
      `;
      currentMatchInfo.classList.remove('hidden');
      
      // Add leave handler
      const leaveBtn = currentMatchInfo.querySelector('#leave-after-elimination');
      leaveBtn?.addEventListener('click', () => {
        (window as any).router.navigate('home');
      });
    }
  }

  function showSpectatorMode() {
    // Show spectator status with enhanced compact design 
    if (currentMatchInfo) {
      currentMatchInfo.innerHTML = `
        <div class="bg-gradient-to-r from-blue-900 to-black border border-neon-blue rounded-lg p-4 text-center shadow-terminal">
          <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-neon-blue">
            <span class="text-lg text-white font-bold">S</span>
          </div>
          <div class="text-sm font-bold text-neon-white mb-1 uppercase tracking-wide">SPECTATING</div>
          <div class="text-neon-blue text-xs uppercase tracking-wide">WATCHING THE TOURNAMENT</div>
          <div class="text-neon-green text-xs mt-2 uppercase tracking-wide">ENJOY THE BATTLES!</div>
        </div>
      `;
      currentMatchInfo.classList.remove('hidden');
    }
  }

  function showRoundCompletionDisplay(data: any) {
    // Show round completion info in sidebar
    if (roundTransition && transitionMessage && roundCountdownText && roundCountdownBar) {
      const winnersList = data.winners.map((w: any) => w.username).join(', ');
      
      transitionMessage.textContent = `${data.roundName.toUpperCase()} COMPLETE!`;
      roundCountdownText.textContent = `WINNERS: ${winnersList.toUpperCase()} | ${data.nextRoundName.toUpperCase()} STARTS IN ${data.nextRoundStartsIn}S`;
      
      roundTransition.classList.remove('hidden');
      
      // Reset and animate countdown bar
      (roundCountdownBar as HTMLElement).style.width = '0%';
      setTimeout(() => {
        if (roundCountdownBar) {
          (roundCountdownBar as HTMLElement).style.width = '100%';
        }
      }, 100);
      
      // Start countdown text
      let timeLeft = data.nextRoundStartsIn || 5;
      if (countdownInterval) clearInterval(countdownInterval);
      
      countdownInterval = setInterval(() => {
        timeLeft--;
        if (roundCountdownText) {
          roundCountdownText.textContent = `WINNERS: ${winnersList.toUpperCase()} | ${data.nextRoundName.toUpperCase()} STARTS IN ${timeLeft}S`;
        }
        
        if (timeLeft <= 0) {
          clearInterval(countdownInterval!);
          countdownInterval = null;
          roundTransition?.classList.add('hidden');
          if (roundCountdownBar) {
            (roundCountdownBar as HTMLElement).style.width = '0%';
          }
        }
      }, 1000) as any;
    }
    
    // Bracket will be updated by WebSocket events - no need for additional requests
  }

  function showTournamentEndModal(data: any) {
    if (!tournamentEndModal || !tournamentResultText) return;

    const isWinner = data.winnerId === currentUser?.id;
    const message = isWinner 
      ? 'CONGRATULATIONS! YOU ARE THE CHAMPION!' 
      : `Tournament Complete! Champion: ${data.winnerUsername || data.winnerId}`;
    
    tournamentResultText.textContent = message;
    tournamentEndModal.classList.remove('hidden');
    tournamentEndModal.classList.add('flex');
  }

  function setupWebSocketReconnection() {
    // Check WebSocket connection status via WebSocketManager
    const checkConnection = () => {
      const wsManager = tournamentService['wsManager'] as any;
      const isConnected = wsManager?.isConnected() || false;
      
      if (connectionStatus && connectionIndicator && connectionText) {
        if (!isConnected) {
          connectionStatus.classList.remove('hidden');
          connectionIndicator.className = 'w-3 h-3 bg-red-500 rounded-full animate-pulse';
          connectionText.textContent = 'RECONNECTING...';
          
          // Try to reconnect via WebSocketManager
          if (wsManager?.reconnect) {
            wsManager.reconnect();
          }
        } else {
          connectionIndicator.className = 'w-3 h-3 bg-green-500 rounded-full';
          connectionText.textContent = 'CONNECTED';
          
          // Hide connection status after 2 seconds when connected
          setTimeout(() => {
            connectionStatus.classList.add('hidden');
          }, 2000);
          
          // Request fresh data only once when reconnected
          console.log('🔄 TOURNAMENT PAGE: Reconnected, requesting fresh tournament data');
          tournamentService.getTournamentDetails();
        }
      }
    };

    // Check connection every 5 seconds
    wsReconnectInterval = setInterval(checkConnection, 5000) as any;
    
    // Also check on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkConnection();
      }
    });
    
    // Initial connection check
    setTimeout(checkConnection, 1000);
  }

  // Cleanup function
  function cleanup() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    if (wsReconnectInterval) {
      clearInterval(wsReconnectInterval);
      wsReconnectInterval = null;
    }
  }

  // Add cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
}