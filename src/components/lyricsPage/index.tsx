import {
  originalPageState,
  lyricsPageActive,
  highlightInterval,
  setOriginalPageState,
  setLyricsPageActive,
  setCurrentHighlightedLine,
  setHighlightInterval,
  setMemorizedSelectedText,
  rotationDeg,
  setRotationDegree,
  setContinousCheckPlaying,
} from '../../state/lyricsState';
import { fetchAndDisplayLyrics } from '../../utils/lyricsFetcher';
import { updateAlbumImage } from '../../utils/albumImageFetcher';
import { createLyricsPageUI } from '../lyricsPage/ui';
import { attachEventHandlers, continousCheckPlayingStatus } from '../lyricsPage/eventHandlers';
import { handleStartHeart, setupAlbumSwiper, updateRotationKeyframes } from './utils';

// Create lyrics page with proper cleanup
export function showLyricsPage() {
  // If already showing, don't recreate
  if (lyricsPageActive) {
    return;
  }
  const mainView =
    document.querySelector('.main-view-container__scroll-node-child') ||
    document.querySelector('.Root__main-view > div') ||
    document.querySelector('.Root__main-view');

  const topBar = document.querySelector('.main-topBar-container');

  if (!mainView) {
    return;
  }

  if (topBar) {
    (topBar as HTMLElement).style.display = 'none';
  }

  // Store original page state (we no longer need scrollNode)
  const children = Array.from(mainView.children);
  setOriginalPageState({
    children: children,
    parent: mainView,
    topBar: topBar, // Store the top bar element
    originalTopBarDisplay: topBar ? (topBar as HTMLElement).style.display : '', // Store its style
  });

  // Hide original content
  children.forEach((child) => {
    (child as HTMLElement).style.display = 'none';
  });

  // Create and inject the lyrics page UI
  const lyricsContainer = createLyricsPageUI(mainView);
  setLyricsPageActive(true);

  lyricsContainer.setAttribute('tabindex', '0'); // Make it focusable
  lyricsContainer.focus();

  updateAlbumImage();
  
  // Attach all event handlers
  attachEventHandlers(lyricsContainer);

  // Fetch and display lyrics
  fetchAndDisplayLyrics();

  // If the song is playing before the lyrics page set it rotating, otherwise no
  updateRotationKeyframes(rotationDeg);
  const albumImg = document.getElementById("lyrics-album-image");
  if (!albumImg) return;
  albumImg.classList.add("rotating");
  if (Spicetify.Player.isPlaying() != true){
    // We still inject the animation but set it not playing
    albumImg.classList.remove("rotating");
  }

  setupAlbumSwiper();
  handleStartHeart();
  continousCheckPlayingStatus();
}

// Properly close the lyrics page
export function closeLyricsPage() {
  if (!lyricsPageActive || !originalPageState) {
    return;
  }

  // Clear intervals and state
  if (highlightInterval) {
    clearInterval(highlightInterval);
    setHighlightInterval(null);
  }
  setCurrentHighlightedLine(null);
  setMemorizedSelectedText(null);

  // Remove lyrics page elements
  document.getElementById('custom-lyrics-page')?.remove();
  document.getElementById('custom-lyrics-style')?.remove();
  document.getElementById('custom-lyrics-background-style')?.remove();
  document.getElementById('album-rotation-style')?.remove();
  document.getElementById('custom-lyrics-settings-style')?.remove(); // Remove settings
  setRotationDegree(0); // When closing the tab just reset the rotation

  // Restore original content visibility
  if (originalPageState.children) {
    originalPageState.children.forEach((child: Element) => {
      (child as HTMLElement).style.display = '';
    });
  }

  if (originalPageState.topBar) {
    // Restore topbar
    (originalPageState.topBar as HTMLElement).style.display = originalPageState.originalTopBarDisplay || '';
  }
  
  setLyricsPageActive(false);
  setOriginalPageState(null);
}

export function toggleLyricsPage(){
  if (lyricsPageActive){
    closeLyricsPage();
  } else{
    showLyricsPage();
  }
}
