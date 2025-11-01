(async function() {
        while (!Spicetify.React || !Spicetify.ReactDOM) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        var custom_lyrics = (() => {
  // src/state/lyricsState.ts
  var originalPageState = null;
  var lyricsPageActive = false;
  var isDragging = false;
  var startX;
  var startY;
  var memorizedSelectedText = null;
  var currentLyrics = [];
  var highlightInterval = null;
  var currentHighlightedLine = null;
  var isAlbumRotating = false;
  var rotationDeg;
  var scrolledAndStopped = false;
  var isIdle = true;
  var isPlainText = false;
  var preferredLanguage = "any";
  var translatedLyrics = [];
  var translationEnabled = true;
  var firstTimeLoadTranslation = true;
  var activeLyricRequestUri = null;
  var isThisSongLiked = Spicetify.Player.getHeart();
  var USER_SCROLL_PAUSE_MS = 3e3;
  var PROGRAMMATIC_SCROLL_GRACE_MS = 500;
  var lastUserScrollAt = 0;
  var lastProgrammaticScrollAt = 0;
  var ignoreProgrammaticScroll = false;
  function setIsThisSongLiked(status) {
    isThisSongLiked = status;
  }
  function markProgrammaticScroll(graceMs = PROGRAMMATIC_SCROLL_GRACE_MS) {
    lastProgrammaticScrollAt = Date.now();
    ignoreProgrammaticScroll = true;
    setTimeout(() => {
      ignoreProgrammaticScroll = false;
    }, graceMs);
  }
  function setLastUserScrollAt(data) {
    lastUserScrollAt = data;
  }
  var getActiveLyricRequestUri = () => activeLyricRequestUri;
  var setActiveLyricRequestUri = (uri) => {
    activeLyricRequestUri = uri;
  };
  function setTfirstTimeLoadTranslation(enabled) {
    firstTimeLoadTranslation = enabled;
  }
  function setTranslationEnabled(enabled) {
    translationEnabled = enabled;
  }
  function setTranslatedLyrics(lyrics) {
    translatedLyrics = lyrics;
  }
  function setPreferredLanguage(lang) {
    preferredLanguage = lang;
  }
  function setIsPlainText(active) {
    isPlainText = active;
  }
  function setIdle(active) {
    isIdle = active;
  }
  function setScrolledAndStopped(state) {
    scrolledAndStopped = state;
  }
  function setOriginalPageState(state) {
    originalPageState = state;
  }
  function setAlbumRotating(active) {
    isAlbumRotating = active;
  }
  function setRotationDegree(degree) {
    rotationDeg = degree;
  }
  function setLyricsPageActive(active) {
    lyricsPageActive = active;
  }
  function setIsDragging(dragging) {
    isDragging = dragging;
  }
  function setStartX(x) {
    startX = x;
  }
  function setStartY(y) {
    startY = y;
  }
  function setMemorizedSelectedText(text) {
    memorizedSelectedText = text;
  }
  function setCurrentLyrics(lyrics) {
    currentLyrics = lyrics;
  }
  function setHighlightInterval(interval) {
    highlightInterval = interval;
  }
  function setCurrentHighlightedLine(lineId) {
    currentHighlightedLine = lineId;
  }

  // src/utils/albumImageFetcher.ts
  function getAlbumImageUrl() {
    var _a, _b, _c, _d, _e, _f;
    if (((_f = (_e = (_d = (_c = (_b = (_a = window.Spicetify) == null ? void 0 : _a.Player) == null ? void 0 : _b.data) == null ? void 0 : _c.item) == null ? void 0 : _d.album) == null ? void 0 : _e.images) == null ? void 0 : _f.length) > 0) {
      return window.Spicetify.Player.data.item.album.images[0].url;
    }
    return null;
  }
  function updateAlbumImage() {
    const albumImage = document.getElementById("lyrics-album-image");
    const imageUrl = getAlbumImageUrl();
    if (albumImage && imageUrl) {
      albumImage.src = imageUrl;
    }
  }
  var getNextTrackImageUrl = () => {
    const nextTracks = Spicetify.Queue.nextTracks;
    if (nextTracks && nextTracks.length > 0) {
      const nextTrackWrapper = nextTracks[0];
      const actualTrackData = nextTrackWrapper.contextTrack;
      return (actualTrackData == null ? void 0 : actualTrackData.metadata.image_url) || null;
    }
    return null;
  };
  var getPrevTrackImageUrl = () => {
    var _a;
    const prevTracks = Spicetify.Queue.prevTracks;
    if (prevTracks && prevTracks.length > 0) {
      const prevTrackWrapper = prevTracks[prevTracks.length - 1];
      const actualTrackData = prevTrackWrapper.contextTrack;
      return ((_a = actualTrackData.metadata) == null ? void 0 : _a.image_url) || null;
    }
    return null;
  };

  // src/components/lyricsPage/utils.ts
  function handleAlbumRotation() {
    const albumImg = document.getElementById("lyrics-album-image");
    if (!albumImg)
      return;
    if (isAlbumRotating) {
      const saveAngle = pauseRotation(albumImg);
      setRotationDegree(saveAngle);
    } else {
      resumeRotation(albumImg, rotationDeg);
    }
  }
  function pauseRotation(albumImg) {
    const angle = getCurrentRotation();
    albumImg.classList.remove("rotating");
    albumImg.style.transform = `rotate(${angle}deg)`;
    setAlbumRotating(false);
    return angle;
  }
  function resumeRotation(albumImg, startAngle) {
    updateRotationKeyframes(startAngle);
    albumImg.classList.remove("rotating");
    void albumImg.offsetWidth;
    albumImg.classList.add("rotating");
    setAlbumRotating(true);
  }
  function getCurrentRotation() {
    const albumImg = document.getElementById("lyrics-album-image");
    if (!albumImg)
      return 0;
    const style = window.getComputedStyle(albumImg);
    const transform = style.getPropertyValue("transform");
    if (!transform || transform === "none") {
      return 0;
    }
    const vals = transform.split("(")[1].split(")")[0].split(",");
    const a = Number(vals[0]);
    const b = Number(vals[1]);
    let angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    if (angle < 0) {
      angle += 360;
    }
    return angle;
  }
  function updateRotationKeyframes(startAngle = 0) {
    const styleId = "rotation-keyframes-style";
    let styleEl = document.getElementById(styleId);
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
  function resetLyricsViewScroll() {
    const lyricsScrollContainer = document.getElementById("lyrics-scroll-container");
    if (lyricsScrollContainer) {
      lyricsScrollContainer.scrollTop = 0;
    }
  }
  function setupAlbumSwiper() {
    const swiperContainer = document.getElementById("album-art-swiper-container");
    const track = document.getElementById("album-art-track");
    const nextAlbumImg = document.getElementById("next-album-image");
    const prevAlbumImg = document.getElementById("prev-album-image");
    if (!swiperContainer || !track || !nextAlbumImg)
      return;
    let isSwiping = false;
    let startX2 = 0;
    let currentTranslate = 0;
    const SWIPE_THRESHOLD = swiperContainer.offsetWidth / 2;
    const CENTER_OFFSET_PERCENT = -33.3333;
    const onSwipeStart = (e) => {
      isSwiping = true;
      startX2 = e.clientX;
      track.style.transition = "none";
      swiperContainer.style.cursor = "grabbing";
      const nextImageUrl = getNextTrackImageUrl();
      const prevImageUrl = getPrevTrackImageUrl();
      nextAlbumImg.src = nextImageUrl || "";
      prevAlbumImg.src = prevImageUrl || "";
      e.preventDefault();
    };
    const onSwipeMove = (e) => {
      if (!isSwiping)
        return;
      const currentX = e.clientX;
      currentTranslate = currentX - startX2;
      track.style.transform = `translateX(calc(${CENTER_OFFSET_PERCENT}% + ${currentTranslate}px))`;
    };
    const onSwipeEnd = () => {
      if (!isSwiping)
        return;
      isSwiping = false;
      track.style.transition = "transform 0.3s ease-out";
      swiperContainer.style.cursor = "grab";
      if (currentTranslate < -SWIPE_THRESHOLD && nextAlbumImg.src) {
        track.style.transform = `translateX(-66.6666%)`;
        Spicetify.Player.next();
      } else if (currentTranslate > SWIPE_THRESHOLD && prevAlbumImg.src) {
        track.style.transform = `translateX(0%)`;
        if (Spicetify.Player.getProgress() > 3e3) {
          Spicetify.Player.back();
          Spicetify.Player.back();
        } else {
          Spicetify.Player.back();
        }
      } else {
        track.style.transform = `translateX(${CENTER_OFFSET_PERCENT}%)`;
      }
      currentTranslate = 0;
    };
    swiperContainer.addEventListener("mousedown", onSwipeStart);
    document.addEventListener("mousemove", onSwipeMove);
    document.addEventListener("mouseup", onSwipeEnd);
    document.addEventListener("mouseleave", onSwipeEnd);
  }
  function handleStartHeart() {
    let liked = Spicetify.Player.getHeart();
    const likeButton = document.getElementById("lyrics-like-button");
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
    if (liked) {
      likeButton.innerHTML = filledHeart;
    } else {
      likeButton.innerHTML = outlineHeart;
    }
  }
  function trackInplace() {
    const track = document.getElementById("album-art-track");
    if (track) {
      track.style.transition = "none";
      track.style.transform = "translateX(-33.3333%)";
      setTimeout(() => {
        track.style.transition = "transform 0.3s ease-out";
      }, 50);
    }
  }

  // src/utils/netEasyFetcher.ts
  async function searchId(artists, title, album_name, duration) {
    const baseUrl = "https://apis.netstart.cn/music/search";
    try {
      let queryParams = "keywords=" + title;
      for (const artist of artists) {
        queryParams += " " + artist;
      }
      queryParams += "&limit=10";
      const url = `${baseUrl}?${queryParams.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      let songId = 0;
      if (response.ok) {
        for (const song of data.result.songs) {
          if (song.name != title) {
            continue;
          }
          let count = 0;
          for (const searchedArtist of song.artists) {
            if (artists.includes(searchedArtist.name))
              count++;
          }
          if (Math.abs(count - song.artists.length) > 1) {
            continue;
          }
          if (Math.abs(duration - song.duration) > 500) {
            continue;
          }
          songId = song.id;
          break;
        }
      }
      if (songId == 0) {
        return -1;
      }
      return songId;
    } catch (e) {
      if (e instanceof Error) {
        Spicetify.showNotification(e.message, true);
      } else {
        Spicetify.showNotification(String(e), true);
      }
    }
  }

  // src/utils/translate.ts
  async function translate(query) {
    const baseUrl = "https://k-sepia-six.vercel.app/api/translate";
    try {
      if (preferredLanguage == "zh") {
        setPreferredLanguage("zh-Hans");
      }
      let queryParams = "q=" + query + "&to=" + preferredLanguage;
      const url = `${baseUrl}?${queryParams.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Spicetify.showNotification(`Translation failed: ${errorMessage}`, true);
    }
  }
  function stickTranslationLyrics(lyrics, outputQuery) {
    const parts = outputQuery.split("</l>");
    let translatedLyrics2 = [];
    const filteredParts = parts.filter((p) => p.includes("<l>"));
    for (const part of filteredParts) {
      const cleanLine = part.replace("<l>", "").trim();
      translatedLyrics2.push({ time: 0, line: cleanLine });
    }
    for (let i = 0; i < Math.min(lyrics.length, translatedLyrics2.length); i++) {
      translatedLyrics2[i].time = lyrics[i].time;
    }
    return translatedLyrics2;
  }
  async function processFullLyrics(lyrics, requestUri) {
    if (requestUri !== getActiveLyricRequestUri()) {
      return;
    }
    let length_count = 0;
    let outputQuery = "";
    let batchQuery = "";
    for (let i = 0; i < lyrics.length; i++) {
      const lineAsHtml = `<l>${lyrics[i].line}</l>`;
      if (lineAsHtml.length + length_count < 800) {
        batchQuery += lineAsHtml;
        length_count += lineAsHtml.length;
      } else {
        const data = await translate(batchQuery);
        if (requestUri !== getActiveLyricRequestUri()) {
          return;
        }
        if (data == null) {
          Spicetify.showNotification("null data");
        } else {
          outputQuery += data.translation;
        }
        batchQuery = lineAsHtml;
        length_count = lineAsHtml.length;
      }
    }
    if (batchQuery != null) {
      const data = await translate(batchQuery);
      if (requestUri !== getActiveLyricRequestUri()) {
        return;
      }
      if (data == null) {
        Spicetify.showNotification("null data");
      } else {
        outputQuery += data.translation;
      }
    }
    const translatedLyrics2 = stickTranslationLyrics(lyrics, outputQuery);
    if (translatedLyrics2 == null) {
      return;
    }
    if (requestUri !== getActiveLyricRequestUri()) {
      return;
    }
    setTranslatedLyrics(translatedLyrics2);
    if (translationEnabled) {
      insertTranslations(translatedLyrics2);
    }
  }

  // src/utils/lyricsFetcher.ts
  async function fetchAndDisplayLyrics() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    const loadingEl = document.getElementById("lyrics-loading");
    const contentEl = document.getElementById("lyrics-content");
    const errorEl = document.getElementById("lyrics-error");
    const headerInfo = document.getElementById("track-info-header");
    const artistInfo = document.getElementById("track-info-artist");
    const errorDetails = document.getElementById("error-details");
    if (contentEl)
      contentEl.innerHTML = "";
    if (loadingEl)
      loadingEl.style.display = "none";
    if (errorEl)
      errorEl.style.display = "none";
    if (highlightInterval) {
      clearInterval(highlightInterval);
      setHighlightInterval(null);
    }
    setCurrentHighlightedLine(null);
    setCurrentLyrics([]);
    if (!((_c = (_b = (_a = window.Spicetify) == null ? void 0 : _a.Player) == null ? void 0 : _b.data) == null ? void 0 : _c.item)) {
      if (errorEl)
        errorEl.style.display = "block";
      if (errorDetails)
        errorDetails.textContent = "No track currently playing";
      return;
    }
    const track = (_d = window.Spicetify.Player.data) == null ? void 0 : _d.item;
    if (!track || !track.artists || !track.artists.length) {
      window.Spicetify.showNotification("Could not get track info.", true);
      setActiveLyricRequestUri(null);
      return;
    }
    const requestedTrackUri = track.uri;
    setActiveLyricRequestUri(requestedTrackUri);
    const artist = (_e = track.artists[0].name) != null ? _e : "";
    const title = track.name;
    const album_name = (_g = (_f = track.album) == null ? void 0 : _f.name) != null ? _g : "";
    const duration = (_i = (_h = track.duration) == null ? void 0 : _h.milliseconds) != null ? _i : 0;
    const duration_in_seconds = Math.ceil(duration / 1e3);
    if (headerInfo)
      headerInfo.textContent = title;
    if (artistInfo)
      artistInfo.textContent = artist;
    let careSearchPlainLyrics = "";
    try {
      const baseUrl = "https://lrclib.net/api/get";
      const queryParams = new URLSearchParams({
        artist_name: artist,
        track_name: title,
        album_name,
        duration: duration_in_seconds.toString()
      });
      const url = `${baseUrl}?${queryParams.toString()}`;
      const processed = url.replace(/%20/g, "+").replace(/%28/g, "(").replace(/%29/g, ")");
      const response = await fetch(processed);
      if (((_k = (_j = window.Spicetify.Player.data) == null ? void 0 : _j.item) == null ? void 0 : _k.uri) !== requestedTrackUri) {
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.syncedLyrics == null) {
        if (data.plainLyrics != null) {
          if (careSearchPlainLyrics != null) {
            careSearchPlainLyrics = "";
          }
          careSearchPlainLyrics = data.plainLyrics;
        }
        throw new Error("No synced found");
      }
      const artists = track.artists;
      let artistsname = [];
      for (const artist2 of artists) {
        artistsname.push(artist2.name);
      }
      const NEsongId = await searchId(artistsname, title, duration, album_name);
      if (((_m = (_l = window.Spicetify.Player.data) == null ? void 0 : _l.item) == null ? void 0 : _m.uri) !== requestedTrackUri) {
        return;
      }
      displaySyncedLyrics(data, requestedTrackUri);
    } catch (error) {
      const artists = track.artists;
      let artistsname = [];
      for (const artist2 of artists) {
        artistsname.push(artist2.name);
      }
      const success = await trySearchAPI(artistsname, title, duration_in_seconds, album_name, requestedTrackUri, careSearchPlainLyrics);
      if (!success) {
        if (((_o = (_n = window.Spicetify.Player.data) == null ? void 0 : _n.item) == null ? void 0 : _o.uri) !== requestedTrackUri) {
          return;
        }
        if (loadingEl)
          loadingEl.style.display = "none";
        if (contentEl)
          contentEl.style.display = "none";
        if (errorEl)
          errorEl.style.display = "block";
        if (errorDetails)
          errorDetails.textContent = `${title} by ${artist}`;
        if (highlightInterval) {
          clearInterval(highlightInterval);
          setHighlightInterval(null);
        }
        setCurrentHighlightedLine(null);
        setCurrentLyrics([]);
      }
    }
  }
  async function trySearchAPI(artists, title, duration, album_name, requestedTrackUri, careSearchPlainLyrics) {
    var _a, _b;
    const baseUrl = "https://lrclib.net/api/search";
    try {
      let queryParams = "q=" + title;
      for (const artist of artists) {
        queryParams += " " + artist;
      }
      const url = `${baseUrl}?${queryParams.toString()}`;
      if (((_b = (_a = window.Spicetify.Player.data) == null ? void 0 : _a.item) == null ? void 0 : _b.uri) !== requestedTrackUri) {
        return true;
      }
      const response = await fetch(url);
      const songs = await response.json();
      for (const song of songs) {
        if (song.trackName === title && Math.abs(song.duration - duration) < 10) {
          displaySyncedLyrics(song, requestedTrackUri);
          return true;
        }
      }
      if (careSearchPlainLyrics != null) {
        const sus = {
          id: 0,
          name: title,
          trackName: title,
          artistName: artists[0],
          albumName: album_name,
          duration,
          instrumental: false,
          syncedLyrics: "",
          plainLyrics: careSearchPlainLyrics
        };
        displaySyncedLyrics(sus, requestedTrackUri);
      }
      throw new Error("found nothing");
    } catch (e) {
      return false;
    }
  }
  function handleTranslations() {
    const contentEl = document.getElementById("lyrics-content");
    if (contentEl) {
      const willBeEnabled = !translationEnabled;
      setTranslationEnabled(willBeEnabled);
      if (translationEnabled) {
        insertTranslations(translatedLyrics);
        contentEl.classList.add("translation-visible");
      } else {
        contentEl.classList.remove("translation-visible");
      }
    }
  }
  function insertTranslations(translatedLyrics2) {
    for (let i = 0; i < translatedLyrics2.length; i++) {
      const el = document.getElementById(`translated-line-${i}`);
      if (el) {
        el.textContent = translatedLyrics2[i].line;
      }
    }
  }
  function displaySyncedLyrics(data, trackUri) {
    var _a, _b, _c;
    const contentEl = document.getElementById("lyrics-content");
    const loadingEl = document.getElementById("lyrics-loading");
    const errorEl = document.getElementById("lyrics-error");
    if (loadingEl)
      loadingEl.style.display = "none";
    if (errorEl) {
      errorEl.style.display = "none";
      setCurrentLyrics([]);
    }
    if (contentEl)
      contentEl.style.display = "block";
    setCurrentLyrics([]);
    if (highlightInterval) {
      clearInterval(highlightInterval);
      setHighlightInterval(null);
    }
    setCurrentHighlightedLine(null);
    setCurrentLyrics([]);
    setTranslatedLyrics([]);
    setTfirstTimeLoadTranslation(true);
    if (data.instrumental) {
      currentLyrics.push({
        time: 0,
        line: "Instrumental, Enjoy!"
      });
    } else if (data.syncedLyrics) {
      const lines = data.syncedLyrics.split("\n");
      const parsedLyrics = lines.map((line) => {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          const milliseconds = parseInt(match[3], 10);
          const time = minutes * 60 + seconds + milliseconds / (match[3].length === 3 ? 1e3 : 100);
          const text = match[4].trim();
          if (text)
            return { time, line: text };
        }
        return null;
      }).filter(Boolean);
      setIsPlainText(false);
      setCurrentLyrics(parsedLyrics);
      processFullLyrics(currentLyrics, trackUri);
      resetToCurrentHighlightedLine();
      setTfirstTimeLoadTranslation(false);
    }
    if (currentLyrics.length === 0 && data.plainLyrics) {
      data.plainLyrics.split("\n").map((line) => line.trim()).filter(Boolean).forEach((line) => currentLyrics.push({ time: 99999999, line }));
      setIsPlainText(true);
      processFullLyrics(currentLyrics, trackUri);
      resetToCurrentHighlightedLine();
      setTfirstTimeLoadTranslation(false);
    }
    if (contentEl) {
      let html = "";
      for (let index = 0; index < currentLyrics.length; index++) {
        const lyric = currentLyrics[index];
        const translation = (_b = (_a = translatedLyrics[index]) == null ? void 0 : _a.line) != null ? _b : "";
        html += `
        <div class="lyric-line-container">
          <p id="lyric-line-${index}" class="lyric-line" data-time="${lyric.time}">
            ${lyric.line}
          </p>
          <p id="translated-line-${index}" class="translated-lyric-line">
            ${translation}
          </p>
        </div>
      `;
      }
      contentEl.innerHTML = html;
      if (translationEnabled) {
        contentEl.classList.add("translation-visible");
      }
      contentEl.addEventListener("click", (e) => {
        const selection = window.getSelection();
        const selectedTextLength = selection ? selection.toString().length : 0;
        if (!isDragging && selectedTextLength === 0) {
          const target = e.target;
          if (target && target.classList.contains("lyric-line")) {
            const time = parseFloat(target.dataset.time || "0");
            if (time >= 0) {
              window.Spicetify.Player.seek(time * 1e3);
              if (currentHighlightedLine) {
                const prevActiveEl = document.getElementById(currentHighlightedLine);
                if (prevActiveEl)
                  prevActiveEl.classList.remove("active");
              }
              target.classList.add("active");
              setCurrentHighlightedLine(target.id);
              target.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }
      });
    }
    (_c = document.getElementById("custom-lyrics-style")) == null ? void 0 : _c.remove();
    const styleEl = document.createElement("style");
    styleEl.id = "custom-lyrics-style";
    styleEl.textContent = `
    #lyrics-content {
      padding-bottom: 50vh;
      box-sizing: border-box;
    }
    .lyric-line-container {
      margin: 16px 0;
    }
    #lyrics-content.translation-visible .lyric-line-container {
      margin: 28px 0;
    }
    .translated-lyric-line {
      font-size: 18px;
      margin-top: 8px;
      opacity: 0.5;
      text-align: center;
      color: #ffffffb3;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      display: none;
    }
    .lyric-line {
      font-size: 24px;
      margin: 16px 0;
      opacity: 0.6;
      transition: opacity 0.3s, color 0.3s, transform 0.3s;
      text-align: center;
      cursor: pointer;
      color: #ffffffc4;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
    } 
    .lyric-line.active {
      color: #ffffffff;
      opacity: 1;
      font-weight: 1000;
      transform: scale(1.05);
      text-shadow: 3px 3px 6px rgba(0,0,0,0.9);
    }
    #lyrics-content.translation-visible .translated-lyric-line {
      display: block;
    }
    .lyric-line.active + .translated-lyric-line {
      opacity: 0.8;
      color: #ffffffff;
    }
  `;
    document.head.appendChild(styleEl);
    setHighlightInterval(
      window.setInterval(() => {
        const progress = window.Spicetify.Player.getProgress();
        const seconds = progress / 1e3;
        let activeLineIndex = -1;
        for (let i = currentLyrics.length - 1; i >= 0; i--) {
          if (currentLyrics[i].time <= seconds) {
            activeLineIndex = i;
            break;
          }
        }
        const newActiveLineId = activeLineIndex !== -1 ? `lyric-line-${activeLineIndex}` : null;
        if (newActiveLineId && newActiveLineId !== currentHighlightedLine) {
          if (currentHighlightedLine) {
            const prevActiveEl = document.getElementById(currentHighlightedLine);
            if (prevActiveEl)
              prevActiveEl.classList.remove("active");
          }
          const newActiveEl = document.getElementById(newActiveLineId);
          if (newActiveEl) {
            newActiveEl.classList.add("active");
            const now = Date.now();
            const userPaused = now - lastUserScrollAt < USER_SCROLL_PAUSE_MS;
            if (!userPaused) {
              markProgrammaticScroll();
              newActiveEl.scrollIntoView({ behavior: "smooth", block: "center" });
              const albumImg = document.getElementById("lyrics-album-image");
              if (!albumImg)
                return;
              if (!isAlbumRotating) {
                resumeRotation(albumImg, rotationDeg);
              }
            }
          }
          setCurrentHighlightedLine(newActiveLineId);
        } else if (!newActiveLineId && currentHighlightedLine) {
          const prevActiveEl = document.getElementById(currentHighlightedLine);
          if (prevActiveEl)
            prevActiveEl.classList.remove("active");
          setCurrentHighlightedLine(null);
        }
      }, 250)
    );
  }
  function resetToCurrentHighlightedLine() {
    if (currentHighlightedLine) {
      const currentActiveEl = document.getElementById(currentHighlightedLine);
      if (currentActiveEl) {
        markProgrammaticScroll();
        currentActiveEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  // src/components/lyricsPage/ui.ts
  function createLyricsPageUI(mainView) {
    const lyricsContainer = document.createElement("div");
    lyricsContainer.id = "custom-lyrics-page";
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
          <div style="font-size: 48px; margin-bottom: 16px;">\u{1F3B5}</div>
          <p>Loading lyrics...</p>
        </div>
        <div id="lyrics-content" style="display: none;"></div>
        <div id="lyrics-error" style="display: none; text-align: center; padding: 64px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">\u{1F614}</div>
          <p>No lyrics found for this track</p>
          <p id="error-details" style="opacity: 0.7; font-size: 14px; margin-top: 8px;"></p>
        </div>
      </div>
    `;
    lyricsContainer.innerHTML = lyricsHTML;
    mainView.appendChild(lyricsContainer);
    const settingsStyleEl = document.createElement("style");
    settingsStyleEl.id = "custom-lyrics-settings-style";
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
  function updateLyricsBackground() {
    const backgroundEl = document.getElementById("lyrics-background");
    const imageUrl = getAlbumImageUrl();
    if (backgroundEl && imageUrl) {
      backgroundEl.style.backgroundImage = `url(${imageUrl})`;
      backgroundEl.style.opacity = "1";
    }
  }

  // src/components/lyricsPage/eventHandlers.ts
  function attachEventHandlers(lyricsContainer) {
    const lyricsScrollContainer = document.getElementById("lyrics-scroll-container");
    if (!lyricsScrollContainer)
      return;
    lyricsScrollContainer.addEventListener("mousedown", (e) => {
      setStartX(e.clientX);
      setStartY(e.clientY);
      setIsDragging(false);
    });
    lyricsScrollContainer.addEventListener("mousemove", (e) => {
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
    lyricsScrollContainer.addEventListener("mouseup", () => {
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
    let scrollTimeout = null;
    lyricsScrollContainer.addEventListener("scroll", () => {
      const now = Date.now();
      if (ignoreProgrammaticScroll || now - lastProgrammaticScrollAt < PROGRAMMATIC_SCROLL_GRACE_MS) {
        return;
      }
      setLastUserScrollAt(now);
      setIdle(false);
      setScrolledAndStopped(false);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(() => {
        setIdle(true);
        setScrolledAndStopped(true);
      }, USER_SCROLL_PAUSE_MS);
    });
    lyricsContainer.addEventListener("copy", (e) => e.stopPropagation());
    lyricsContainer.addEventListener("contextmenu", (e) => e.stopPropagation());
    lyricsContainer.addEventListener("keydown", (e) => {
      var _a;
      if (e.ctrlKey && e.key === "c") {
        const selectedText = (_a = window.getSelection()) == null ? void 0 : _a.toString();
        if (selectedText) {
          try {
            if (document.execCommand("copy")) {
              Spicetify.showNotification("Lyrics copied to clipboard!", false);
            } else {
              Spicetify.showNotification("Failed to copy lyrics.", true);
            }
          } catch (err) {
            Spicetify.showNotification("Failed to copy lyrics.", true);
          }
        } else {
          Spicetify.showNotification("No text selected to copy.", true);
        }
        e.stopPropagation();
        e.preventDefault();
      }
    });
    const copyButton = document.getElementById("lyrics-copy-button");
    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        if (isPlainText == true) {
          return;
        }
        lyricsContainer.focus();
        const selection = window.getSelection();
        let textToCopy = "";
        if (memorizedSelectedText) {
          textToCopy = memorizedSelectedText;
        } else if (selection && selection.toString().length > 0) {
          textToCopy = selection.toString();
        } else {
          const lyricsContentEl = document.getElementById("lyrics-content");
          if (lyricsContentEl) {
            textToCopy = lyricsContentEl.innerText;
          }
        }
        if (textToCopy) {
          try {
            await navigator.clipboard.writeText(textToCopy);
            Spicetify.showNotification("Lyrics copied to clipboard!", false);
          } catch (err) {
            Spicetify.showNotification("Failed to copy lyrics.", true);
          }
        } else {
          Spicetify.showNotification("No lyrics to copy.", true);
        }
      });
      copyButton.addEventListener("mouseenter", () => copyButton.style.backgroundColor = "rgba(255,255,255,0.1)");
      copyButton.addEventListener("mouseleave", () => copyButton.style.backgroundColor = "transparent");
      const settingsButton = document.getElementById("lyrics-settings-button");
      const settingsMenu = document.getElementById("lyrics-settings-menu");
      if (settingsButton && settingsMenu) {
        settingsButton.addEventListener("click", (e) => {
          e.stopPropagation();
          const isHidden = settingsMenu.style.display === "none";
          settingsMenu.style.display = isHidden ? "block" : "none";
        });
        settingsButton.addEventListener("mouseenter", () => settingsButton.style.backgroundColor = "rgba(255,255,255,0.1)");
        settingsButton.addEventListener("mouseleave", () => settingsButton.style.backgroundColor = "transparent");
        lyricsContainer.addEventListener("click", (e) => {
          if (settingsMenu.style.display === "block" && !settingsMenu.contains(e.target) && e.target !== settingsButton) {
            settingsMenu.style.display = "none";
          }
        });
        const languageSelect = document.getElementById("setting-language-select");
        if (languageSelect) {
          const savedLanguage = Spicetify.LocalStorage.get("lyrics-plus-language") || "any";
          setPreferredLanguage(savedLanguage);
          languageSelect.value = savedLanguage;
          languageSelect.addEventListener("change", () => {
            const newLanguage = languageSelect.value;
            setPreferredLanguage(newLanguage);
            Spicetify.LocalStorage.set("lyrics-plus-language", newLanguage);
            fetchAndDisplayLyrics();
          });
        }
        const rotationToggle = document.getElementById("setting-toggle-rotation");
        if (rotationToggle) {
          rotationToggle.addEventListener("change", () => {
            const albumImg = document.getElementById("lyrics-album-image");
            if (!albumImg)
              return;
            if (rotationToggle.checked) {
              resumeRotation(albumImg, rotationDeg);
            } else {
              const savedAngle = pauseRotation(albumImg);
              setRotationDegree(savedAngle);
            }
          });
        }
        const translateToggle = document.getElementById("setting-toggle-translation");
        if (translateToggle) {
          const savedPreference = Spicetify.LocalStorage.get("translation-enabled") === "true";
          translateToggle.checked = savedPreference;
          setTranslationEnabled(savedPreference);
          translateToggle.addEventListener("change", () => {
            if (!currentLyrics || currentLyrics.length === 0) {
              Spicetify.showNotification("Lyrics not available for translation.", true);
              translateToggle.checked = !translateToggle.checked;
              return;
            }
            handleTranslations();
            Spicetify.showNotification(`Translations ${translateToggle.checked ? "Enabled" : "Disabled"}`);
            resetToCurrentHighlightedLine();
            Spicetify.LocalStorage.set("translation-enabled", translateToggle.checked.toString());
          });
        }
      }
    }
    const likeButton = document.getElementById("lyrics-like-button");
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
      if (isThisSongLiked) {
        likeButton.innerHTML = outlineHeart;
        Spicetify.Player.toggleHeart();
      } else {
        likeButton.innerHTML = filledHeart;
        Spicetify.Player.toggleHeart();
      }
      setIsThisSongLiked(!isThisSongLiked);
    });
    likeButton.addEventListener("mouseenter", () => likeButton.style.backgroundColor = "rgba(255,255,255,0.1)");
    likeButton.addEventListener("mouseleave", () => likeButton.style.backgroundColor = "transparent");
  }
  var intervalId;
  function continousCheckPlayingStatus() {
    if (lyricsPageActive) {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        let isPlaying = checkSongStatus();
        const albumImg = document.getElementById("lyrics-album-image");
        if (isPlaying == true && isAlbumRotating != true) {
          const saveAngle = pauseRotation(albumImg);
          setRotationDegree(saveAngle + 1);
          resumeRotation(albumImg, rotationDeg);
        } else if (isPlaying == false) {
          const saveAngle = pauseRotation(albumImg);
          setRotationDegree(saveAngle);
        }
        if (typeof lyricsPageActive) {
        } else {
        }
        if (typeof lyricsPageActive === "undefined" || !lyricsPageActive) {
          clearInterval(intervalId);
        }
      }, 1e4);
    } else {
      clearInterval(intervalId);
    }
  }
  function checkSongStatus() {
    return Spicetify.Player.isPlaying();
  }

  // src/components/lyricsPage/index.tsx
  function showLyricsPage() {
    if (lyricsPageActive) {
      return;
    }
    const mainView = document.querySelector(".main-view-container__scroll-node-child") || document.querySelector(".Root__main-view > div") || document.querySelector(".Root__main-view");
    const topBar = document.querySelector(".main-topBar-container");
    if (!mainView) {
      return;
    }
    if (topBar) {
      topBar.style.display = "none";
    }
    const children = Array.from(mainView.children);
    setOriginalPageState({
      children,
      parent: mainView,
      topBar,
      originalTopBarDisplay: topBar ? topBar.style.display : ""
    });
    children.forEach((child) => {
      child.style.display = "none";
    });
    const lyricsContainer = createLyricsPageUI(mainView);
    setLyricsPageActive(true);
    lyricsContainer.setAttribute("tabindex", "0");
    lyricsContainer.focus();
    updateAlbumImage();
    attachEventHandlers(lyricsContainer);
    fetchAndDisplayLyrics();
    updateRotationKeyframes(rotationDeg);
    const albumImg = document.getElementById("lyrics-album-image");
    if (!albumImg)
      return;
    albumImg.classList.add("rotating");
    if (Spicetify.Player.isPlaying() != true) {
      albumImg.classList.remove("rotating");
    }
    setupAlbumSwiper();
    handleStartHeart();
    continousCheckPlayingStatus();
  }
  function closeLyricsPage() {
    var _a, _b, _c, _d, _e;
    if (!lyricsPageActive || !originalPageState) {
      return;
    }
    if (highlightInterval) {
      clearInterval(highlightInterval);
      setHighlightInterval(null);
    }
    setCurrentHighlightedLine(null);
    setMemorizedSelectedText(null);
    (_a = document.getElementById("custom-lyrics-page")) == null ? void 0 : _a.remove();
    (_b = document.getElementById("custom-lyrics-style")) == null ? void 0 : _b.remove();
    (_c = document.getElementById("custom-lyrics-background-style")) == null ? void 0 : _c.remove();
    (_d = document.getElementById("album-rotation-style")) == null ? void 0 : _d.remove();
    (_e = document.getElementById("custom-lyrics-settings-style")) == null ? void 0 : _e.remove();
    setRotationDegree(0);
    if (originalPageState.children) {
      originalPageState.children.forEach((child) => {
        child.style.display = "";
      });
    }
    if (originalPageState.topBar) {
      originalPageState.topBar.style.display = originalPageState.originalTopBarDisplay || "";
    }
    setLyricsPageActive(false);
    setOriginalPageState(null);
  }
  function toggleLyricsPage() {
    if (lyricsPageActive) {
      closeLyricsPage();
    } else {
      showLyricsPage();
    }
  }

  // src/components/lyricsButton.tsx
  function changeButtonColor() {
    const icon = document.getElementById("lyrics-button");
    if (icon instanceof SVGElement) {
      if (lyricsPageActive) {
        icon.style.color = "green";
      } else {
        icon.style.color = "white";
      }
    }
  }
  function createLyricsButton() {
    let attempts = 0;
    const tryCreateButton = () => {
      attempts++;
      if (document.querySelector("#spotify-lyrics-button")) {
        return;
      }
      const selectors = [
        ".main-nowPlayingBar-extraControls",
        ".ExtraControls",
        ".main-nowPlayingBar-right",
        '[data-testid="now-playing-bar"] .main-nowPlayingBar-right',
        ".player-controls__right",
        ".now-playing-bar__right"
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
          createFloatingButton();
          return;
        }
      }
      const button = document.createElement("button");
      button.id = "spotify-lyrics-button";
      button.className = "Button-sc-1dqy6lx-0 Button-small-small Button-ui-variant-ghost";
      button.setAttribute("aria-label", "Lyrics");
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
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLyricsPage();
        changeButtonColor();
      });
      button.addEventListener("mouseenter", () => {
        button.style.color = "var(--text-base, #ffffff)";
        button.style.backgroundColor = "rgba(255,255,255,0.1)";
        button.style.transform = "scale(1.06)";
      });
      button.addEventListener("mouseleave", () => {
        button.style.color = "var(--text-subdued, #b3b3b3)";
        button.style.backgroundColor = "transparent";
        button.style.transform = "scale(1)";
      });
      container.appendChild(button);
    };
    tryCreateButton();
  }
  function createFloatingButton() {
    if (document.querySelector("#spotify-lyrics-button-floating")) {
      return;
    }
    const button = document.createElement("button");
    button.id = "spotify-lyrics-button-floating";
    button.innerHTML = "Lyrics";
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
    button.addEventListener("click", (e) => {
      toggleLyricsPage();
      changeButtonColor();
    });
    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.05)";
      button.style.boxShadow = "0 6px 16px rgba(0,0,0,0.5)";
    });
    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)";
      button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
    });
    document.body.appendChild(button);
  }

  // src/event-handlers/globalEventHandlers.ts
  function setupGlobalEventHandlers() {
    var _a, _b, _c;
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        if (lyricsPageActive) {
          closeLyricsPage();
        } else {
          showLyricsPage();
        }
      }
    });
    if ((_c = (_b = (_a = window.Spicetify) == null ? void 0 : _a.Platform) == null ? void 0 : _b.History) == null ? void 0 : _c.listen) {
      window.Spicetify.Platform.History.listen(() => {
        if (lyricsPageActive) {
          closeLyricsPage();
        }
      });
    }
    async function main2() {
      var _a2, _b2, _c2;
      let attempts = 0;
      while (!((_b2 = (_a2 = window.Spicetify) == null ? void 0 : _a2.Player) == null ? void 0 : _b2.data) && attempts < 100) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      if (!((_c2 = window.Spicetify) == null ? void 0 : _c2.Player)) {
        return;
      }
      setTimeout(createLyricsButton, 1e3);
      if (window.Spicetify.Player.addEventListener) {
        window.Spicetify.Player.addEventListener("songchange", () => {
          if (highlightInterval) {
            clearInterval(highlightInterval);
            setHighlightInterval(null);
          }
          setCurrentHighlightedLine(null);
          if (lyricsPageActive) {
            fetchAndDisplayLyrics();
          }
          setMemorizedSelectedText(null);
          updateAlbumImage();
          updateLyricsBackground();
          resetLyricsViewScroll();
          trackInplace();
          handleStartHeart();
        });
        window.Spicetify.Player.addEventListener("onplaypause", () => {
          handleAlbumRotation();
        });
      }
    }
    main2();
  }

  // src/app.tsx
  async function main() {
    setupGlobalEventHandlers();
  }
  var app_default = main;

  // ../../../../Local/Temp/spicetify-creator/index.jsx
  (async () => {
    await app_default();
  })();
})();

      })();