/*
 * MBSkinAPI - Main module for exploring Mine Blocks skins
 * @author SebasOfEek
 * @version 3.0.0
 */

// Import dependencies (for modular development)
// import SkinService from '../services/SkinService.js';
// import SkinExplorerUI from '../ui/SkinExplorerUI.js';

class MBSkinAPI {
    constructor(options = {}) {
        // Configuration options
        this.config = {
            apiUrl: options.apiUrl || 'https://mineblocks.com/1/scripts/returnSkins.php',
            imageUrl: options.imageUrl || 'https://mineblocks.com/1/skins/images/',
            container: options.container || null, // Custom container selector or element
            useModal: options.useModal !== false, // Default to true for backward compatibility
            autoSaveImages: options.autoSaveImages || false,
            onSkinSelect: options.onSkinSelect || this.defaultOnSkinSelect.bind(this),
            onSkinLoad: options.onSkinLoad || null,
            onError: options.onError || this.defaultOnError.bind(this),
            theme: options.theme || 'dark',
            showLoadStatus: options.showLoadStatus !== false,
            enableInfiniteScroll: options.enableInfiniteScroll !== false,
            itemsPerPage: options.itemsPerPage || 20
        };

        // Internal state
        this.state = {
            page: 1,
            query: '',
            filter: 'all',
            isLoading: false,
            hasMore: true,
            totalResults: 0,
            isSmallResultSet: false,
            skins: []
        };

        // Initialize
        this.init();
    }

    init() {
        this.injectStyles();
        
        if (this.config.useModal) {
            this.createModal();
        } else if (this.config.container) {
            this.setupCustomContainer();
        } else {
            console.warn('MBSkinAPI: No container specified. Use container option or set useModal to true.');
            return;
        }
        
        this.bindEvents();
        console.log('MBSkinAPI v2.0 initialized successfully');
    }

    injectStyles() {
        if (document.getElementById('mb-skin-api-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'mb-skin-api-styles';
        style.textContent = `
            .mb-skin-api-container {
                --mb-bg: ${this.config.theme === 'dark' ? '#1a1a1a' : '#ffffff'};
                --mb-border: ${this.config.theme === 'dark' ? '#333' : '#ddd'};
                --mb-text: ${this.config.theme === 'dark' ? '#fff' : '#333'};
                --mb-text-secondary: ${this.config.theme === 'dark' ? '#aaa' : '#666'};
                --mb-accent: ${this.config.theme === 'dark' ? '#4CAF50' : '#2196F3'};
                --mb-hover: ${this.config.theme === 'dark' ? '#2d2d2d' : '#f5f5f5'};
            }
            
            .mb-skin-api-container * {
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .mb-skin-search-container {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .mb-skin-search-input {
                flex: 1;
                min-width: 200px;
                padding: 12px;
                background: var(--mb-bg);
                border: 1px solid var(--mb-border);
                color: var(--mb-text);
                border-radius: 8px;
                outline: none;
                transition: border-color 0.3s;
            }
            
            .mb-skin-search-input:focus {
                border-color: var(--mb-accent);
            }
            
            .mb-skin-filter-select {
                padding: 12px;
                background: var(--mb-bg);
                color: var(--mb-text);
                border: 1px solid var(--mb-border);
                border-radius: 8px;
                cursor: pointer;
                outline: none;
            }
            
            .mb-skin-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 20px;
                overflow-y: auto;
                max-height: 600px;
                padding: 10px;
                align-content: start;
            }
            
            .mb-skin-item {
                background: var(--mb-hover);
                padding: 15px;
                border-radius: 12px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 1px solid transparent;
                height: 200px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            
            .mb-skin-item:hover {
                border-color: var(--mb-accent);
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            .mb-skin-item canvas {
                image-rendering: pixelated;
                transform: scale(2.5);
                margin-bottom: 15px;
                pointer-events: none;
            }
            
            .mb-skin-item .mb-skin-name {
                display: block;
                font-size: 13px;
                color: var(--mb-text);
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: bold;
            }
            
            .mb-skin-item .mb-skin-author {
                font-size: 11px;
                color: var(--mb-text-secondary);
                margin-top: 4px;
            }
            
            .mb-skin-load-status {
                text-align: center;
                padding: 15px;
                color: var(--mb-accent);
                font-size: 13px;
                font-weight: 500;
            }
            
            .mb-skin-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .mb-skin-modal-content {
                background: var(--mb-bg);
                border: 1px solid var(--mb-border);
                border-radius: 12px;
                width: 90%;
                max-width: 900px;
                height: 80%;
                max-height: 700px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .mb-skin-modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--mb-border);
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .mb-skin-close {
                cursor: pointer;
                font-size: 28px;
                color: var(--mb-text-secondary);
                margin-left: auto;
                transition: color 0.3s;
            }
            
            .mb-skin-close:hover {
                color: var(--mb-text);
            }
            
            .mb-skin-toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--mb-accent);
                color: white;
                padding: 12px 25px;
                border-radius: 30px;
                display: none;
                z-index: 10001;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
    }

    createModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById('mb-skin-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'mb-skin-modal';
        modal.className = 'mb-skin-modal';
        modal.innerHTML = `
            <div class="mb-skin-modal-content mb-skin-api-container">
                <div class="mb-skin-modal-header">
                    <input type="text" class="mb-skin-search-input" placeholder="Buscar skin...">
                    <select class="mb-skin-filter-select">
                        <option value="all">Todo</option>
                        <option value="name">Nombre</option>
                        <option value="author">Autor</option>
                    </select>
                    <span class="mb-skin-close" id="mb-skin-close">&times;</span>
                </div>
                <div class="mb-skin-grid" id="mb-skin-grid"></div>
                <div class="mb-skin-load-status" id="mb-skin-load-status">Listo para buscar</div>
            </div>
        `;
        
        const toast = document.createElement('div');
        toast.id = 'mb-skin-toast';
        toast.className = 'mb-skin-toast';
        toast.textContent = 'ID Copiado';
        
        document.body.appendChild(modal);
        document.body.appendChild(toast);
        
        this.modal = modal;
        this.grid = document.getElementById('mb-skin-grid');
        this.searchInput = modal.querySelector('.mb-skin-search-input');
        this.filterSelect = modal.querySelector('.mb-skin-filter-select');
        this.closeBtn = document.getElementById('mb-skin-close');
        this.loadStatus = document.getElementById('mb-skin-load-status');
        this.toast = toast;
    }

    setupCustomContainer() {
        const container = typeof this.config.container === 'string' 
            ? document.querySelector(this.config.container)
            : this.config.container;
            
        if (!container) {
            console.error('MBSkinAPI: Container not found:', this.config.container);
            return;
        }

        container.className += ' mb-skin-api-container';
        container.innerHTML = `
            <div class="mb-skin-search-container">
                <input type="text" class="mb-skin-search-input" placeholder="Buscar skin...">
                <select class="mb-skin-filter-select">
                    <option value="all">Todo</option>
                    <option value="name">Nombre</option>
                    <option value="author">Autor</option>
                </select>
            </div>
            <div class="mb-skin-grid" id="mb-skin-grid"></div>
            <div class="mb-skin-load-status" id="mb-skin-load-status">Listo para buscar</div>
        `;
        
        this.container = container;
        this.grid = document.getElementById('mb-skin-grid');
        this.searchInput = container.querySelector('.mb-skin-search-input');
        this.filterSelect = container.querySelector('.mb-skin-filter-select');
        this.loadStatus = document.getElementById('mb-skin-load-status');
        
        // Create toast for notifications
        if (!document.getElementById('mb-skin-toast')) {
            const toast = document.createElement('div');
            toast.id = 'mb-skin-toast';
            toast.className = 'mb-skin-toast';
            toast.textContent = 'ID Copiado';
            document.body.appendChild(toast);
            this.toast = toast;
        }
    }

    bindEvents() {
        // Close button (only for modal)
        if (this.closeBtn) {
            this.closeBtn.onclick = () => this.hide();
        }
        
        // Search input with debouncing
        let searchTimer;
        this.searchInput.oninput = (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                this.search(e.target.value);
            }, 500);
        };
        
        // Filter select
        this.filterSelect.onchange = (e) => {
            this.setFilter(e.target.value);
        };
        
        // Infinite scroll (if enabled)
        if (this.config.enableInfiniteScroll && this.grid) {
            this.grid.onscroll = () => this.handleScroll();
        }
    }

    async fetchSkins(reset = false) {
        if (this.state.isLoading || (!this.state.hasMore && !reset)) return;
        
        this.state.isLoading = true;
        this.updateLoadStatus("Cargando...");
        
        if (reset) {
            this.state.page = 1;
            this.state.hasMore = true;
            this.state.totalResults = 0;
            this.state.isSmallResultSet = false;
            this.state.skins = [];
            if (this.grid) this.grid.innerHTML = '';
        }

        const formData = new FormData();
        formData.append('type', this.state.query ? 'search' : 'new');
        formData.append('page', this.state.page);
        if (this.state.query) formData.append('key', this.state.query);

        try {
            const response = await fetch(this.config.apiUrl, { method: 'POST', body: formData });
            const text = await response.text();
            
            // Handle end of results (0 response)
            if (/^[\s\S]*0\s*$/.test(text)) {
                console.log('MBSkinAPI: No more results available');
                this.state.hasMore = false;
                this.updateLoadStatus("No hay más resultados");
                return [];
            }
            
            // Enhanced JSON cleaning with multiple fallback methods
            let cleanText = text;
            
            // Method 1: Find JSON array between [ and ]
            const jsonStart = text.indexOf('[');
            const jsonEnd = text.lastIndexOf(']');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                cleanText = text.substring(jsonStart, jsonEnd + 1);
            } else {
                // Method 2: Try to extract JSON using regex
                const jsonMatch = text.match(/\[.*?\]/s);
                if (jsonMatch) {
                    cleanText = jsonMatch[0];
                } else {
                    // Method 3: Remove HTML tags and warnings
                    cleanText = text
                        .replace(/<[^>]*>/g, '')
                        .replace(/Warning:[^\[]*(?!0$)/gi, '')
                        .replace(/Notice:[^\[]*(?!0$)/gi, '')
                        .replace(/Fatal error:[^\[]*(?!0$)/gi, '')
                        .trim();
                    
                    const finalJsonMatch = cleanText.match(/\[.*?\]/s);
                    if (finalJsonMatch) {
                        cleanText = finalJsonMatch[0];
                    }
                }
            }
            
            // Validate and parse JSON
            if (!cleanText || cleanText.trim() === '') {
                throw new Error('No valid JSON content found in server response');
            }
            
            if (!cleanText.startsWith('[') || !cleanText.endsWith(']')) {
                throw new Error('Server response does not contain valid JSON array');
            }
            
            const data = JSON.parse(cleanText);
            
            if (!data || data === 0 || data.length === 0) {
                this.state.hasMore = false;
                this.updateLoadStatus("Fin del catálogo");
                return [];
            }
            
            // Process and filter results
            let filteredData = data;
            if (this.state.query && this.state.filter !== 'all') {
                filteredData = data.filter(s => 
                    this.state.filter === 'author' 
                        ? s.author.toLowerCase().includes(this.state.query.toLowerCase())
                        : s.name.toLowerCase().includes(this.state.query.toLowerCase())
                );
            }

            // Update state
            if (reset && this.state.page === 1 && this.state.query) {
                this.state.totalResults = filteredData.length;
                this.state.isSmallResultSet = this.state.totalResults < 35;
            } else if (!this.state.query) {
                this.state.isSmallResultSet = false;
            }

            this.state.skins = reset ? filteredData : [...this.state.skins, ...filteredData];
            this.state.page++;
            
            // Render results
            this.renderSkins(filteredData, reset);
            this.updateLoadStatus(this.state.hasMore ? "Desplaza para cargar más" : "Fin del catálogo");
            
            // Auto-load more if needed
            if (this.config.enableInfiniteScroll) {
                const currentItems = this.grid.querySelectorAll('.mb-skin-item').length;
                if (this.state.isSmallResultSet && this.state.hasMore) {
                    this.state.isLoading = false;
                    setTimeout(() => this.fetchSkins(), 100);
                } else if (currentItems < this.config.itemsPerPage && this.state.hasMore) {
                    this.state.isLoading = false;
                    setTimeout(() => this.fetchSkins(), 100);
                }
            }
            
            // Trigger onSkinLoad callback
            if (this.config.onSkinLoad) {
                this.config.onSkinLoad(filteredData, this.state);
            }
            
            return filteredData;
            
        } catch (error) {
            console.error('MBSkinAPI: Error fetching skins:', error);
            this.updateLoadStatus("Error al cargar skins");
            if (this.config.onError) {
                this.config.onError(error);
            }
            return [];
        } finally {
            this.state.isLoading = false;
        }
    }

    renderSkins(skins, reset = false) {
        if (!this.grid) return;
        
        if (reset) {
            this.grid.innerHTML = '';
        }
        
        skins.forEach(skin => {
            const item = document.createElement('div');
            item.className = 'mb-skin-item';
            item.innerHTML = `
                <canvas id="mb-skin-canvas-${skin.id}"></canvas>
                <span class="mb-skin-name">${skin.name}</span>
                <span class="mb-skin-author">${skin.author}</span>
            `;
            item.onclick = () => this.selectSkin(skin);
            this.grid.appendChild(item);
            this.drawSkin(skin.id);
        });
    }

    drawSkin(id) {
        const canvas = document.getElementById(`mb-skin-canvas-${id}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = `${this.config.imageUrl}${id}.png`;
        
        img.onload = () => {
            canvas.width = 16;
            canvas.height = 22;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, 16, 22, 0, 0, 16, 22);
            
            // Remove background (make transparent)
            const imgData = ctx.getImageData(0, 0, 16, 22);
            const px = imgData.data;
            const r = px[0], g = px[1], b = px[2];
            
            for (let i = 0; i < px.length; i += 4) {
                if (px[i] === r && px[i+1] === g && px[i+2] === b) px[i+3] = 0;
            }
            
            ctx.putImageData(imgData, 0, 0);
        };
        
        img.onerror = () => {
            console.warn(`MBSkinAPI: Failed to load skin image for ID ${id}`);
        };
    }

    async selectSkin(skin) {
        try {
            // Copy ID to clipboard
            await navigator.clipboard.writeText(skin.id);
            this.showToast(`ID ${skin.id} copiado`);
            
            // Save image if enabled
            if (this.config.autoSaveImages) {
                await this.saveSkinImage(skin);
            }
            
            // Trigger callback
            this.config.onSkinSelect(skin);
            
        } catch (error) {
            console.error('MBSkinAPI: Error selecting skin:', error);
            if (this.config.onError) {
                this.config.onError(error);
            }
        }
    }

    async saveSkinImage(skin) {
        try {
            const canvas = document.getElementById(`mb-skin-canvas-${skin.id}`);
            if (!canvas) {
                console.warn(`MBSkinAPI: Canvas not found for skin ID ${skin.id}`);
                return;
            }
            
            // Convert canvas to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `skin_${skin.id}_${skin.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`MBSkinAPI: Saved skin image for ID ${skin.id}`);
            
        } catch (error) {
            console.error(`MBSkinAPI: Failed to save skin image for ID ${skin.id}:`, error);
        }
    }

    showToast(message) {
        if (this.toast) {
            this.toast.textContent = message;
            this.toast.style.display = 'block';
            setTimeout(() => { 
                this.toast.style.display = 'none'; 
            }, 2000);
        }
    }

    updateLoadStatus(message) {
        if (this.loadStatus && this.config.showLoadStatus) {
            this.loadStatus.textContent = message;
        }
    }

    handleScroll() {
        if (!this.grid || !this.config.enableInfiniteScroll) return;
        
        if (this.grid.scrollTop + this.grid.clientHeight >= this.grid.scrollHeight - 100) {
            this.fetchSkins();
        }
    }

    // Public API methods
    show() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            if (this.grid && this.grid.innerHTML === '') {
                this.fetchSkins();
            }
        } else if (this.container) {
            this.container.style.display = 'block';
            if (this.grid && this.grid.innerHTML === '') {
                this.fetchSkins();
            }
        }
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        } else if (this.container) {
            this.container.style.display = 'none';
        }
    }

    search(query) {
        this.state.query = query;
        if (this.searchInput) {
            this.searchInput.value = query;
        }
        return this.fetchSkins(true);
    }

    setFilter(filter) {
        this.state.filter = filter;
        if (this.filterSelect) {
            this.filterSelect.value = filter;
        }
        if (this.state.query) {
            return this.fetchSkins(true);
        }
    }

    reset() {
        this.state.query = '';
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        return this.fetchSkins(true);
    }

    getState() {
        return { ...this.state };
    }

    getConfig() {
        return { ...this.config };
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    destroy() {
        // Remove modal
        if (this.modal) {
            this.modal.remove();
        }
        
        // Remove styles
        const styles = document.getElementById('mb-skin-api-styles');
        if (styles) {
            styles.remove();
        }
        
        // Remove toast
        if (this.toast) {
            this.toast.remove();
        }
        
        // Clear references
        this.modal = null;
        this.grid = null;
        this.searchInput = null;
        this.filterSelect = null;
        this.closeBtn = null;
        this.loadStatus = null;
        this.toast = null;
        this.container = null;
    }

    // Default callbacks
    defaultOnSkinSelect(skin) {
        console.log('MBSkinAPI: Skin selected:', skin);
    }

    defaultOnError(error) {
        console.error('MBSkinAPI: Error occurred:', error);
    }
}

// Export for modules and global availability
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MBSkinAPI;
} else {
    window.MBSkinAPI = MBSkinAPI;
}

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
            const text = await response.text();
            
            // Enhanced JSON cleaning with multiple fallback methods
            let cleanText = text;
            
            // Method 1: Find JSON array between [ and ]
            const jsonStart = text.indexOf('[');
            const jsonEnd = text.lastIndexOf(']');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                cleanText = text.substring(jsonStart, jsonEnd + 1);
                console.log('SkinService: Cleaned response using method 1');
            } else {
                // Method 2: Try to extract JSON using regex
                const jsonMatch = text.match(/\[.*?\]/s);
                if (jsonMatch) {
                    cleanText = jsonMatch[0];
                    console.log('SkinService: Cleaned response using method 2');
                } else {
                    // Method 3: Remove all HTML tags and warning text, then try to find JSON
                    cleanText = text
                        .replace(/<[^>]*>/g, '') // Remove HTML tags
                        .replace(/Warning:[^\[]*/gi, '') // Remove warning text before JSON
                        .replace(/Notice:[^\[]*/gi, '') // Remove notice text before JSON
                        .replace(/Fatal error:[^\[]*/gi, '') // Remove fatal error text before JSON
                        .trim();
                    
                    // Try to find JSON in cleaned text
                    const finalJsonMatch = cleanText.match(/\[.*?\]/s);
                    if (finalJsonMatch) {
                        cleanText = finalJsonMatch[0];
                        console.log('SkinService: Cleaned response using method 3 (with regex)');
                    } else {
                        console.log('SkinService: Cleaned response using method 3 (final)');
                    }
                }
            }
            
            // Final validation: ensure we have valid JSON content
            if (!cleanText || cleanText.trim() === '') {
                console.warn('SkinService: No valid JSON content found after cleaning');
                throw new Error('No valid JSON content found in server response');
            }
            
            if (!cleanText.startsWith('[') || !cleanText.endsWith(']')) {
                console.warn('SkinService: Cleaned text does not appear to be valid JSON array');
                throw new Error('Server response does not contain valid JSON array');
            }
            
            // Log for debugging
            console.log('SkinService: Original response length:', text.length);
            console.log('SkinService: Cleaned response length:', cleanText.length);
            console.log('SkinService: Cleaned response preview:', cleanText.substring(0, 100));
            
            const data = JSON.parse(cleanText);
            
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

/*
 * SkinExplorerUI - UI component for exploring Mine Blocks skins
 * @author SebasOfEek
 * @version 2.0.0
 */

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
                --mb-success: #4caf50;
                --mb-error: #f44336;
                --mb-warning: #ff9800;
            }
            
            .mb-explorer {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: var(--mb-bg);
                color: var(--mb-text);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
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
            }
            
            .mb-controls {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
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
                transition: border-color 0.3s;
            }
            
            .mb-search-input:focus {
                border-color: var(--mb-accent);
            }
            
            .mb-filter-select {
                padding: 10px 15px;
                background: #111;
                border: 1px solid var(--mb-border);
                color: var(--mb-text);
                border-radius: 8px;
                cursor: pointer;
                outline: none;
            }
            
            .mb-btn {
                padding: 10px 20px;
                background: var(--mb-accent);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                transition: background 0.3s;
            }
            
            .mb-btn:hover {
                background: #45a049;
            }
            
            .mb-btn:disabled {
                background: #666;
                cursor: not-allowed;
            }
            
            .mb-content {
                height: 500px;
                overflow-y: auto;
                padding: 20px;
            }
            
            .mb-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                gap: 15px;
            }
            
            .mb-skin-card {
                background: var(--mb-card);
                border: 1px solid var(--mb-border);
                border-radius: 10px;
                padding: 12px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
                height: 180px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            
            .mb-skin-card:hover {
                border-color: var(--mb-accent);
                background: var(--mb-hover);
                transform: translateY(-2px);
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
                color: var(--mb-error);
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
            }
            
            @keyframes mb-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .mb-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--mb-success);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transform: translateX(400px);
                transition: transform 0.3s;
                z-index: 10000;
            }
            
            .mb-toast.show {
                transform: translateX(0);
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
                <h2 class="mb-title">Explorador de Skins</h2>
                <div class="mb-controls">
                    <input type="text" class="mb-search-input" placeholder="Buscar skins...">
                    <select class="mb-filter-select">
                        <option value="all">Todo</option>
                        <option value="name">Nombre</option>
                        <option value="author">Autor</option>
                    </select>
                    <button class="mb-btn" id="mb-search-btn">Buscar</button>
                    <button class="mb-btn" id="mb-reset-btn">Limpiar</button>
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
                    <button class="mb-btn" id="mb-load-more" style="display: none;">Cargar más</button>
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
        this.searchInput.addEventListener('input', this.debounce(() => {
            this.state.query = this.searchInput.value;
            this.performSearch();
        }, 300));

        this.filterSelect.addEventListener('change', () => {
            this.state.filter = this.filterSelect.value;
            this.performSearch();
        });

        document.getElementById('mb-search-btn').addEventListener('click', () => {
            this.state.query = this.searchInput.value;
            this.performSearch();
        });

        document.getElementById('mb-reset-btn').addEventListener('click', () => {
            this.reset();
        });

        this.loadMoreBtn.addEventListener('click', () => {
            this.loadMore();
        });

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
            this.updateStatus(`Se encontraron ${skins.length} skins`);
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

        const skinsToRender = append ? 
            this.state.skins.slice(this.grid.children.length) : 
            this.state.skins;

        if (skinsToRender.length === 0 && !append) {
            this.showEmpty(true);
            return;
        }

        this.showEmpty(false);

        skinsToRender.forEach(skin => {
            const card = this.createSkinCard(skin);
            this.grid.appendChild(card);
        });

        this.loadMoreBtn.style.display = this.state.hasMore ? 'block' : 'none';
    }

    createSkinCard(skin) {
        const card = document.createElement('div');
        card.className = 'mb-skin-card';
        card.dataset.skinId = skin.id;
        
        if (this.state.selectedSkin === skin.id) {
            card.classList.add('selected');
        }

        const canvas = document.createElement('canvas');
        canvas.className = 'mb-skin-canvas';
        canvas.width = 16;
        canvas.height = 22;

        const name = document.createElement('div');
        name.className = 'mb-skin-name';
        name.textContent = skin.name;
        name.title = skin.name;

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
        this.grid.style.display = show ? 'none' : 'grid';
        this.loading.style.display = 'none';
    }

    showEmpty(show) {
        this.empty.style.display = show ? 'block' : 'none';
        this.grid.style.display = show ? 'none' : 'grid';
        this.loading.style.display = 'none';
    }

    updateStatus(message) {
        this.status.textContent = message;
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'mb-toast';
        toast.textContent = message;
        
        if (type === 'error') {
            toast.style.background = 'var(--mb-error)';
        } else if (type === 'warning') {
            toast.style.background = 'var(--mb-warning)';
        }

        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    reset() {
        this.state.query = '';
        this.state.filter = 'all';
        this.state.currentPage = 1;
        this.state.skins = [];
        this.state.selectedSkin = null;
        
        this.searchInput.value = '';
        this.filterSelect.value = 'all';
        this.grid.innerHTML = '';
        this.updateStatus('Listo');
        this.performSearch();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Métodos públicos
    setSkinService(skinService) {
        this.skinService = skinService;
    }

    setOnSkinSelect(callback) {
        this.onSkinSelect = callback;
    }

    search(query) {
        this.state.query = query;
        this.searchInput.value = query;
        this.performSearch();
    }

    getSelectedSkin() {
        return this.state.skins.find(skin => skin.id === this.state.selectedSkin);
    }

    destroy() {
        if (this.explorer && this.explorer.parentNode) {
            this.explorer.parentNode.removeChild(this.explorer);
        }
    }
}

// Export para módulos y compatibilidad global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkinExplorerUI;
} else {
    window.SkinExplorerUI = SkinExplorerUI;
}
