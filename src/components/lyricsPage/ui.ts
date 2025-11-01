import { getAlbumImageUrl } from "../../utils/albumImageFetcher";

export function createLyricsPageUI(mainView: Element) {
    const lyricsContainer = document.createElement('div');
    lyricsContainer.id = 'custom-lyrics-page';
    lyricsContainer.style.cssText = `
      position: fixed; /*Use fixed positioning for a true overlay */
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--background-base, #121212);
      color: var(--text-base, #ffffff);
      z-index: 9999; /*This will now work correctly */
      user-select: text;
      display: flex;
      flex-direction: row;
      overflow: hidden; /*Still good practice to contain children */
    `;
    const lyricsHTML = `
      <!-- Dynamic Background -->
      <div id="lyrics-background" style="
        position: absolute;
        top: -50px; left: -50px; right: -50px; bottom: -50px;
        background-size: cover;
        background-position: center;
        filter: blur(50px) brightness(0.6);
        transform: scale(1.1);
        opacity: 0;
        transition: opacity 1s ease-in-out;
        z-index: -1;
      "></div>
  
      <!-- Left Column: Information -->
      <div id="lyrics-left-column" style="
        position: relative;
        width: 350px;
        padding: 32px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        flex-shrink: 0;
        z-index: 1;
        height: 100%; /* Fill parent height */
        box-sizing: border-box;
      ">
        <!-- Album Swiper -->
        <div id="album-art-swiper-container" style="
            width: 250px; height: 250px;
            flex-shrink: 0; margin-bottom: 20px;
            position: relative;
            border-radius: 50%; 
            overflow: hidden;
            cursor: grab;
        ">
            <div id="album-art-track" style="
                position: absolute;
                top: 0; left: 0;
                width: 300%;
                height: 100%;
                display: flex;
                transform: translateX(-33.3333%); 
            ">
                <div class="swiper-slide" style="
                    width: 33.3333%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div class="vinyl-wrapper" style="
                        width: calc(100% - 20px); 
                        height: calc(100% - 20px);
                        position: relative;
                    ">
                        <img id="prev-album-image" src="" alt="Previous Album Art" style="
                            width: 100%; height: 100%;
                            object-fit: cover;
                            border-radius: 50%;
                        "/>
                        <div class="vinyl-overlay" style="
                            position: absolute;
                            top: 0; bottom: 0; left: 0; right: 0; /* Covers the square wrapper perfectly */
                            border-radius: 50%;
                            pointer-events: none;
                        ">
                            <div class="vinyl-groove" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; height: 90%; border-radius: 50%; border: 1px solid rgba(255,255,255,0.5);"></div>
                            <div class="vinyl-groove" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 65%; height: 65%; border-radius: 50%; border: 1px solid rgba(255,255,255,0.6);"></div>
                            <div class="vinyl-hole" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 25px; height: 25px; background: rgba(255,255,255,0.6); border-radius: 50%; border: 2px solid rgba(255,255,255,0.1);"></div>
                        </div>
                    </div>
                </div>

                <div class="swiper-slide" style="
                    width: 33.3333%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div class="vinyl-wrapper" style="
                        width: calc(100% - 20px);
                        height: calc(100% - 20px);
                        position: relative;
                    ">
                        <img id="lyrics-album-image" src="" alt="Current Album Art" style="
                            width: 100%; height: 100%;
                            object-fit: cover;
                            border-radius: 50%;
                        "/>
                        <div class="vinyl-overlay" style="
                            position: absolute;
                            top: 0; bottom: 0; left: 0; right: 0;
                            border-radius: 50%;
                            pointer-events: none;
                        ">
                            <div class="vinyl-groove" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; height: 90%; border-radius: 50%; border: 1px solid rgba(255,255,255,0.5);"></div>
                            <div class="vinyl-groove" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 65%; height: 65%; border-radius: 50%; border: 1px solid rgba(255,255,255,0.6);"></div>
                            <div class="vinyl-hole" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 25px; height: 25px; background: rgba(255,255,255,0.6); border-radius: 50%; border: 2px solid rgba(255,255,255,0.1);"></div>
                        </div>
                    </div>
                </div>

                <div class="swiper-slide" style="
                    width: 33.3333%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div class="vinyl-wrapper" style="
                        width: calc(100% - 20px);
                        height: calc(100% - 20px);
                        position: relative;
                    ">
                        <img id="next-album-image" src="" alt="Next Album Art" style="
                            width: 100%; height: 100%;
                            object-fit: cover;
                            border-radius: 50%;
                        "/>
                        <div class="vinyl-overlay" style="
                            position: absolute;
                            top: 0; bottom: 0; left: 0; right: 0;
                            border-radius: 50%;
                            pointer-events: none;
                        ">
                            <div class="vinyl-groove" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; height: 90%; border-radius: 50%; border: 1px solid rgba(255,255,255,0.5);"></div>
                            <div class="vinyl-groove" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 65%; height: 65%; border-radius: 50%; border: 1px solid rgba(255,255,255,0.6);"></div>
                            <div class="vinyl-hole" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 25px; height: 25px; background: rgba(255,255,255,0.6); border-radius: 50%; border: 2px solid rgba(255,255,255,0.1);"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  
        <!-- Track Info Header -->
        <div id="track-info-header" style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 10px;"></div>
        <div id="track-info-artist" style="text-align: center; font-size: 18px; opacity: 0.7;"></div>
  
        <!-- Action Buttons Container -->
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <!-- Copy Button -->
          <button id="lyrics-copy-button" title="Copy Lyrics" style="
            background:transparent; border: none; color: var(--text-base, #ffffff);
            cursor: pointer; padding: 6px; border-radius: 50%; width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            transition: background-color 0.2s; flex-shrink: 0;
          ">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5V3H6V1.5a.5.5 0 0 1 .5-.5h3zM6 2h4v-.5H6.5a.5.5 0 0 1-.5.5zm3 3.5V7H6V5.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5z"/>
            </svg>
          </button>
          <!-- Settings Button -->
          <button id="lyrics-settings-button" title="Settings" style="
            background:transparent; border: none; color: var(--text-base, #ffffff);
            cursor: pointer; padding: 6px; border-radius: 50%; width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            transition: background-color 0.2s; flex-shrink: 0;
          ">
            <svg fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16"> 
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/> 
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 
              0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 
              0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 
              0 1 .52-1.255l.319-.094c1.79-.527-1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 
              0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 
              1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 
              1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428-.835-1.674 0l-.094-.319a1.873 1.873 0 0 
              0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 
              1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/> 
            </svg> 
          </button>

          <button id="lyrics-like-button" title="Like" style="
            background:transparent; border: none; color: var(--text-base, #ffffff);
            cursor: pointer; padding: 6px; border-radius: 50%; width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            transition: background-color 0.2s; flex-shrink: 0;
          ">  
          </button>
        </div>
  
        <!-- Settings Menu -->
        <div id="lyrics-settings-menu" style="
          display: none;
          position: absolute;
          bottom: 80px; /* Position it above the button */
          left: 50%;
          transform: translateX(-50%);
          background: var(--background-press, #282828);
          border: 1px solid var(--background-highlight, #404040);
          border-radius: 8px;
          padding: 12px;
          width: 220px;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          color: var(--text-base, #ffffff);
        ">
          <div style="font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #444;">Lyrics Settings</div>
  
          <!-- Setting Option: Language -->
          <div class="setting-option" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span>Translation</span>
            <select id="setting-language-select">
              <option value="any">Any (Default)</option>
              <option value="en">English</option>
              <option value="it">Italian</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="zh-Hans">Chinese</option>
            </select>
          </div>
  
          <!-- Setting Option: Album Rotation -->
          <div class="setting-option" style="display: flex; justify-content: space-between; align-items: center;">
            <span>Album Rotation</span>
            <label class="switch">
              <input type="checkbox" id="setting-toggle-rotation" checked>
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Translation -->
          <div class="setting-option" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Translation</span>
              <label class="switch">
                <input type="checkbox" id="setting-toggle-translation">
                <span class="slider round"></span>
              </label>
          </div>
        </div>
      </div>
  
      <!-- Right Column: Lyrics -->
      <div id="lyrics-scroll-container" style="
        flex-grow: 1; /* Take remaining width */
        height: 100%; /* Fill parent height */
        overflow-y: auto;
        overflow-x: hidden;
        padding: 32px 64px;
        max-width: 800px;
        margin: 0 auto;
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
  
    const settingsStyleEl = document.createElement('style');
    settingsStyleEl.id = 'custom-lyrics-settings-style';
    settingsStyleEl.innerHTML = `
      /* Toggle Switch CSS */
      .switch { position: relative; display: inline-block; width: 34px; height: 20px; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
      .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
      input:checked + .slider { background-color: var(--spice-button-active, #1db954); }
      input:checked + .slider:before { transform: translateX(14px); }
      .slider.round { border-radius: 20px; }
      .slider.round:before { border-radius: 50%; }
  
      /* Font Size Buttons CSS */
      .font-size-btn {
        background: var(--background-base, #333);
        border: 1px solid #555;
        color: white;
        width: 24px; height: 24px;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 4px;
      }
      .font-size-btn:hover { background: #444; }
      .font-size-btn.active { background: var(--spice-button-active, #1db954); border-color: var(--spice-button-active, #1db954); }
  
      #setting-language-select {
        background-color: var(--background-base, #333);
        color: var(--text-base, #ffffff);
        border: 1px solid var(--background-highlight, #555);
        border-radius: 4px;
        padding: 4px 8px;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.4-5.4-13z%22%2F%3E%3C%2Fsvg%3E');
        background-repeat: no-repeat;
        background-position: right 8px top 50%;
        background-size: .65em auto;
        padding-right: 24px;
      }
      #lyrics-scroll-container {
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(settingsStyleEl);
    
    updateLyricsBackground();

    return lyricsContainer;
}

// Function to update the dynamic background
export function updateLyricsBackground() {
    const backgroundEl = document.getElementById('lyrics-background') as HTMLElement;
    const imageUrl = getAlbumImageUrl();
    if (backgroundEl && imageUrl) {
      backgroundEl.style.backgroundImage = `url(${imageUrl})`;
      backgroundEl.style.opacity = '1';
    }
}
