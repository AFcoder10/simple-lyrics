declare global {
  interface Window {
    Spicetify: any;
  }
}
function debug(message:string){
    Spicetify.showNotification(message);
}
export async function searchId(artists:Array<string>,title:string,album_name:string,duration:number):Promise<number | undefined> {
    const baseUrl = 'https://apis.netstart.cn/music/search';
    try{
        // Limit to 10 searchs, to avoid processing multiple unrelated songs
        let queryParams = 'keywords=' + title;

        for (const artist of artists){
            queryParams += ' ' + artist;
        }
        
        queryParams += '&limit=10';
        const url = `${baseUrl}?${queryParams.toString()}`;
        //Spicetify.showNotification(url);
        const response = await fetch(url);
        const data = await response.json();
        let songId:number = 0;
        if (response.ok){
            for (const song of data.result.songs) {
                if (song.name != title){
                    continue
                }
                /* if (!song.name.includes(title)) {
                    continue;
                } */
            
                let count = 0;
                for (const searchedArtist of song.artists) {
                    if (artists.includes(searchedArtist.name)) count++;
                }
            
                if (Math.abs(count - song.artists.length) > 1) {
                    continue;
                }
            
                if (Math.abs(duration - song.duration) > 500) {
                    continue;
                }
            
                songId = song.id;
                break; // stop once found
            }
        }
        //debug('hi '+songId);
        if (songId == 0){
            return -1;
        }
        return songId;
    }catch(e){
        if (e instanceof Error) {
            Spicetify.showNotification(e.message, true);
        } else {
            Spicetify.showNotification(String(e), true);
        }
    }
}

export async function getNELyrics(songId:number|undefined){
    const url = `https://music.163.com/api/song/media?id=${songId}`;

    try{
        const response = await fetch(url);
        if (!response.ok){
            throw new Error("Cannot fetch the lyrics");
        }
        const text = await response.json();
        // Need process
        debug("got something")
        return text
    }catch(e){
        
    }
}