export function createLyricsPageUI(mainView: Element) {
    const lyricsContainer = document.createElement('div');
    lyricsContainer.id = 'custom-lyrics-page';
    lyricsContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--background-base, #121212);
      color: var(--text-base, #ffffff);
      z-index: 9999;
      user-select: text;
      overflow: hidden;
    `;
    const lyricsHTML = `
      <!-- Lyrics Container -->
      <div id="lyrics-scroll-container" style="
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 32px 64px;
        box-sizing: border-box;
        z-index: 1;
      ">
        <div id="lyrics-loading" style="text-align: center; padding: 64px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎵</div>
          <p>Loading lyrics...</p>
        </div>
        <div id="lyrics-content" style="display: none;"></div>
        <div id="lyrics-error" style="display: none; text-align: center; padding: 64px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">😔</div>
          <p>No lyrics found for this track</p>
          <p id="error-details" style="opacity: 0.7; font-size: 14px; margin-top: 8px;"></p>
        </div>
      </div>
    `;
  
    lyricsContainer.innerHTML = lyricsHTML;
    mainView.appendChild(lyricsContainer);
  
    const styleEl = document.createElement('style');
    styleEl.id = 'custom-lyrics-style';
    styleEl.innerHTML = `
      #lyrics-scroll-container {
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(styleEl);

    return lyricsContainer;
}
