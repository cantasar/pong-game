export function createGamePage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 p-4';
  
  container.innerHTML = `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-xl font-semibold text-gray-800 mb-4 text-center">Game</h1>
      
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="bg-gray-100 rounded-lg h-64 mb-4 flex items-center justify-center border border-gray-200">
          <p class="text-gray-500">Game Area</p>
        </div>
        
        <div class="flex justify-center space-x-3">
          <button class="bg-green-100 hover:bg-green-200 text-green-600 px-4 py-2 rounded text-sm font-medium">
            Start
          </button>
          <button class="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded text-sm font-medium">
            Exit
          </button>
        </div>
      </div>
    </div>
  `;
  
  return container;
}
