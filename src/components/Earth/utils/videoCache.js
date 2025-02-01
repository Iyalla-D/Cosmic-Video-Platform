
export class VideoCache {
    constructor(maxSize = 25) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    async createVideoTexture(videoId, videoUrl) {
        if (this.cache.has(videoId)) {
            const entry = this.cache.get(videoId);
            entry.lastUsed = Date.now();
            return entry;
        }

        const videoElement = document.createElement('video');
        videoElement.src = videoUrl;
        videoElement.crossOrigin = "anonymous";
        videoElement.playsInline = true;
        videoElement.muted = true;
        videoElement.loop = true;
        videoElement.autoplay = false;
        videoElement.pause();

        return new Promise((resolve, reject) => {
            videoElement.oncanplay = () => {
                const texture = new THREE.VideoTexture(videoElement);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.format = THREE.RGBAFormat;

                const videoData = { 
                    texture, 
                    videoElement,
                    lastUsed: Date.now() 
                };
                
                this.add(videoId, videoData);
                resolve(videoData);
            };

            videoElement.onerror = reject;
        });
    }

    add(videoId, videoData) {
        if (this.cache.size >= this.maxSize) {
            const entries = Array.from(this.cache.entries());
            const [lruKey, lruValue] = entries.reduce((oldest, current) => 
                current[1].lastUsed < oldest[1].lastUsed ? current : oldest
            );
            
            lruValue.videoElement.pause();
            lruValue.texture.dispose();
            this.cache.delete(lruKey);
        }

        this.cache.set(videoId, videoData);
    }

    get(videoId) {
        return this.cache.get(videoId);
    }

    pauseAll() {
        this.cache.forEach(({ videoElement }) => videoElement.pause());
    }
}
