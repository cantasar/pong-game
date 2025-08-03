export function createProfilePage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 p-4';
  
  container.innerHTML = `
    <div class="max-w-lg mx-auto">
      <h1 class="text-xl font-semibold text-gray-800 mb-4">Profile</h1>
      
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h2 class="text-base font-medium text-gray-800 mb-3">User Info</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Username</label>
            <input type="text" class="w-full bg-gray-50 text-gray-700 p-2 rounded border border-gray-200 text-sm" value="Player One">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input type="email" class="w-full bg-gray-50 text-gray-700 p-2 rounded border border-gray-200 text-sm" value="player@example.com">
          </div>
        </div>
        
        <button class="mt-4 bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded text-sm font-medium">
          Save
        </button>
      </div>
    </div>
  `;
  
  return container;
}
