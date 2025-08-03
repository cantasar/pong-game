import { Router } from './core/router.js';

declare global {
  var router: Router;
}

function handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const oauthSuccess = urlParams.get('oauth');
  const error = urlParams.get('error');

  if (error === 'oauth_failed') {
    window.router.navigate('login');
    alert('Google login failed. Please try again.');
  } else if (token && oauthSuccess === 'success') {
    localStorage.setItem('authToken', token);
    window.router.navigate('profile');
  }

  if (token || error) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  
  const app = document.getElementById('app');

  if (app) {
    window.router = new Router(app);
    handleOAuthCallback();
    
  } else {
    console.error('App element not found!');
  }
});
