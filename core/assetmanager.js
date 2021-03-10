class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
    };

    queueDownload(path) {
        console.log("Queueing " + path);
        this.downloadQueue.push(path);
    };

    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    };

    downloadAll(callback) {
        if (this.downloadQueue.length === 0) setTimeout(callback, 10);
        for (var i = 0; i < this.downloadQueue.length; i++) {
            var that = this;

            var path = this.downloadQueue[i];
            console.log(path);
            var ext = path.substring(path.length - 3);

            switch (ext) {
                case 'jpg':
                case 'png':
                    var img = new Image();
                    img.addEventListener("load", function () {
                        console.log("Loaded " + this.src);
                        that.successCount++;
                        if (that.isDone()) callback();
                    });

                    img.addEventListener("error", function () {
                        console.log("Error loading " + this.src);
                        that.errorCount++;
                        if (that.isDone()) callback();
                    });

                    img.src = path;
                    this.cache[path] = img;
                    break;
                case 'ogg':
                case 'wav':
                case 'mp3':
                case 'mp4':
                    var aud = new Audio();
                    aud.addEventListener("loadeddata", function () {
                        console.log("Loaded " + this.src);
                        that.successCount++;
                        if (that.isDone()) callback();
                    });

                    aud.addEventListener("error", function () {
                        console.log("Error loading " + this.src);
                        that.errorCount++;
                        if (that.isDone()) callback();
                    });

                    aud.addEventListener("ended", function () {
                        aud.pause();
                        aud.currentTime = 0;
                    });

                    aud.src = path;
                    aud.load();

                    this.cache[path] = aud;
                    break;
            }
        }
    };

    getAsset(path) {
        return this.cache[path];
    };

    /**
     * 
     * @param {*} path 
     * @param {*} offset amplify multiplier
     */
    playAsset(path, offset) {
        let audio = this.cache[path];
        audio.offset = offset;
        if (audio.offset) {
            audio.volume *= offset;
            if (audio.volume > 1) audio.volume = 1;
            else if (audio.volume < 0) audio.volume = 0;
        }
        audio.currentTime = 0;
        audio.play();
    };

    muteAudio(mute) {
        for (var key in this.cache) {
            let asset = this.cache[key];
            if (asset instanceof Audio) {
                asset.muted = mute;
            }
        }
    };

    adjustBackgroundVolume(volume) {
        for (var key in this.cache) {
            let asset = this.cache[key];
            if (asset instanceof Audio && key.includes("./sounds/music/")) {
                asset.volume = volume;
                if (asset.offset) {
                    asset.volume *= asset.offset;
                    if (asset.volume > 1) asset.volume = 1;
                    else if (asset.volume < 0) asset.volume = 0;
                }
            }
        }
    };

    adjustEffectsVolume(volume) {
        for (var key in this.cache) {
            let asset = this.cache[key];
            if (asset instanceof Audio && key.includes("./sounds/sfx/")) {
                asset.volume = volume;
                if (asset.offset) {
                    asset.volume *= asset.offset;
                    if (asset.volume > 1) asset.volume = 1;
                    else if (asset.volume < 0) asset.volume = 0;
                }
            }
        }
    };

    pauseBackgroundMusic() {
        for (var key in this.cache) {
            let asset = this.cache[key];
            if (asset instanceof Audio && key.includes("./sounds/music/")) {
                asset.pause();
                asset.currentTime = 0;
            }
        }
    };

    autoRepeat(path) {
        var aud = this.cache[path];
        aud.addEventListener("ended", function () {
            aud.play();
        });
    };
};

