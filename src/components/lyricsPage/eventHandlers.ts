import {
    isDragging,
    startX,
    startY,
    memorizedSelectedText,
    isPlainText,
    setStartX,
    setStartY,
    setIsDragging,
    setMemorizedSelectedText,
    setScrolledAndStopped,
    setIdle,
    setPreferredLanguage,
    rotationDeg,
    setRotationDegree,
    currentLyrics,
    setTranslationEnabled,
    ignoreProgrammaticScroll,
    lastProgrammaticScrollAt,
    PROGRAMMATIC_SCROLL_GRACE_MS,
    USER_SCROLL_PAUSE_MS,
    setLastUserScrollAt,
    isThisSongLiked,
    setIsThisSongLiked,
    continousCheckPlaying,
    lyricsPageActive,
    isAlbumRotating,
} from '../../state/lyricsState';
import { fetchAndDisplayLyrics, handleTranslations, resetToCurrentHighlightedLine } from '../../utils/lyricsFetcher';
import { closeLyricsPage, showLyricsPage } from './index';
import { handleStartHeart, pauseRotation, resumeRotation, setupAlbumSwiper } from './utils';

export function attachEventHandlers(lyricsContainer: HTMLElement) {
    // Attach selection and drag events to the scrollable lyrics container
    const lyricsScrollContainer = document.getElementById('lyrics-scroll-container');
    if (!lyricsScrollContainer) return;
    
    lyricsScrollContainer.addEventListener('mousedown', (e) => {
      setStartX(e.clientX);
      setStartY(e.clientY);
      setIsDragging(false);
    });
  
    lyricsScrollContainer.addEventListener('mousemove', (e) => {
      if (e.buttons === 1) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          if (!isDragging) {
            setIsDragging(true);
          }
        }
      }
    });
  
    lyricsScrollContainer.addEventListener('mouseup', () => {
      if (isDragging) {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          setMemorizedSelectedText(selection.toString());
        } else {
          setMemorizedSelectedText(null);
        }
      }
      setIsDragging(false);
    });
  
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

    // Handle a scroll timer of 3 seconds
    lyricsScrollContainer.addEventListener('scroll', () => {
      const now = Date.now();

      // If we recently initiated a programmatic scroll, ignore this scroll event.
      if (ignoreProgrammaticScroll || (now - lastProgrammaticScrollAt) < PROGRAMMATIC_SCROLL_GRACE_MS) {
        return;
      }

      // It's a real user scroll
      setLastUserScrollAt(now)
      setIdle(false);
      setScrolledAndStopped(false);

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // When the user stops scrolling for USER_SCROLL_PAUSE_MS, mark idle again.
      scrollTimeout = setTimeout(() => {
        setIdle(true);
        setScrolledAndStopped(true);
      },USER_SCROLL_PAUSE_MS);
    });
  
    // Attach global events (copy, context menu, keyboard) to the main container
    lyricsContainer.addEventListener('copy', (e) => e.stopPropagation());
    lyricsContainer.addEventListener('contextmenu', (e) => e.stopPropagation());
    lyricsContainer.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'c') {
        const selectedText = window.getSelection()?.toString();
        if (selectedText) {
          try {
            if (document.execCommand('copy')) {
              Spicetify.showNotification('Lyrics copied to clipboard!', false);
            } else {
              Spicetify.showNotification('Failed to copy lyrics.', true);
            }
          } catch (err) {
            Spicetify.showNotification('Failed to copy lyrics.', true);
          }
        } else {
          Spicetify.showNotification('No text selected to copy.', true);
        }
        e.stopPropagation();
        e.preventDefault();
      }
    });
  
    // Add copy button functionality
    const copyButton = document.getElementById('lyrics-copy-button');
    if (copyButton) {
      copyButton.addEventListener('click', async () => {
        if (isPlainText == true){
          return;
        }
        lyricsContainer.focus();
        const selection = window.getSelection();
        let textToCopy = '';
  
        if (memorizedSelectedText) {
          textToCopy = memorizedSelectedText;
        } else if (selection && selection.toString().length > 0) {
          textToCopy = selection.toString();
        } else {
          const lyricsContentEl = document.getElementById('lyrics-content');
          if (lyricsContentEl) {
            textToCopy = lyricsContentEl.innerText;
          }
        }
  
        if (textToCopy) {
          try {
            await navigator.clipboard.writeText(textToCopy);
            Spicetify.showNotification('Lyrics copied to clipboard!', false);
          } catch (err) {
            Spicetify.showNotification('Failed to copy lyrics.', true);
          }
        } else {
          Spicetify.showNotification('No lyrics to copy.', true);
        }
      });
      copyButton.addEventListener('mouseenter', () => (copyButton.style.backgroundColor = 'rgba(255,255,255,0.1)'));
      copyButton.addEventListener('mouseleave', () => (copyButton.style.backgroundColor = 'transparent'));
  
      // Option menu
      const settingsButton = document.getElementById('lyrics-settings-button');
      const settingsMenu = document.getElementById('lyrics-settings-menu');
  
      if (settingsButton && settingsMenu) {
        // Toggle menu visibility when gear icon is clicked
        settingsButton.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevents the 'click outside' listener from firing immediately
          const isHidden = settingsMenu.style.display === 'none';
          settingsMenu.style.display = isHidden ? 'block' : 'none';
        });
  
        settingsButton.addEventListener('mouseenter', () => (settingsButton.style.backgroundColor = 'rgba(255,255,255,0.1)'));
        settingsButton.addEventListener('mouseleave', () => (settingsButton.style.backgroundColor = 'transparent'));
      
        // Close menu if user clicks anywhere else on the lyrics page
        lyricsContainer.addEventListener('click', (e) => {
          // If the click is outside the menu and not on the button, hide the menu
          if (settingsMenu.style.display === 'block' && !settingsMenu.contains(e.target as Node) && e.target !== settingsButton) {
            settingsMenu.style.display = 'none';
          }
        });
  
        const languageSelect = document.getElementById('setting-language-select') as HTMLSelectElement;
        if (languageSelect) {
          // Load saved preference on startup
          const savedLanguage = Spicetify.LocalStorage.get('lyrics-plus-language') || 'any';
          setPreferredLanguage(savedLanguage);
          languageSelect.value = savedLanguage;
  
          // Add listener for changes
          languageSelect.addEventListener('change', () => {
            const newLanguage = languageSelect.value;
            // Update state and save to local storage
            setPreferredLanguage(newLanguage);
            Spicetify.LocalStorage.set('lyrics-plus-language', newLanguage);
            //Spicetify.showNotification(`Lyrics language set to: ${languageSelect.options[languageSelect.selectedIndex].text}`);
            // Reset the translated lyrics
            fetchAndDisplayLyrics();
          });
        }
      
        // Album Rotation Toggle
        const rotationToggle = document.getElementById('setting-toggle-rotation') as HTMLInputElement;
        if (rotationToggle) {
          rotationToggle.addEventListener('change', () => {
            const albumImg = document.getElementById("lyrics-album-image");
            if (!albumImg) return;
          
            if (rotationToggle.checked) {
              // If it's checked, resume rotation
              resumeRotation(albumImg, rotationDeg); 
            } else {
              // If it's unchecked, pause rotation
              const savedAngle = pauseRotation(albumImg);
              setRotationDegree(savedAngle);
            }
          });
        }

        const translateToggle = document.getElementById('setting-toggle-translation') as HTMLInputElement;
        if (translateToggle) {
          // Load saved preference
          //const savedTranslationToggle = Spicetify.LocalStorage.get('translation-enabled') === 'true';
          //translateToggle.checked = savedTranslationToggle;
          //setTranslationEnabled(savedTranslationToggle);
          const savedPreference = Spicetify.LocalStorage.get('translation-enabled') === 'true';
          translateToggle.checked = savedPreference;
          setTranslationEnabled(savedPreference);
          translateToggle.addEventListener('change', () => {
            if (!currentLyrics || currentLyrics.length === 0) {
              Spicetify.showNotification('Lyrics not available for translation.', true);
              translateToggle.checked = !translateToggle.checked; // Revert the checkbox
              return;
            }
            handleTranslations();
            Spicetify.showNotification(`Translations ${translateToggle.checked ? 'Enabled' : 'Disabled'}`);
            resetToCurrentHighlightedLine();
            Spicetify.LocalStorage.set('translation-enabled', translateToggle.checked.toString());
            //Spicetify.showNotification(`Translations ${translateToggle.checked ? 'Enabled' : 'Disabled'}`);
          });
        }
      }
    }

    const likeButton = document.getElementById("lyrics-like-button") as HTMLButtonElement;
    // https://icons.getbootstrap.com/icons/heart/
    const outlineHeart = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
      </svg>
    `;

    const filledHeart = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
      </svg>
    `;

    likeButton.addEventListener("click", () => {
      if (isThisSongLiked){
        likeButton.innerHTML = outlineHeart;
        // Seems like Spicetify autodetects the heart state, if heart = true then toggle from list, else add to list 
        Spicetify.Player.toggleHeart();
      }else{
        likeButton.innerHTML = filledHeart;
        Spicetify.Player.toggleHeart();
      }
      setIsThisSongLiked(!isThisSongLiked)
    });

    likeButton.addEventListener('mouseenter', () => (likeButton.style.backgroundColor = 'rgba(255,255,255,0.1)'));
    likeButton.addEventListener('mouseleave', () => (likeButton.style.backgroundColor = 'transparent'));
}

let intervalId: ReturnType<typeof setInterval> | undefined;

export function continousCheckPlayingStatus(){
  // Add a 5 seconds for checking the song status
    if(lyricsPageActive){
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        let isPlaying = checkSongStatus();
        const albumImg = document.getElementById("lyrics-album-image");
        if (isPlaying == true && isAlbumRotating != true){
          const saveAngle = pauseRotation(albumImg);
          setRotationDegree(saveAngle + 1); // +1 to compensate the lag
          resumeRotation(albumImg,rotationDeg);
        } else if (isPlaying == false){
          const saveAngle = pauseRotation(albumImg);
          setRotationDegree(saveAngle);
        }
        if (typeof lyricsPageActive){
          //Spicetify.showNotification((typeof lyricsPageActive));
        }else{
          //Spicetify.showNotification();
        }
        if (typeof lyricsPageActive === "undefined" || !lyricsPageActive) {
          clearInterval(intervalId);
        }
      }, 10000);
    }
    else {
      clearInterval(intervalId);
    }
}

function checkSongStatus() {
  return Spicetify.Player.isPlaying()
}