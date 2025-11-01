import { getActiveLyricRequestUri, preferredLanguage, setPreferredLanguage, setTranslatedLyrics, translationEnabled } from '../state/lyricsState';
import { insertTranslations } from './lyricsFetcher';
declare global {
  interface Window {
    Spicetify: any;
  }
}

/*
    1. Translate the pharase requesting api
    2. Divide the lyrics into batches of 1000 words
        2.1 We should divide before truncating, avoiding non-meaningful translation (exam/ple)
        2.2 Better again if we limit to phrase (this is a pharase [993], this is second phrase).
            This way the translator could have more sense of entire phrase
    3. We don't pass the timestamp, since it will be useless and waste of words
        3.1 For each [End of Line] we represent it with '@@'
            Then process all of them assigning them to each lyrics line
        3.2 Adding [EOL] will lead translator to pice togheter some phrase, instead wrap the
            entire line in a <l></l>, to let it understand
*/

type Language = {
    from: string,
    to : string
}

type Translation = {
    text:string,
    userLang:string,
    translation:string,
    language: Language
}

type TranslatedLyrics = {
  time: number;
  line: string;
};

/* function stringLanguageToAbb(language:string){
    switch (language){
        case 'English':
            return 'en';
        case 'Spanish':
            return 'es';
        case 'French':
            return 'fr';
        case 'German':
            return 'de'
        case 'Japanese':
            return 'jp';
        case 'Korean':
            return 'ko'
        case 'Chinese':
            return 'zh-Hans'
        default:
            return 'en'
    }
} */

async function translate(query:string){
    // Just a temporary self-hosted translation site...
    // Probably will be closed or use llm api to translate...
    const baseUrl = 'https://k-sepia-six.vercel.app/api/translate';
    try{
        if (preferredLanguage == 'zh'){
            setPreferredLanguage('zh-Hans');
        }
        let queryParams = 'q=' + query + '&to=' + preferredLanguage;
        const url = `${baseUrl}?${queryParams.toString()}`;
        //Spicetify.showNotification(url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }
        const data:Translation = await response.json();
        //Spicetify.showNotification(data.translation);
        return data;
    }catch(error){
        const errorMessage = (error instanceof Error)
            ? error.message 
            : String(error);
        Spicetify.showNotification(`Translation failed: ${errorMessage}`, true);
    }
} 

function stickTranslationLyrics(lyrics: { time: number; line: string }[], outputQuery:string){
    // This should be the same size of lyrics
    const parts = outputQuery.split("</l>"); 

    let translatedLyrics:TranslatedLyrics[] = [];

    const filteredParts = parts.filter(p => p.includes('<l>'));

    for (const part of filteredParts) {
        const cleanLine = part.replace('<l>', '').trim();
        translatedLyrics.push({ time: 0, line: cleanLine }); // We'll add the time back next
    }

    for (let i = 0; i < Math.min(lyrics.length, translatedLyrics.length); i++) {
        translatedLyrics[i].time = lyrics[i].time;
    }
    return translatedLyrics;
}

export async function processFullLyrics(lyrics: { time: number; line: string }[],requestUri: string){
    if (requestUri !== getActiveLyricRequestUri()) {
        return;
    }
    //Spicetify.showNotification("translating")
    let length_count = 0;
    let outputQuery = "";
    let batchQuery = "";
    for (let i = 0; i < lyrics.length; i++){
        const lineAsHtml = `<l>${lyrics[i].line}</l>`;
        if (lineAsHtml.length + length_count < 800){
            // If we still can fit this lyrics line
            batchQuery += lineAsHtml
            length_count += lineAsHtml.length;
        }else{
            const data = await translate(batchQuery);
            if (requestUri !== getActiveLyricRequestUri()) {
                //Spicetify.showNotification('Stale translation request (mid-batch). Aborting.');
                return;
            }
            if (data == null){
                Spicetify.showNotification("null data");
            } else {
                outputQuery += data.translation;
            }
            // Reset the batch
            batchQuery = lineAsHtml;
            length_count = lineAsHtml.length;
        }
    }
    if (batchQuery != null){
        const data = await translate(batchQuery);
        if (requestUri !== getActiveLyricRequestUri()) {
            //Spicetify.showNotification('Stale translation request (final-batch). Aborting.');
            return;
        }
        if (data == null){
            Spicetify.showNotification("null data");
        } else {
            outputQuery += data.translation;
        }
    }
    const translatedLyrics = stickTranslationLyrics(lyrics,outputQuery);
    if (translatedLyrics == null){
        return;
    }
    if (requestUri !== getActiveLyricRequestUri()) {
        //Spicetify.showNotification('Stale translation request (pre-update). Aborting.');
        return;
    }
    setTranslatedLyrics(translatedLyrics);
    if (translationEnabled) {
        insertTranslations(translatedLyrics);
    }
}
