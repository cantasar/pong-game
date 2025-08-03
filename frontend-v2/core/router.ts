class Router {
  private container: HTMLElement;
  private currentPage: string = 'home';

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupBrowserNavigation();
    this.loadPage('home'); // Başlangıçta home sayfası
  }

  navigate(pageName: string) {
    if (pageName !== this.currentPage) {
      // Browser history'ye ekle
      window.history.pushState({ page: pageName }, '', window.location.href);
      this.loadPage(pageName);
    }
  }

  private setupBrowserNavigation() {
    // Browser'ın ileri/geri butonları için event listener
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.page) {
        this.loadPage(event.state.page);
      } else {
        // İlk yükleme durumu için home'a git
        this.loadPage('home');
      }
    });

    // İlk sayfa için state ekle
    window.history.replaceState({ page: 'home' }, '', window.location.href);
  }

  private async loadPage(pageName: string) {
    try {
      console.log(`Loading page: ${pageName}`);

      // Save the current page's HTML to restore if needed
      const previousHTML = this.container.innerHTML;
      const previousPage = this.currentPage;

      // Start loading the new page in the background
      let loadingShown = false;
      let loadingTimeout: number | undefined = undefined;
      let swapTimeout: number | undefined = undefined;
      let pageSwapped = false;

      // Show loading only if it takes longer than 400ms
      loadingTimeout = window.setTimeout(() => {
        document.body.style.background = '#000';
        document.documentElement.style.background = '#000';
        this.container.innerHTML = '<div class="flex items-center justify-center h-screen" style="background:#000;"><div class="text-xl text-white">Loading...</div></div>';
        loadingShown = true;
      }, 400);

      // Start fetching HTML and JS in parallel
      const htmlPromise = fetch(`./pages/${pageName}/${pageName}.html`).then(async (response) => {
        console.log(`Fetch response for ${pageName}:`, response.status);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
      });
      const jsPromise = import(`../pages/${pageName}/${pageName}.js`);

      // Wait at least 100ms before swapping
      const minDelay = new Promise(resolve => { swapTimeout = window.setTimeout(resolve, 100); });

      // Wait for all to finish
      const [html, module] = await Promise.all([htmlPromise, jsPromise, minDelay]);

      // Now swap in the new page
      if (loadingTimeout !== undefined) clearTimeout(loadingTimeout);
      this.currentPage = pageName;
      this.container.innerHTML = html as string;
      pageSwapped = true;

      if (module && (module as any).init) {
        (module as any).init();
      }
    } catch (error) {
      console.error('Sayfa yüklenemedi:', error);
      this.container.innerHTML = `
        <div class="flex items-center justify-center h-screen">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-red-600 mb-4">Error Loading Page</h1>
            <p class="text-gray-600 mb-4">Failed to load: ${pageName}</p>
            <p class="text-sm text-gray-500">${error}</p>
            <button onclick="router.navigate('home')" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
              Go Home
            </button>
          </div>
        </div>
      `;
    }
  }
}

export { Router };
