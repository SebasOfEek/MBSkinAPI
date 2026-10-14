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

            if (!response || typeof response.ok !== 'boolean') {
                const responseError = new TypeError('Invalid HTTP response');
                responseError.kind = 'response';
                throw responseError;
            }

            if (!response.ok) {
                const httpError = new Error(`HTTP ${response.status} ${response.statusText || ''}`.trim());
                httpError.name = 'HttpError';
                httpError.kind = 'http';
                httpError.status = response.status;
                throw httpError;
            }

            const text = await response.text();

            if (typeof text !== 'string') {
                const responseError = new TypeError('Response body must be text');
                responseError.kind = 'response';
                throw responseError;
            }

            if (text.trim() === '0') {
                return [];
            }
            
            // Enhanced JSON cleaning with multiple fallback methods
            let cleanText = text;
            
            // Method 1: Remove HTML tags and PHP warnings first (most robust)
            cleanText = text
                .replace(/<[^>]*>/g, '') // Remove all HTML tags
                .replace(/Warning:[^\[\n]*/gi, '') // Remove Warning lines
                .replace(/Notice:[^\[\n]*/gi, '') // Remove Notice lines
                .replace(/Fatal error:[^\[\n]*/gi, '') // Remove Fatal error lines
                .replace(/<br\s*\/?>/gi, '') // Remove <br> tags
                .trim();
            
            // Check if cleaned text is just "0" (indicates no results)
            if (cleanText === '0') {
                console.log('SkinService: Server returned 0 after cleaning');
                return [];
            }
            
            // Method 2: Find JSON array between [ and ]
            const jsonStart = cleanText.indexOf('[');
            const jsonEnd = cleanText.lastIndexOf(']');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
                console.log('SkinService: Cleaned response using method 2');
            } else {
                // Method 3: Try to extract JSON using regex (fallback)
                const jsonMatch = cleanText.match(/\[.*?\]/s);
                if (jsonMatch) {
                    cleanText = jsonMatch[0];
                    console.log('SkinService: Cleaned response using method 3 (regex)');
                }
            }
            
            // Final validation: ensure we have valid JSON content
            if (!cleanText || cleanText.trim() === '') {
                console.warn('SkinService: No valid JSON content found after cleaning');
                const parseError = new Error('No valid JSON content found in server response');
                parseError.kind = 'parse';
                throw parseError;
            }
            
            if (!cleanText.startsWith('[') || !cleanText.endsWith(']')) {
                console.warn('SkinService: Cleaned text does not appear to be valid JSON array');
                const parseError = new Error('Server response does not contain valid JSON array');
                parseError.kind = 'parse';
                throw parseError;
            }
            
            // Log for debugging
            console.log('SkinService: Original response length:', text.length);
            console.log('SkinService: Cleaned response length:', cleanText.length);
            console.log('SkinService: Cleaned response preview:', cleanText.substring(0, 100));
            
            const data = JSON.parse(cleanText);
            
            if (!data || data === 0) {
                return [];
            }

            if (!Array.isArray(data)) {
                const validationError = new TypeError('Server response must be an array of skins');
                validationError.kind = 'validation';
                throw validationError;
            }

            const invalidSkinIndex = data.findIndex(skin => !this.isValidSkin(skin));
            if (invalidSkinIndex !== -1) {
                const validationError = new TypeError(`Invalid skin record at index ${invalidSkinIndex}`);
                validationError.kind = 'validation';
                throw validationError;
            }

            // Save to cache
            this.cache.set(cacheKey, {
                data: Array.isArray(data) ? data : [],
                timestamp: Date.now()
            });

            return Array.isArray(data) ? data : [];
        } catch (error) {
            const wrappedError = new Error('Could not load skins');
            wrappedError.kind = error.kind || (error instanceof SyntaxError ? 'parse' : 'network');
            wrappedError.cause = error;
            if (error.status !== undefined) {
                wrappedError.status = error.status;
            }
            console.error('Error fetching skins:', wrappedError);
            throw wrappedError;
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
        const encodedSkinId = skinId.split('/').map(segment => encodeURIComponent(segment)).join('/');
        return `${this.imageUrl}${encodedSkinId}.png`;
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
        if (!ctx) {
            const contextError = new Error('Canvas 2D context is unavailable');
            contextError.kind = 'render';
            throw contextError;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = this.getSkinImageUrl(skinId);

        return new Promise((resolve, reject) => {
            img.onload = () => {
                try {
                    canvas.width = 16;
                    canvas.height = 22;
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(img, 0, 0, 16, 22, 0, 0, 16, 22);

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
                } catch (error) {
                    error.kind = 'render';
                    reject(error);
                }
            };

            img.onerror = () => {
                console.error(`Error loading skin image: ${skinId}`);
                const imageError = new Error(`Could not load skin image ${skinId}`);
                imageError.name = 'ImageLoadError';
                imageError.kind = 'image';
                reject(imageError);
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
