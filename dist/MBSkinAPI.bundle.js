/*
 * MBSkinAPI - Main module for exploring Mine Blocks skins
 * @author SebasOfEek
 * @version 2.0.0
 */

// Import dependencies (for modular development)
// import SkinService from '../services/SkinService.js';
// import SkinExplorerUI from '../ui/SkinExplorerUI.js';

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

class SkinExplorerUI {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.skinService = options.skinService;
        this.onSkinSelect = options.onSkinSelect || (() => {});
        this.theme = options.theme || 'dark';
        this.customStyles = options.customStyles || {};
        
        this.state = {
            skins: [],
            filteredSkins: [],
            isLoading: false,
            hasMore: true,
            currentPage: 1,
            query: '',
            filter: 'all',
            selectedSkin: null
        };

        this.init();
    }

    init() {
        this.loadStyles();
        this.createUI();
        this.bindEvents();
    }

    loadStyles() {
        if (document.getElementById('mb-ui-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'mb-ui-styles';
        style.textContent = this.getStyles();
        document.head.appendChild(style);
    }

    getStyles() {
        const baseStyles = `
            :root { 
                --mb-accent: #4caf50; 
                --mb-bg: #121212; 
                --mb-card: #1e1e1e; 
                --mb-border: #333;
                --mb-text: #ffffff;
                --mb-text-secondary: #888;
                --mb-hover: #2d2d2d;
                --mb-shadow: 0 4px 20px rgba(0,0,0,0.3);
                --mb-border-radius: 12px;
                --mb-transition: all 0.3s ease;
            }

            .mb-explorer {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: var(--mb-bg);
                color: var(--mb-text);
                border-radius: var(--mb-border-radius);
                overflow: hidden;
                box-shadow: var(--mb-shadow);
                border: 1px solid var(--mb-border);
            }

            .mb-header {
                background: var(--mb-card);
                padding: 20px;
                border-bottom: 1px solid var(--mb-border);
            }

            .mb-title {
                margin: 0 0 15px 0;
                font-size: 24px;
                color: var(--mb-text);
                font-weight: 600;
            }

            .mb-controls {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                align-items: center;
            }

            .mb-search-input {
                flex: 1;
                min-width: 200px;
                padding: 10px 15px;
                background: #111;
                border: 1px solid var(--mb-border);
                color: var(--mb-text);
                border-radius: 8px;
                outline: none;
                font-size: 14px;
                transition: var(--mb-transition);
            }

            .mb-search-input:focus {
                border-color: var(--mb-accent);
                box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
            }

            .mb-filter-select {
                padding: 10px 15px;
                background: #111;
                border: 1px solid var(--mb-border);
                color: var(--mb-text);
                border-radius: 8px;
                cursor: pointer;
                outline: none;
                font-size: 14px;
                transition: var(--mb-transition);
            }

            .mb-btn {
                padding: 10px 20px;
                background: var(--mb-accent);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 14px;
                transition: var(--mb-transition);
                white-space: nowrap;
            }

            .mb-btn:hover {
                background: #45a049;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            }

            .mb-content {
                height: 500px;
                overflow-y: auto;
                padding: 20px;
            }

            .mb-skin-card {
                background: var(--mb-card);
                border: 1px solid var(--mb-border);
                border-radius: 10px;
                padding: 12px;
                text-align: center;
                cursor: pointer;
                transition: var(--mb-transition);
                height: 180px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
            }

            .mb-skin-card:hover {
                border-color: var(--mb-accent);
                background: var(--mb-hover);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            }

            .mb-skin-card.selected {
                border-color: var(--mb-accent);
                background: rgba(76, 175, 80, 0.1);
            }

            .mb-skin-canvas {
                image-rendering: pixelated;
                transform: scale(2);
                margin-bottom: 10px;
                pointer-events: none;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            }

            .mb-skin-name {
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 100%;
            }

            .mb-skin-author {
                font-size: 10px;
                color: var(--mb-text-secondary);
            }

            .mb-loading {
                text-align: center;
                padding: 40px;
                color: var(--mb-text-secondary);
            }

            .mb-error {
                text-align: center;
                padding: 40px;
                color: #f44336;
            }

            .mb-empty {
                text-align: center;
                padding: 40px;
                color: var(--mb-text-secondary);
            }

            .mb-footer {
                background: var(--mb-card);
                padding: 15px 20px;
                border-top: 1px solid var(--mb-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .mb-status {
                font-size: 14px;
                color: var(--mb-text-secondary);
            }

            .mb-pagination {
                display: flex;
                gap: 10px;
            }

            .mb-spinner {
                border: 3px solid var(--mb-border);
                border-top: 3px solid var(--mb-accent);
                border-radius: 50%;
                width: 20px;
                height: 20px;
                animation: mb-spin 1s linear infinite;
                display: inline-block;
                margin-right: 10px;
                vertical-align: middle;
            }

            .mb-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 20px;
            }

            .mb-toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--mb-accent);
                color: white;
                padding: 12px 25px;
                border-radius: 30px;
                display: none;
                z-index: 10000;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                font-weight: 500;
                animation: mb-slideUp 0.3s ease;
            }

            .mb-toast.show {
                display: block;
            }

            @keyframes mb-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes mb-slideUp {
                from { 
                    opacity: 0;
                    transform: translate(-50%, 20px);
                }
                to { 
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }

            @media (max-width: 768px) {
                .mb-controls {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .mb-search-input {
                    min-width: auto;
                }
            }
        `;

        // Apply custom styles
        let customCSS = '';
        for (const [property, value] of Object.entries(this.customStyles)) {
            customCSS += `${property} { ${value} }\n`;
        }

        return baseStyles + customCSS;
    }

    createUI() {
        const explorer = document.createElement('div');
        explorer.className = 'mb-explorer';
        explorer.innerHTML = `
            <div class="mb-header">
                <h2 class="mb-title">Skin Explorer</h2>
                <div class="mb-controls">
                    <input type="text" class="mb-search-input" placeholder="Search skins...">
                    <select class="mb-filter-select">
                        <option value="all">All</option>
                        <option value="name">Name</option>
                        <option value="author">Author</option>
                    </select>
                    <button class="mb-btn" id="mb-search-btn">Search</button>
                    <button class="mb-btn" id="mb-reset-btn">Clear</button>
                </div>
            </div>
            <div class="mb-content">
                <div class="mb-grid" id="mb-skins-grid"></div>
                <div class="mb-loading" id="mb-loading" style="display: none;">
                    <div class="mb-spinner"></div>
                    Loading skins...
                </div>
                <div class="mb-error" id="mb-error" style="display: none;">
                    Error loading skins. Please try again.
                </div>
                <div class="mb-empty" id="mb-empty" style="display: none;">
                    No skins found.
                </div>
            </div>
            <div class="mb-footer">
                <div class="mb-status" id="mb-status">Ready</div>
                <div class="mb-pagination">
                    <button class="mb-btn" id="mb-load-more" style="display: none;">Load more</button>
                </div>
            </div>
        `;

        this.container.appendChild(explorer);
        
        // References to elements
        this.explorer = explorer;
        this.grid = document.getElementById('mb-skins-grid');
        this.loading = document.getElementById('mb-loading');
        this.error = document.getElementById('mb-error');
        this.empty = document.getElementById('mb-empty');
        this.status = document.getElementById('mb-status');
        this.loadMoreBtn = document.getElementById('mb-load-more');
        this.searchInput = explorer.querySelector('.mb-search-input');
        this.filterSelect = explorer.querySelector('.mb-filter-select');
    }

    bindEvents() {
        const searchBtn = document.getElementById('mb-search-btn');
        const resetBtn = document.getElementById('mb-reset-btn');

        searchBtn.addEventListener('click', () => this.performSearch());
        resetBtn.addEventListener('click', () => this.reset());

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        this.filterSelect.addEventListener('change', () => {
            if (this.state.query) this.performSearch();
        });

        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this.loadMore());
        }

        this.grid.addEventListener('scroll', () => {
            if (this.grid.scrollTop + this.grid.clientHeight >= this.grid.scrollHeight - 100) {
                this.loadMore();
            }
        });
    }

    async performSearch() {
        if (!this.skinService) {
            this.showError('SkinService not configured');
            return;
        }

        this.state.currentPage = 1;
        this.state.skins = [];
        this.showLoading(true);

        try {
            const skins = this.state.query 
                ? await this.skinService.searchSkins(this.state.query, this.state.filter, 1)
                : await this.skinService.getNewSkins(1);

            this.state.skins = skins;
            this.state.hasMore = skins.length > 0;
            this.renderSkins();
            this.updateStatus(`Found ${skins.length} skins`);
        } catch (error) {
            this.showError('Error searching skins');
            console.error(error);
        } finally {
            this.showLoading(false);
        }
    }

    async loadMore() {
        if (!this.state.hasMore || this.state.isLoading || !this.skinService) return;

        this.state.currentPage++;
        this.showLoading(true);

        try {
            const skins = this.state.query 
                ? await this.skinService.searchSkins(this.state.query, this.state.filter, this.state.currentPage)
                : await this.skinService.getNewSkins(this.state.currentPage);

            if (skins.length === 0) {
                this.state.hasMore = false;
            } else {
                this.state.skins.push(...skins);
                this.renderSkins(true);
            }
        } catch (error) {
            this.showError('Error loading more skins');
            console.error(error);
        } finally {
            this.showLoading(false);
        }
    }

    renderSkins(append = false) {
        if (!append) {
            this.grid.innerHTML = '';
        }

        this.state.skins.forEach(skin => {
            const card = this.createSkinCard(skin);
            this.grid.appendChild(card);
        });

        if (this.state.hasMore) {
            this.loadMoreBtn.style.display = 'block';
        } else {
            this.loadMoreBtn.style.display = 'none';
        }

        if (this.state.skins.length === 0) {
            this.showEmpty(true);
        } else {
            this.showEmpty(false);
        }
    }

    createSkinCard(skin) {
        const card = document.createElement('div');
        card.className = 'mb-skin-card';
        card.dataset.skinId = skin.id;

        const canvas = document.createElement('canvas');
        canvas.className = 'mb-skin-canvas';
        
        const name = document.createElement('div');
        name.className = 'mb-skin-name';
        name.textContent = skin.name;
        
        const author = document.createElement('div');
        author.className = 'mb-skin-author';
        author.textContent = skin.author;

        card.appendChild(canvas);
        card.appendChild(name);
        card.appendChild(author);

        card.addEventListener('click', () => {
            this.selectSkin(skin);
        });

        // Draw skin
        if (this.skinService) {
            this.skinService.drawSkin(skin.id, canvas).catch(error => {
                console.error(`Error drawing skin ${skin.id}:`, error);
            });
        }

        return card;
    }

    selectSkin(skin) {
        // Remove previous selection
        this.grid.querySelectorAll('.mb-skin-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add new selection
        const selectedCard = this.grid.querySelector(`[data-skin-id="${skin.id}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        this.state.selectedSkin = skin.id;
        this.onSkinSelect(skin);
        this.showToast(`Skin selected: ${skin.name}`);
    }

    showLoading(show) {
        this.state.isLoading = show;
        this.loading.style.display = show ? 'block' : 'none';
        this.grid.style.display = show ? 'none' : 'grid';
    }

    showError(show) {
        this.error.style.display = show ? 'block' : 'none';
        this.grid.style.display = 'none';
        this.loading.style.display = 'none';
    }

    showEmpty(show) {
        this.empty.style.display = show ? 'block' : 'none';
    }

    updateStatus(message) {
        this.status.textContent = message;
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'mb-toast show';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }

    reset() {
        this.state.query = '';
        this.state.filter = 'all';
        this.state.currentPage = 1;
        this.state.skins = [];
        this.searchInput.value = '';
        this.filterSelect.value = 'all';
        this.performSearch();
    }

    destroy() {
        if (this.explorer && this.explorer.parentNode) {
            this.explorer.parentNode.removeChild(this.explorer);
        }
    }
}

class MBSkinAPI {
    constructor(options = {}) {
        this.apiUrl = options.apiUrl || 'https://mineblocks.com/1/scripts/returnSkins.php';
        this.imageUrl = options.imageUrl || 'https://mineblocks.com/1/skins/images/';
        this.onSkinSelect = options.onSkinSelect || this.defaultOnSkinSelect;
        this.container = options.container || document.body;
        this.autoLoad = options.autoLoad !== false;
        
        this.state = {
            page: 1,
            query: '',
            filter: 'all',
            isLoading: false,
            hasMore: true,
            totalResults: 0,
            isSmallResultSet: false
        };

        this.init();
    }

    init() {
        this.loadStyles();
        this.createModal();
        this.bindEvents();
        
        if (this.autoLoad) {
            this.showModal();
        }
    }

    loadStyles() {
        if (document.getElementById('mb-skin-api-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'mb-skin-api-styles';
        style.textContent = `
            :root { 
                --mb-accent: #4caf50; 
                --mb-bg: #121212; 
                --mb-card: #1e1e1e; 
                --mb-border: #333;
                --mb-text: #ffffff;
                --mb-text-secondary: #888;
            }
            
            .mb-modal { 
                display: none; 
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100%; 
                height: 100%; 
                background: rgba(0,0,0,0.9); 
                z-index: 9999; 
                justify-content: center; 
                align-items: center; 
                backdrop-filter: blur(4px); 
            }
            
            .mb-modal-content { 
                background: var(--mb-card); 
                width: 90%; 
                max-width: 950px; 
                height: 85vh; 
                border-radius: 15px; 
                display: flex; 
                flex-direction: column; 
                padding: 25px; 
                border: 1px solid var(--mb-accent); 
                box-sizing: border-box; 
            }
            
            .mb-modal-header { 
                display: flex; 
                gap: 10px; 
                margin-bottom: 20px; 
                flex-shrink: 0; 
                align-items: center; 
            }
            
            .mb-modal-header input { 
                flex: 1; 
                padding: 12px; 
                background: #111; 
                border: 1px solid var(--mb-border); 
                color: var(--mb-text); 
                border-radius: 8px; 
                outline: none; 
            }
            
            .mb-modal-header select { 
                padding: 11px; 
                background: #111; 
                color: var(--mb-text); 
                border: 1px solid var(--mb-border); 
                border-radius: 8px; 
                cursor: pointer; 
            }
            
            .mb-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); 
                gap: 20px; 
                overflow-y: scroll; 
                flex: 1; 
                padding: 10px; 
                align-content: start; 
            }
            
            .mb-skin-item { 
                background: #252525; 
                padding: 15px; 
                border-radius: 12px; 
                text-align: center; 
                cursor: pointer; 
                transition: 0.2s; 
                border: 1px solid transparent; 
                height: 200px; 
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                align-items: center; 
            }
            
            .mb-skin-item:hover { 
                border-color: var(--mb-accent); 
                background: #2d2d2d; 
                transform: translateY(-3px); 
            }
            
            .mb-skin-item canvas { 
                image-rendering: pixelated; 
                transform: scale(2.5); 
                margin-bottom: 15px; 
                pointer-events: none; 
            }
            
            .mb-skin-item b { 
                display: block; 
                font-size: 13px; 
                color: var(--mb-text); 
                width: 100%; 
                overflow: hidden; 
                text-overflow: ellipsis; 
                white-space: nowrap; 
            }
            
            .mb-skin-item span { 
                font-size: 11px; 
                color: var(--mb-text-secondary); 
                margin-top: 4px; 
            }
            
            .mb-close { 
                cursor: pointer; 
                font-size: 32px; 
                color: var(--mb-text-secondary); 
                margin-left: 10px; 
            }
            
            #mb-load-status { 
                text-align: center; 
                padding: 10px; 
                color: var(--mb-accent); 
                font-size: 13px; 
            }
            
            #mb-copy-toast { 
                position: fixed; 
                bottom: 20px; 
                left: 50%; 
                transform: translateX(-50%); 
                background: var(--mb-accent); 
                color: var(--mb-text); 
                padding: 12px 25px; 
                border-radius: 30px; 
                display: none; 
                z-index: 10000; 
                box-shadow: 0 5px 15px rgba(0,0,0,0.3); 
            }
        `;
        document.head.appendChild(style);
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'mb-skin-modal';
        modal.className = 'mb-modal';
        modal.innerHTML = `
            <div class="mb-modal-content">
                <div class="mb-modal-header">
                    <input type="text" id="mb-search" placeholder="Search skin...">
                    <select id="mb-filter">
                        <option value="all">All</option>
                        <option value="name">Name</option>
                        <option value="author">Author</option>
                    </select>
                    <span class="mb-close" id="mb-close">&times;</span>
                </div>
                <div id="mb-grid" class="mb-grid"></div>
                <div id="mb-load-status">Loading...</div>
            </div>
        `;
        
        const toast = document.createElement('div');
        toast.id = 'mb-copy-toast';
        toast.textContent = 'ID Copied';
        
        this.container.appendChild(modal);
        this.container.appendChild(toast);
        
        this.modal = modal;
        this.grid = document.getElementById('mb-grid');
        this.searchInput = document.getElementById('mb-search');
        this.filterSelect = document.getElementById('mb-filter');
        this.closeBtn = document.getElementById('mb-close');
        this.loadStatus = document.getElementById('mb-load-status');
        this.toast = document.getElementById('mb-copy-toast');
    }

    bindEvents() {
        this.closeBtn.onclick = () => this.hideModal();
        this.grid.onscroll = () => this.handleScroll();
        
        let searchTimer;
        this.searchInput.oninput = (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                this.state.query = e.target.value;
                this.fetchSkins(true);
            }, 500);
        };
        
        this.filterSelect.onchange = (e) => {
            this.state.filter = e.target.value;
            if (this.state.query) this.fetchSkins(true);
        };
    }

    async fetchSkins(reset = false) {
        if (this.state.isLoading || (!this.state.hasMore && !reset)) return;
        
        this.state.isLoading = true;
        this.loadStatus.textContent = "Loading...";
        
        if (reset) {
            this.state.page = 1;
            this.state.hasMore = true;
            this.state.totalResults = 0;
            this.state.isSmallResultSet = false;
            this.grid.innerHTML = '';
        }

        const formData = new FormData();
        formData.append('type', this.state.query ? 'search' : 'new');
        formData.append('page', this.state.page);
        if (this.state.query) formData.append('key', this.state.query);

        try {
            const response = await fetch(this.apiUrl, { method: 'POST', body: formData });
            const data = await response.json();

            if (!data || data === 0 || data.length === 0) {
                this.state.hasMore = false;
                this.loadStatus.textContent = "End of catalog";
            } else {
                let filteredData = data;
                if (this.state.query && this.state.filter !== 'all') {
                    filteredData = data.filter(s => 
                        this.state.filter === 'author' 
                        ? s.author.toLowerCase().includes(this.state.query.toLowerCase())
                        : s.name.toLowerCase().includes(this.state.query.toLowerCase())
                    );
                }

                if (reset && this.state.page === 1 && this.state.query) {
                    this.state.totalResults = filteredData.length;
                    this.state.isSmallResultSet = this.state.totalResults < 35;
                } else if (!this.state.query) {
                    this.state.isSmallResultSet = false;
                }

                this.renderSkins(filteredData);
                this.state.page++;
                this.loadStatus.textContent = "Scroll to load more";

                const currentCards = this.grid.querySelectorAll('.mb-skin-item').length;
                if (this.state.isSmallResultSet && this.state.hasMore) {
                    this.state.isLoading = false;
                    this.fetchSkins();
                } else if (currentCards < 8 && this.state.hasMore) {
                    this.state.isLoading = false;
                    this.fetchSkins();
                }
            }
        } catch (error) {
            console.error('Error fetching skins:', error);
            this.loadStatus.textContent = "Error loading skins";
        } finally {
            this.state.isLoading = false;
        }
    }

    renderSkins(skins) {
        skins.forEach(skin => {
            const card = document.createElement('div');
            card.className = 'mb-skin-item';
            card.innerHTML = `<canvas id="cv-${skin.id}"></canvas><b>${skin.name}</b><span>${skin.author}</span>`;
            card.onclick = () => this.selectSkin(skin);
            this.grid.appendChild(card);
            this.drawSkin(skin.id);
        });
    }

    drawSkin(id) {
        const canvas = document.getElementById(`cv-${id}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = `${this.imageUrl}${id}.png`;
        img.onload = () => {
            canvas.width = 16;
            canvas.height = 22;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, 16, 22, 0, 0, 16, 22);
            
            const imgData = ctx.getImageData(0, 0, 16, 22);
            const px = imgData.data;
            const r = px[0], g = px[1], b = px[2];
            
            for (let i = 0; i < px.length; i += 4) {
                if (px[i] === r && px[i+1] === g && px[i+2] === b) px[i+3] = 0;
            }
            
            ctx.putImageData(imgData, 0, 0);
        };
    }

    selectSkin(skin) {
        this.copyId(skin.id);
        this.onSkinSelect(skin);
    }

    async copyId(id) {
        await navigator.clipboard.writeText(id);
        this.showToast();
    }

    showToast() {
        this.toast.style.display = 'block';
        setTimeout(() => { 
            this.toast.style.display = 'none'; 
        }, 800);
    }

    handleScroll() {
        if (this.grid.scrollTop + this.grid.clientHeight >= this.grid.scrollHeight - 100) {
            this.fetchSkins();
        }
    }

    showModal() {
        this.modal.style.display = 'flex';
        if (this.grid.innerHTML === '') this.fetchSkins();
    }

    hideModal() {
        this.modal.style.display = 'none';
    }

    defaultOnSkinSelect(skin) {
        console.log('Skin selected:', skin);
        this.hideModal();
    }

    // Public methods for external control
    show() {
        this.showModal();
    }

    hide() {
        this.hideModal();
    }

    search(query) {
        this.state.query = query;
        this.searchInput.value = query;
        this.fetchSkins(true);
    }

    setFilter(filter) {
        this.state.filter = filter;
        this.filterSelect.value = filter;
        if (this.state.query) this.fetchSkins(true);
    }

    reset() {
        this.state.query = '';
        this.searchInput.value = '';
        this.fetchSkins(true);
    }
}

// Export for modules and global compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MBSkinAPI;
} else {
    window.MBSkinAPI = MBSkinAPI;
    window.SkinService = SkinService;
    window.SkinExplorerUI = SkinExplorerUI;
}
