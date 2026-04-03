/*
 * SkinService - Service for handling Mine Blocks skin operations
 * @author SebasOfEek
 * @version 2.0.0
 */

class SkinService {
    constructor(options = {}) {
        this.apiUrl = options.apiUrl || 'https://mineblocks.com/1/scripts/returnSkins.php';
        this.imageUrl = options.imageUrl || 'https://mineblocks.com/1/skins/images/';
        this.cache = new Map();
        this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
    }

    /**
     * Gets skins from server
     * @param {Object} params - Search parameters
     * @param {string} params.type - Search type ('search' or 'new')
     * @param {number} params.page - Page number
     * @param {string} params.key - Search term (optional)
     * @returns {Promise<Array>} - Array of skins
     */
    async fetchSkins(params = {}) {
        const cacheKey = this.generateCacheKey(params);
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        const formData = new FormData();
        formData.append('type', params.type || 'new');
        formData.append('page', params.page || 1);
        if (params.key) formData.append('key', params.key);

        try {
            const response = await fetch(this.apiUrl, { method: 'POST', body: formData });
            const data = await response.json();
            
            if (!data || data === 0) {
                return [];
            }

            // Save to cache
            this.cache.set(cacheKey, {
                data: Array.isArray(data) ? data : [],
                timestamp: Date.now()
            });

            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching skins:', error);
            throw new Error('Could not load skins');
        }
    }

    /**
     * Searches skins by term
     * @param {string} query - Search term
     * @param {string} filter - Filter ('all', 'name', 'author')
     * @param {number} page - Page
     * @returns {Promise<Array>} - Array of filtered skins
     */
    async searchSkins(query, filter = 'all', page = 1) {
        const skins = await this.fetchSkins({
            type: 'search',
            key: query,
            page: page
        });

        if (filter === 'all' || !query) {
            return skins;
        }

        return skins.filter(skin => {
            const searchTerm = query.toLowerCase();
            if (filter === 'author') {
                return skin.author.toLowerCase().includes(searchTerm);
            } else if (filter === 'name') {
                return skin.name.toLowerCase().includes(searchTerm);
            }
            return false;
        });
    }

    /**
     * Gets new skins (latest)
     * @param {number} page - Page
     * @returns {Promise<Array>} - Array of new skins
     */
    async getNewSkins(page = 1) {
        return this.fetchSkins({ type: 'new', page });
    }

    /**
     * Filters skins locally
     * @param {Array} skins - Array of skins
     * @param {string} query - Search term
     * @param {string} filter - Filter type
     * @returns {Array} - Filtered array
     */
    filterSkins(skins, query, filter = 'all') {
        if (!query || filter === 'all') {
            return skins;
        }

        const searchTerm = query.toLowerCase();
        return skins.filter(skin => {
            if (filter === 'author') {
                return skin.author.toLowerCase().includes(searchTerm);
            } else if (filter === 'name') {
                return skin.name.toLowerCase().includes(searchTerm);
            }
            return skin.name.toLowerCase().includes(searchTerm) || 
                   skin.author.toLowerCase().includes(searchTerm);
        });
    }

    /**
     * Gets skin image URL
     * @param {string} skinId - Skin ID
     * @returns {string} - Image URL
     */
    getSkinImageUrl(skinId) {
        return `${this.imageUrl}${skinId}.png`;
    }

    /**
     * Draws a skin on canvas
     * @param {string} skinId - Skin ID
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {Promise<void>}
     */
    async drawSkin(skinId, canvas) {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = this.getSkinImageUrl(skinId);

        return new Promise((resolve, reject) => {
            img.onload = () => {
                canvas.width = 16;
                canvas.height = 22;
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, 0, 0, 16, 22, 0, 0, 16, 22);
                
                // Make background color transparent
                const imgData = ctx.getImageData(0, 0, 16, 22);
                const px = imgData.data;
                const r = px[0], g = px[1], b = px[2];
                
                for (let i = 0; i < px.length; i += 4) {
                    if (px[i] === r && px[i+1] === g && px[i+2] === b) {
                        px[i+3] = 0;
                    }
                }
                
                ctx.putImageData(imgData, 0, 0);
                resolve();
            };

            img.onerror = () => {
                console.error(`Error loading skin image: ${skinId}`);
                reject(new Error(`Could not load skin image ${skinId}`));
            };
        });
    }

    /**
     * Generates a unique cache key
     * @param {Object} params - Request parameters
     * @returns {string} - Cache key
     */
    generateCacheKey(params) {
        return `${params.type || 'new'}_${params.page || 1}_${params.key || ''}`;
    }

    /**
     * Clears the cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Removes expired cache entries
     */
    cleanExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp >= this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Gets skin statistics
     * @param {Object} skin - Skin object
     * @returns {Object} - Statistics
     */
    getSkinStats(skin) {
        return {
            id: skin.id,
            name: skin.name,
            author: skin.author,
            nameLength: skin.name.length,
            authorLength: skin.author.length,
            imageUrl: this.getSkinImageUrl(skin.id)
        };
    }

    /**
     * Validates a skin object
     * @param {Object} skin - Object to validate
     * @returns {boolean} - True if valid
     */
    isValidSkin(skin) {
        return skin && 
               typeof skin.id === 'string' && 
               typeof skin.name === 'string' && 
               typeof skin.author === 'string' &&
               skin.id.length > 0 &&
               skin.name.length > 0 &&
               skin.author.length > 0;
    }

    /**
     * Searches for similar skins by author
     * @param {string} author - Author name
     * @param {number} limit - Result limit
     * @returns {Promise<Array>} - Array of author's skins
     */
    async getSkinsByAuthor(author, limit = 50) {
        const skins = await this.searchSkins(author, 'author');
        return skins.slice(0, limit);
    }

    /**
     * Exports a skin to JSON format
     * @param {Object} skin - Skin object
     * @returns {string} - JSON string
     */
    exportSkin(skin) {
        return JSON.stringify(this.getSkinStats(skin), null, 2);
    }
}

// Export for modules and global compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkinService;
} else {
    window.SkinService = SkinService;
}
