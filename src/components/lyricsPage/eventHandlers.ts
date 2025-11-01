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
    ignoreProgrammaticScroll,
    lastProgrammaticScrollAt,
    PROGRAMMATIC_SCROLL_GRACE_MS,
    USER_SCROLL_PAUSE_MS,
    setLastUserScrollAt
} from '../../state/lyricsState';

export function detachEventHandlers() {
    // No longer needed - removed album swiper handlers
}

export function attachEventHandlers(lyricsContainer: HTMLElement) {
    // Attach selection and drag events to the scrollable lyrics container
    const lyricsScrollContainer = document.getElementById('lyrics-scroll-container');
    if (!lyricsScrollContainer) return;
    
    lyricsScrollContainer.addEventListener('mousedown', (e) => {
      // This is part of the album swiper logic, but needs to be here
      // to correctly handle drag state on the lyrics.
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
}