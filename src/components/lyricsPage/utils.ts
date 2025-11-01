import {
    isAlbumRotating,
    rotationDeg,
    setAlbumRotating,
    setIsThisSongLiked,
    setRotationDegree,
} from '../../state/lyricsState';

import { getPrevTrackImageUrl, getNextTrackImageUrl } from '../../utils/albumImageFetcher';

export function handleAlbumRotation() {
    const albumImg = document.getElementById("lyrics-album-image");
    if (!albumImg) return;
    if (isAlbumRotating) {
      const saveAngle = pauseRotation(albumImg);
      setRotationDegree(saveAngle);
    } else {
      resumeRotation(albumImg,rotationDeg);
    }
}
  
export function pauseRotation(albumImg:any) {
    const angle = getCurrentRotation();
  
    albumImg.classList.remove("rotating");
  
    albumImg.style.transform = `rotate(${angle}deg)`;
    setAlbumRotating(false);
  
    return angle;
}
  
export function resumeRotation(albumImg:any, startAngle:number) {
    updateRotationKeyframes(startAngle);
  
    // Reflow to apply the new animation rules
    albumImg.classList.remove("rotating");
    void albumImg.offsetWidth;
    albumImg.classList.add("rotating");
  
    setAlbumRotating(true);
}
  
function getCurrentRotation() {
    const albumImg = document.getElementById("lyrics-album-image");
    if (!albumImg) return 0;
  
    const style = window.getComputedStyle(albumImg);
    const transform = style.getPropertyValue("transform");
  
    if (!transform || transform === "none") {
      return 0; // no rotation
    }
  
    // transform looks like "matrix(a, b, c, d, e, f)"
    const vals = transform.split("(")[1].split(")")[0].split(",");
    const a = Number(vals[0]);
    const b = Number(vals[1]);
  
    let angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    if (angle < 0) {
      angle += 360;
    }
    return angle;
}
  
export function updateRotationKeyframes(startAngle = 0) {
    const styleId = "rotation-keyframes-style";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
  
    styleEl.innerHTML = `
      @keyframes rotation {
        from { transform: rotate(${startAngle}deg); }
        to { transform: rotate(${startAngle + 360}deg); }
      }
  
      #lyrics-album-image.rotating{
        animation: rotation 10s linear infinite;
      }
    `;
}

export function resetLyricsViewScroll() {
    const lyricsScrollContainer = document.getElementById('lyrics-scroll-container');
    if (lyricsScrollContainer) {
      lyricsScrollContainer.scrollTop = 0;
    }
}

export function setupAlbumSwiper() {
    const swiperContainer = document.getElementById('album-art-swiper-container');
    const track = document.getElementById('album-art-track') as HTMLElement;
    const nextAlbumImg = document.getElementById('next-album-image') as HTMLImageElement;
    const prevAlbumImg = document.getElementById('prev-album-image') as HTMLImageElement;

    if (!swiperContainer || !track || !nextAlbumImg) return;

    let isSwiping = false;
    let startX = 0;
    let currentTranslate = 0;
    const SWIPE_THRESHOLD = swiperContainer.offsetWidth / 2; // Swipe 50% to trigger skip

    const CENTER_OFFSET_PERCENT = -33.3333;

    const onSwipeStart = (e: MouseEvent) => {
        isSwiping = true;
        startX = e.clientX;
        track.style.transition = 'none';
        swiperContainer.style.cursor = 'grabbing';

        // Preload the next album image
        const nextImageUrl = getNextTrackImageUrl();
        const prevImageUrl = getPrevTrackImageUrl();
        nextAlbumImg.src = nextImageUrl || '';
        prevAlbumImg.src = prevImageUrl || '';

        e.preventDefault();
    };

    const onSwipeMove = (e: MouseEvent) => {
        if (!isSwiping) return;
        const currentX = e.clientX;
        currentTranslate = currentX - startX;
        
        track.style.transform = `translateX(calc(${CENTER_OFFSET_PERCENT}% + ${currentTranslate}px))`;
    };

    const onSwipeEnd = () => {
        if (!isSwiping) return;
        isSwiping = false;

        track.style.transition = 'transform 0.3s ease-out'; // Re-enable for smooth snapping
        swiperContainer.style.cursor = 'grab';

        // Check if swipe crossed the threshold (only for swiping left)
        if (currentTranslate < -SWIPE_THRESHOLD && nextAlbumImg.src) {
            track.style.transform = `translateX(-66.6666%)`;
            Spicetify.Player.next();
        } 
        else if (currentTranslate > SWIPE_THRESHOLD && prevAlbumImg.src){
          track.style.transform = `translateX(0%)`;
          if (Spicetify.Player.getProgress() > 3000){
            // When played over 3 seconds
            // Back twice, the first resets the track, the second skips
            Spicetify.Player.back();
            Spicetify.Player.back();
          } else{
            Spicetify.Player.back();
          }
          
        }
        else {
            // Snap back to original position
            track.style.transform = `translateX(${CENTER_OFFSET_PERCENT}%)`;
        }
        currentTranslate = 0; // Reset for next swipe
    };

    swiperContainer.addEventListener('mousedown', onSwipeStart);
    // Add listeners to the document to catch mouse movements/releases outside the element
    document.addEventListener('mousemove', onSwipeMove);
    document.addEventListener('mouseup', onSwipeEnd);
    document.addEventListener('mouseleave', onSwipeEnd);
}

export function handleStartHeart(){
  let liked = Spicetify.Player.getHeart();

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
  setIsThisSongLiked(liked);
  if (liked){
    likeButton.innerHTML = filledHeart;
  } else{
    likeButton.innerHTML = outlineHeart;
  }
}

export function trackInplace(){
  const track = document.getElementById('album-art-track') as HTMLElement;
  if (track) {
      // Instantly reset position without animation
      track.style.transition = 'none';
      track.style.transform = 'translateX(-33.3333%)'; 
      // A tiny timeout can help ensure the style is applied before re-enabling transition later
      setTimeout(() => {
          track.style.transition = 'transform 0.3s ease-out';
      }, 50);
  }
}
