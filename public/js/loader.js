var loader = {
    loaded: true,
    loadedCount: 0,
    totalCount: 0,

    init: function(){
        var mp3Support, oggSupport;
        var audio = document.createElement("audio");

        if(audio.canPlayType){
            mp3Support = ""!==audio.canPlayType("audio/mpeg");
            oggSupport = ""!==audio.canPlayType("audio/ogg; codecs=\"vorbis\"");
        }else{
            mp3Support = false;
            oggSupport = false;
        }
        loader.soundFileExtn = oggSupport ? ".ogg" : mp3Support ? ".mp3" : undefined;
    },

    loadImage: function(url){
        this.loaded = false;
        this.totalCount++;
        
        game.showScreen("loadingscreen");

        Image.addEventListener("load",loader.itemLoaded, false);
        Image.src = url;

        return Image;
    },

    soundFileExtn: ".ogg",

    loadSound: function(url){
        this.loaded = false;
        this.totalCount++;

        game.showScreen("loadingscreen");
        var audio = new Audio();

        audio.addEventListener("canplaythrough",loader.itemLoaded,false);
        audio.src = url + loader.soundFileExtn

        return audio;
    },

    itemLoaded: function(ev){
        ev.target.removeEventListener(ev.type, loader.itemLoaded,false);

        loader.loadedCount++;
    
        document.getElementById("loadingmessage").innerHTML ="Loaded " + loader.loadedCount + " of " + loader.totalCount;
        
        if(loader.loadedCount === loader.totalCount){
            loader.loaded = true;
            loader.loadedCount = 0;
            loader.totalCount = 0;

            game.hideScreen("loadingscreen");

            
            if (loader.onload){
                loader.onload();
                loader.onload = undefined
            }
        }
    }
}