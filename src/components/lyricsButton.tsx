
import { lyricsPageActive } from '../state/lyricsState';
import { toggleLyricsPage } from './lyricsPage';

declare global {
  interface Window {
    Spicetify: any;
  }
}

function changeButtonColor(){
  const icon = document.getElementById("lyrics-button");
  if (icon instanceof SVGElement) {
    if (lyricsPageActive){
      icon.style.color = "green";
    }
    else{
      icon.style.color = "white";
    }
  }
  
}

// Create the lyrics button
export function createLyricsButton() {
  let attempts = 0;
  const tryCreateButton = () => {
    attempts++;

    // Check if button already exists
    if (document.querySelector('#spotify-lyrics-button')) {
      return;
    }

    // Try to find the right container for the button
    const selectors = [
      '.main-nowPlayingBar-extraControls',
      '.ExtraControls',
      '.main-nowPlayingBar-right',
      '[data-testid="now-playing-bar"] .main-nowPlayingBar-right',
      '.player-controls__right',
      '.now-playing-bar__right',
    ];

    let container = null;
    for (const selector of selectors) {
      container = document.querySelector(selector);
      if (container) {
        break;
      }
    }

    if (!container) {
      if (attempts < 50) {
        setTimeout(tryCreateButton, 200);
        return;
      } else {
        // Create floating button as fallback
        createFloatingButton();
        return;
      }
    }

    // Button: https://icons.getbootstrap.com
    const button = document.createElement('button');
    button.id = 'spotify-lyrics-button';
    button.className = 'Button-sc-1dqy6lx-0 Button-small-small Button-ui-variant-ghost';
    button.setAttribute('aria-label', 'Lyrics');
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" id="lyrics-button" width="16" height="16" fill="currentColor" class="bi bi-layout-text-sidebar" viewBox="0 0 16 16">
        <path d="M3.5 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM3 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z"/>
        <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm12-1v14h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm-1 0H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h9z"/>
      </svg>
    `;

    button.style.cssText = `
      background: transparent;
      border: none;
      color: var(--text-subdued, #b3b3b3);
      cursor: pointer;
      padding: 8px;
      margin: 0 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
      min-width: 32px;
      height: 32px;
    `;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleLyricsPage();
      changeButtonColor();
    });

    button.addEventListener('mouseenter', () => {
      button.style.color = 'var(--text-base, #ffffff)';
      button.style.backgroundColor = 'rgba(255,255,255,0.1)';
      button.style.transform = 'scale(1.06)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.color = 'var(--text-subdued, #b3b3b3)';
      button.style.backgroundColor = 'transparent';
      button.style.transform = 'scale(1)';
    });

    container.appendChild(button);
  };

  tryCreateButton();
}

// Create floating button as fallback
export function createFloatingButton() {
  if (document.querySelector('#spotify-lyrics-button-floating')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'spotify-lyrics-button-floating';
  button.innerHTML = 'Lyrics';
  button.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 20px;
    background: var(--background-tinted-highlight, #1db954);
    border: none;
    color: #000;
    padding: 12px 24px;
    border-radius: 24px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    transition: all 0.2s;
  `;

  button.addEventListener('click', (e) => {
      toggleLyricsPage();
      changeButtonColor();
  });

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
  });

  document.body.appendChild(button);
}
