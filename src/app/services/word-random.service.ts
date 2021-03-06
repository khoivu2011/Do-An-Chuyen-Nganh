import { Injectable } from '@angular/core';

import { SettingsService } from './settings.service'
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WordRandomService {
  words: string[] = [];
  
  errorCount: number = 0;


  constructor(private http: HttpClient, private settings: SettingsService) { }
  getWords(){
    let difficulty = this.settings.settings.difficulty, 
        minCorpusCount = 130000, 
        maxCorpusCount = -1;

    // Corpus count determines how common words are
    if(difficulty == 1){
      minCorpusCount = 50000;
      maxCorpusCount = 130000
    }else if(difficulty == 2){
      minCorpusCount = 28000;
      maxCorpusCount = 50000;
    }

    let url = 'https://randomuser.me/api/?results=15' ;

    return this.http.get(url).toPromise().then((response) => {
      let newWords = this.settings.wordList;
      // Randomize words (default: alphabetical)
     let len = newWords.length;
     while(len){
       len--;
       let i = Math.floor(Math.random() * len);
       let word2 = newWords[i];
       newWords[i] = newWords[len];
       newWords[len] = word2;
     }
      this.words = newWords;
      
    });
  }

  // Returns a promise of a random word.
  // If word list has words, word is taken from there.
  // If word list is empty or becomes empty with this method, new words are fetched immediately
  // If fetching new words fails, or language isn't english, a word is taken from local word list (dictionary)
  // This method should always fulfill the promise - errors shouldn't be possible
  getWord(): Promise<string>{
    let promise = new Promise<string>((resolve, reject) => {
      let resolved = false;
      // If language is non-english, online mode is off or connection has failed too many times, get word from local word list
      if( !this.settings.settings.onlineMode || this.errorCount >= 2){
        this.settings.getDictionaryFile();    
        resolve(this.getWordFromList());
        return
      }
      // Enough words in the word list, word can be popped directly from there
      if(this.words.length >= 1){
        resolve(this.words.pop());
        resolved = true;
      }
      // If list is empty, get more words (is often done before next word is even needed)
      if(this.words.length == 0){
        this.getWords().then(() => {
          if(!resolved){
            resolve(this.words.pop().toUpperCase())
          }
        })
        .catch(() => {  
          if(!resolved){
            resolve(this.getWordFromList());
            
            this.errorCount++;
          }
        });
      }
    });
    return promise;
  }
  getWordFromList(){
    
    return this.settings.wordList[Math.floor(Math.random()*this.settings.wordList.length)];
  }
  

}