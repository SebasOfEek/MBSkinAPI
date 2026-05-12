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
