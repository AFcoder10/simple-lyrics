// Store references to avoid UI corruption
export type OriginalPageState = {
  children: Element[];
  parent: Element;
  topBar: Element | null;
  originalTopBarDisplay: string;
} | null;

export let originalPageState: OriginalPageState = null;
export let lyricsPageActive = false;
export let isDragging = false;
export let startX: number;
export let startY: number;
export let memorizedSelectedText: string | null = null;
export let currentLyrics: { time: number; line: string }[] = [];
export let highlightInterval: number | null = null;
export let currentHighlightedLine: string | null = null;
export let isAlbumRotating = false;
export let rotationDeg: number;
export let scrolledAndStopped = false;
export let isIdle = true;
export let isPlainText = false;
export let preferredLanguage: string = 'any';
export let translatedLyrics: { time: number; line: string }[] = [];
export let translationEnabled: boolean = true;
export let firstTimeLoadTranslation: boolean = true;
export let activeLyricRequestUri: string | null = null;
export let isCodeScrolling = 3;
export let isThisSongLiked = Spicetify.Player.getHeart();

export const USER_SCROLL_PAUSE_MS = 3000;
export const PROGRAMMATIC_SCROLL_GRACE_MS = 500;

export let lastUserScrollAt = 0;
export let lastProgrammaticScrollAt = 0;
export let ignoreProgrammaticScroll = false;

export let continousCheckPlaying = false;

export function setContinousCheckPlaying(status:boolean){
  continousCheckPlaying = status;
}

export function setIsThisSongLiked(status:boolean){
  isThisSongLiked = status;
}

export function markProgrammaticScroll(graceMs = PROGRAMMATIC_SCROLL_GRACE_MS) {
  lastProgrammaticScrollAt = Date.now();
  ignoreProgrammaticScroll = true;
  setTimeout(() => {
    ignoreProgrammaticScroll = false;
  }, graceMs);
}

export function setLastUserScrollAt(data:number){
  lastUserScrollAt = data;
}

export function setIsCodeScrolling(active:number){
  isCodeScrolling = active;
}

export const getActiveLyricRequestUri = () => activeLyricRequestUri;
export const setActiveLyricRequestUri = (uri: string | null) => {
  activeLyricRequestUri = uri;
};

export function setTfirstTimeLoadTranslation(enabled: boolean) {
  firstTimeLoadTranslation = enabled;
}

export function setTranslationEnabled(enabled: boolean) {
  translationEnabled = enabled;
}

export function setTranslatedLyrics(lyrics: { time: number; line: string }[]){
  translatedLyrics = lyrics;
}

export function setPreferredLanguage(lang: string) {
  preferredLanguage = lang;
}

export function setIsPlainText(active:boolean){
  isPlainText = active;
}

export function setIdle(active: boolean){
  isIdle = active;
}

export function setScrolledAndStopped(state: boolean){
  scrolledAndStopped = state;
}

export function setOriginalPageState(state: OriginalPageState) {
  originalPageState = state;
}

export function setAlbumRotating(active: boolean){
  isAlbumRotating = active;
}

export function setRotationDegree(degree:number){
  rotationDeg = degree;
}

export function setLyricsPageActive(active: boolean) {
  lyricsPageActive = active;
}

export function setIsDragging(dragging: boolean) {
  isDragging = dragging;
}

export function setStartX(x: number) {
  startX = x;
}

export function setStartY(y: number) {
  startY = y;
}

export function setMemorizedSelectedText(text: string | null) {
  memorizedSelectedText = text;
}

export function setCurrentLyrics(lyrics: { time: number; line: string }[]) {
  currentLyrics = lyrics;
}

export function setHighlightInterval(interval: number | null) {
  highlightInterval = interval;
}

export function setCurrentHighlightedLine(lineId: string | null) {
  currentHighlightedLine = lineId;
}
