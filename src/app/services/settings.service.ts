import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // Changeable settings
  settings = {
    language: 'english',
    difficulty: 0,
    onlineMode: false,
    initialized:true,
    dictionary:'default'
  }

  // Set based on settings
  lang: any = {};
  wordList: string[] = [];
  alphabet: string[] = [];
  group:'';

  // Constants
  readonly max_guesses = 9;

  private _storage: Storage | null = null;

  // Supported languages
  readonly languages:string[] = ['english', 'vietnamese'];

  initialized = false;
  constructor(public http: HttpClient, private storage: Storage) {
    
   }

  async initDB() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
    
  }
  // Initialises settings, returns a promise
  init(){
    
    return this.storage.get('settings').then((settings) => {
      if(settings !== null){
        settings.difficulty = parseInt(settings.difficulty);
        this.settings = settings;
        
      }
    })
    .then(() => {
      return this.getFiles();
    })    
  }
  // Gets language file which contains all text inside the app, returns a promise.
  getLanguageFile(){
    
    return this.http.get('assets/languages/' + this.settings.language + '.json').toPromise().then((data) =>{
      this.lang = data;
    })
    

  }

  // Gets dictionary file which contains a list of words, returns a promise.
  getDictionaryFile(){
    
    return this.http.get('assets/dictionaries/'+this.settings.dictionary+'.json').toPromise().then((data) =>{
      
      let dictData = data;
      for (var i in dictData) {
        if (dictData.hasOwnProperty(i)) {
          if (i=='alphabet')
          {
          this.alphabet = data[i];
          }
          if (i=='groups')
          {
          this.wordList = data[i];
          }
      }
      }
    })
}

  // Gets language and dictionary files, returns a promise
  getFiles(){
    return Promise.all([
      this.getLanguageFile(),
      this.getDictionaryFile()
    ])
  }

  // Updates language setting
  updateLanguage(lang: string): Promise<any>{
    this.settings.language = lang;
    return this.storage.set('settings', this.settings).then(() => {
      this.initialized = true;
      return this.getLanguageFile();
    });
  }

  // Updates dictionary setting
  updateState(){
    this.settings.initialized=true;
    this.storage.set('settings',this.settings)
  }

  // Updates difficulty setting
  updateDifficulty(difficulty: number){
    this.settings.difficulty = difficulty;
    this.storage.set('settings', this.settings);
  }

  // Updates onlineMode setting
  updateOnlineMode(online: boolean){
    this.settings.onlineMode = online;
    this.storage.set('settings', this.settings);
  }
  updateDictionaryFile(lang:string){
    this.settings.dictionary = lang;
    return this.storage.set('settings', this.settings).then(() => {
      this.initialized = true;
      return this.getDictionaryFile();
    });
  }
}
