import { Component } from '../core/Component.js';

export interface GameConfig {
  modes: string[];
  currentMode?: string;
  isPlaying: boolean;
}

export class GameComponent extends Component {
  private config: GameConfig;
  private onGameStart?: (mode: string) => void;

  constructor(config: GameConfig, onGameStart?: (mode: string) => void) {
    super({ className: 'flex-1 mx-6 h-full' });
    this.config = config;
    this.onGameStart = onGameStart;
    this.render();
    this.setupEvents();
  }

  protected init(): void {
    // Don't call render here since config isn't set yet
  }

  // Oyun durumunu güncelleme
  updateGameState(config: GameConfig): void {
    this.config = config;
    this.render();
    this.setupEvents();
  }

  private render(): void {
    this.setHTML(`
      <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
        <!-- Game Header -->
        <div class="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 text-white flex-shrink-0">
          <h2 class="text-xl font-bold text-center">PONG</h2>
          <div class="flex justify-between text-sm mt-2">
            <span>Player: 0</span>
            <span>AI: 0</span>
          </div>
        </div>
        
        <!-- Game Area -->
        ${this.config.isPlaying ? `
          <div class="bg-black relative flex-1">
            <!-- Pong Game Field -->
            <div class="absolute inset-0 flex items-center justify-center">
              <!-- Center Line -->
              <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white opacity-50 transform -translate-x-0.5"></div>
              <div class="absolute left-1/2 top-0 h-full" style="background: repeating-linear-gradient(to bottom, white 0px, white 10px, transparent 10px, transparent 20px); width: 2px; transform: translateX(-1px);"></div>
              
              <!-- Left Paddle -->
              <div class="absolute left-4 bg-white w-2 h-16 top-1/2 transform -translate-y-1/2"></div>
              
              <!-- Right Paddle -->
              <div class="absolute right-4 bg-white w-2 h-16 top-1/2 transform -translate-y-1/2"></div>
              
              <!-- Ball -->
              <div class="absolute bg-white w-3 h-3 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            <!-- Game Status -->
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              Game in Progress...
            </div>
          </div>
          
          <!-- Game Controls -->
          <div class="p-6 bg-gray-50 flex-shrink-0">
            <div class="text-center mb-4">
              <p class="text-sm text-gray-600 mb-2">Controls: W/S or ↑/↓</p>
            </div>
            <button id="stop-game" class="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
              Stop Game
            </button>
          </div>
        ` : `
          <div class="bg-black relative flex-1">
            <!-- Static Pong Field -->
            <div class="absolute inset-0 flex items-center justify-center">
              <!-- Center Line -->
              <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white opacity-30 transform -translate-x-0.5"></div>
              <div class="absolute left-1/2 top-0 h-full opacity-30" style="background: repeating-linear-gradient(to bottom, white 0px, white 10px, transparent 10px, transparent 20px); width: 2px; transform: translateX(-1px);"></div>
              
              <!-- Left Paddle -->
              <div class="absolute left-4 bg-white opacity-50 w-2 h-16 top-1/2 transform -translate-y-1/2"></div>
              
              <!-- Right Paddle -->
              <div class="absolute right-4 bg-white opacity-50 w-2 h-16 top-1/2 transform -translate-y-1/2"></div>
              
              <!-- Ball -->
              <div class="absolute bg-white opacity-50 w-3 h-3 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            <!-- Ready Message -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-white text-center">
                <div class="text-2xl font-bold mb-2">READY?</div>
                <div class="text-sm opacity-75">Choose a mode to start</div>
              </div>
            </div>
          </div>
          
          <!-- Mode Selection -->
          <div class="p-6 flex-shrink-0">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 text-center">Game Mode</h3>
            <div class="grid grid-cols-3 gap-3 mb-6">
              ${this.config.modes.map(mode => `
                <button class="game-mode-btn p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-center ${this.config.currentMode === mode ? 'border-blue-500 bg-blue-50' : ''}" data-mode="${mode}">
                  <div class="font-medium text-gray-800">${mode}</div>
                </button>
              `).join('')}
            </div>
            
            <button id="start-game" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" ${!this.config.currentMode ? 'disabled' : ''}>
              Start Game
            </button>
          </div>
        `}
      </div>
    `);
  }

  private setupEvents(): void {
    // Mode seçimi
    const modeButtons = this.element.querySelectorAll('.game-mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = (e.target as HTMLElement).dataset.mode;
        if (mode) {
          this.config.currentMode = mode;
          
          // Aktif mod stilini güncelle
          modeButtons.forEach(b => {
            b.classList.remove('border-blue-500', 'bg-blue-50');
            b.classList.add('border-gray-200');
          });
          (e.target as HTMLElement).classList.remove('border-gray-200');
          (e.target as HTMLElement).classList.add('border-blue-500', 'bg-blue-50');
          
          // Start butonunu etkinleştir
          const startBtn = this.element.querySelector('#start-game') as HTMLButtonElement;
          if (startBtn) startBtn.disabled = false;
        }
      });
    });

    // Oyun başlatma
    const startBtn = this.element.querySelector('#start-game');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (this.config.currentMode && this.onGameStart) {
          this.onGameStart(this.config.currentMode);
        }
      });
    }

    // Oyun durdurma
    const stopBtn = this.element.querySelector('#stop-game');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.config.isPlaying = false;
        this.render();
        this.setupEvents();
      });
    }
  }
}
