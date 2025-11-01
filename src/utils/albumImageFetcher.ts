import { rotationDeg, setRotationDegree } from "../state/lyricsState";

declare global {
  interface Window {
    Spicetify: any;
  }
}

export function getAlbumImageUrl(): string | null {
  if (window.Spicetify?.Player?.data?.item?.album?.images?.length > 0) {
    return window.Spicetify.Player.data.item.album.images[0].url;
  }
  return null;
}

export function updateAlbumImage() {
  const albumImage = document.getElementById('lyrics-album-image') as HTMLImageElement;
  const imageUrl = getAlbumImageUrl();
  if (albumImage && imageUrl) {
    albumImage.src = imageUrl;
  }
  /* if (imageUrl && albumImage.src !== imageUrl) {
    setRotationDegree(0);
  }
  albumImage.style.transform = `rotate(${rotationDeg})`; */
}

export const getNextTrackImageUrl = (): string | null => {
  const nextTracks = Spicetify.Queue.nextTracks;
  if (nextTracks && nextTracks.length > 0) {
      const nextTrackWrapper = nextTracks[0];
      const actualTrackData = nextTrackWrapper.contextTrack;
      return actualTrackData?.metadata.image_url || null;
  }
  return null;
};

export const getPrevTrackImageUrl = (): string | null => {
  const prevTracks = Spicetify.Queue.prevTracks;
  if (prevTracks && prevTracks.length > 0) {
      const prevTrackWrapper = prevTracks[prevTracks.length - 1];
      const actualTrackData = prevTrackWrapper.contextTrack;
      return actualTrackData.metadata?.image_url || null;
  }
  return null;
};