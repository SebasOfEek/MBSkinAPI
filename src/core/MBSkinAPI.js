/*
 * MBSkinAPI - Main module for exploring Mine Blocks skins
 * @author SebasOfEek
 * @version 3.0.0
 */

// Import dependencies (for modular development)
// import SkinService from '../services/SkinService.js';
// import SkinExplorerUI from '../ui/SkinExplorerUI.js';
(function() {
function createSkinService(options = {}) {
    let SkinServiceClass;

    if (typeof module !== 'undefined' && module.exports) {
        SkinServiceClass = require('../services/SkinService.js');
    } else if (typeof window !== 'undefined') {
        SkinServiceClass = window.SkinService;
    }

    if (typeof SkinServiceClass !== 'function') {
        throw new Error('SkinService is not available');
    }

    return new SkinServiceClass(options);
}

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
        this.skinService = createSkinService({
            apiUrl: this.config.apiUrl,
            imageUrl: this.config.imageUrl
        });

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

        this._requestVersion = 0;
        this._resetSnapshot = null;
        this._searchTimer = null;
        this._eventCleanups = [];
        this._cardCleanups = [];
        this._pendingTimers = new Set();
        this._autoLoadCount = 0;
        this._returnFocusElement = null;
        this._containerSnapshot = null;

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
        // Component styles are provided by MBSkinStyles.css.
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'mb-skin-modal';
        modal.className = 'mb-skin-modal';
        modal.dataset.theme = this.config.theme === 'dark' ? 'dark' : 'light';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('aria-label', 'Explorador de skins');
        modal.innerHTML = `
            <div class="mb-skin-modal-content mb-skin-api-container" tabindex="-1" data-theme="${this.config.theme === 'dark' ? 'dark' : 'light'}">
                <div class="mb-skin-modal-header">
                    <input type="text" class="mb-skin-search-input" placeholder="Buscar skin..." aria-label="Buscar skin">
                    <select class="mb-skin-filter-select" aria-label="Filtrar skins">
                        <option value="all">Todo</option>
                        <option value="name">Nombre</option>
                        <option value="author">Autor</option>
                    </select>
                    <button type="button" class="mb-skin-close" id="mb-skin-close" aria-label="Cerrar explorador">&times;</button>
                </div>
                <div class="mb-skin-grid" id="mb-skin-grid"></div>
                <div class="mb-skin-load-status" id="mb-skin-load-status" role="status" aria-live="polite">Listo para buscar</div>
            </div>
        `;
        
        const toast = document.createElement('div');
        toast.id = 'mb-skin-toast';
        toast.className = 'mb-skin-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = 'ID Copiado';
        
        document.body.appendChild(modal);
        modal.appendChild(toast);
        
        this.modal = modal;
        this.modalContent = modal.querySelector('.mb-skin-modal-content');
        this.grid = modal.querySelector('#mb-skin-grid');
        this.searchInput = modal.querySelector('.mb-skin-search-input');
        this.filterSelect = modal.querySelector('.mb-skin-filter-select');
        this.closeBtn = modal.querySelector('#mb-skin-close');
        this.loadStatus = modal.querySelector('#mb-skin-load-status');
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

        this._containerSnapshot = {
            container,
            hadClass: container.classList.contains('mb-skin-api-container'),
            theme: container.getAttribute('data-theme'),
            appliedTheme: this.config.theme === 'dark' ? 'dark' : 'light',
            childNodes: Array.from(container.childNodes)
        };
        container.classList.add('mb-skin-api-container');
        container.dataset.theme = this.config.theme === 'dark' ? 'dark' : 'light';
        container.innerHTML = `
            <div class="mb-skin-search-container">
                <input type="text" class="mb-skin-search-input" placeholder="Buscar skin..." aria-label="Buscar skin">
                <select class="mb-skin-filter-select" aria-label="Filtrar skins">
                    <option value="all">Todo</option>
                    <option value="name">Nombre</option>
                    <option value="author">Autor</option>
                </select>
            </div>
            <div class="mb-skin-grid" id="mb-skin-grid"></div>
            <div class="mb-skin-load-status" id="mb-skin-load-status" role="status" aria-live="polite">Listo para buscar</div>
        `;
        
        this.container = container;
        this.grid = container.querySelector('#mb-skin-grid');
        this.searchInput = container.querySelector('.mb-skin-search-input');
        this.filterSelect = container.querySelector('.mb-skin-filter-select');
        this.loadStatus = container.querySelector('#mb-skin-load-status');
        
        // Create toast for notifications
        const toast = document.createElement('div');
        toast.id = 'mb-skin-toast';
        toast.className = 'mb-skin-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = 'ID Copiado';
        container.appendChild(toast);
        this.toast = toast;
        this._containerSnapshot.generatedNodes = Array.from(container.childNodes)
            .filter(node => !this._containerSnapshot.childNodes.includes(node));
    }

    bindEvents() {
        if (this.closeBtn) this._listen(this.closeBtn, 'click', () => this.hide());
        if (this.modal) {
            this._listen(this.modal, 'keydown', event => this.handleModalKeydown(event));
        }

        this._listen(this.searchInput, 'input', event => {
            clearTimeout(this._searchTimer);
            this._searchTimer = setTimeout(() => {
                this._searchTimer = null;
                this.search(event.target.value);
            }, 500);
        });
        
        this._listen(this.filterSelect, 'change', event => this.setFilter(event.target.value));
        
        if (this.config.enableInfiniteScroll && this.grid) {
            this._listen(this.grid, 'scroll', () => this.handleScroll());
        }
    }

    _listen(target, eventName, handler) {
        if (!target) return;
        if (!this._eventCleanups) this._eventCleanups = [];
        target.addEventListener(eventName, handler);
        const cleanup = () => target.removeEventListener(eventName, handler);
        this._eventCleanups.push(cleanup);
        return cleanup;
    }

    _listenCard(target, eventName, handler) {
        const cleanup = this._listen(target, eventName, handler);
        if (cleanup) {
            if (!this._cardCleanups) this._cardCleanups = [];
            this._cardCleanups.push(cleanup);
        }
    }

    _clearCardListeners() {
        if (!this._cardCleanups) this._cardCleanups = [];
        if (!this._eventCleanups) this._eventCleanups = [];
        for (const cleanup of this._cardCleanups) {
            cleanup();
            const cleanupIndex = this._eventCleanups.indexOf(cleanup);
            if (cleanupIndex !== -1) this._eventCleanups.splice(cleanupIndex, 1);
        }
        this._cardCleanups.length = 0;
    }

    _scheduleTimeout(callback, delay) {
        if (!this._pendingTimers) this._pendingTimers = new Set();
        const timer = setTimeout(() => {
            this._pendingTimers.delete(timer);
            callback();
        }, delay);
        this._pendingTimers.add(timer);
        return timer;
    }

    handleModalKeydown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.hide();
            return;
        }

        if (event.key !== 'Tab' || !this.modal) return;
        const focusable = Array.from(this.modal.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]'
        ));
        if (focusable.length === 0) {
            event.preventDefault();
            this.modalContent.focus();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === this.modalContent)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    async fetchSkins(reset = false) {
        if (!reset && (this.state.isLoading || !this.state.hasMore)) return;

        const requestVersion = reset ? ++this._requestVersion : this._requestVersion;
        
        this.state.isLoading = true;
        this.updateLoadStatus("Cargando...");
        
        if (reset) {
            this._autoLoadCount = 0;
            if (!this._resetSnapshot) {
                this._resetSnapshot = {
                    page: this.state.page,
                    hasMore: this.state.hasMore,
                    totalResults: this.state.totalResults,
                    isSmallResultSet: this.state.isSmallResultSet,
                    skins: [...this.state.skins]
                };
            }
            this.state.page = 1;
            this.state.hasMore = true;
            this.state.totalResults = 0;
            this.state.isSmallResultSet = false;
            this.state.skins = [];
            if (this.grid) {
                this._clearCardListeners();
                this.grid.innerHTML = '';
            }
        }

        try {
            const skinService = this.skinService || (this.skinService = createSkinService({
                apiUrl: this.config.apiUrl,
                imageUrl: this.config.imageUrl
            }));
            if (skinService.apiUrl !== this.config.apiUrl) {
                skinService.apiUrl = this.config.apiUrl;
                skinService.clearCache();
            }
            skinService.imageUrl = this.config.imageUrl;
            const data = this.state.query
                ? await skinService.searchSkins(this.state.query, this.state.filter, this.state.page)
                : await skinService.getNewSkins(this.state.page);
            
            if (!data || data === 0 || data.length === 0) {
                if (requestVersion !== this._requestVersion) {
                    return [];
                }
                this.state.hasMore = false;
                this._resetSnapshot = null;
                this.updateLoadStatus("Fin del catálogo");
                return [];
            }
            
            // Process and filter results
            const filteredData = data;

            if (requestVersion !== this._requestVersion) {
                return filteredData;
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
            try {
                this.renderSkins(filteredData, reset);
            } catch (error) {
                error.kind = 'render';
                throw error;
            }
            if (reset) this._resetSnapshot = null;
            this.updateLoadStatus(this.state.hasMore ? "Desplaza para cargar más" : "Fin del catálogo");
            
            // Fill a short initial grid, but cap automatic requests per search.
            if (this.config.enableInfiniteScroll && this._autoLoadCount < 2) {
                const currentItems = this.grid.querySelectorAll('.mb-skin-item').length;
                if (currentItems < this.config.itemsPerPage && this.state.hasMore) {
                    this.state.isLoading = false;
                    this._autoLoadCount++;
                    this._scheduleTimeout(() => {
                        if (requestVersion === this._requestVersion) this.fetchSkins();
                    }, 100);
                }
            }
            
            // Trigger onSkinLoad callback
            if (this.config.onSkinLoad) {
                this.config.onSkinLoad(filteredData, this.state);
            }
            
            return filteredData;
            
        } catch (error) {
            if (requestVersion !== this._requestVersion) {
                return [];
            }
            const callbackError = error.cause || error;
            if (reset && this._resetSnapshot) {
                const previousState = this._resetSnapshot;
                this._resetSnapshot = null;
                this.state.page = previousState.page;
                this.state.hasMore = previousState.hasMore;
                this.state.totalResults = previousState.totalResults;
                this.state.isSmallResultSet = previousState.isSmallResultSet;
                this.state.skins = previousState.skins;
                try {
                    if (this.grid) {
                        this._clearCardListeners();
                        this.grid.innerHTML = '';
                    }
                    this.renderSkins(previousState.skins, true);
                } catch (restoreError) {
                    callbackError.restoreError = restoreError;
                }
            }
            if (!callbackError.kind) {
                callbackError.kind = callbackError instanceof SyntaxError ? 'parse' : 'network';
            }
            console.error('MBSkinAPI: Error fetching skins:', callbackError);
            this.updateLoadStatus("Error al cargar skins");
            if (this.config.onError) {
                this.config.onError(callbackError);
            }
            return [];
        } finally {
            if (requestVersion === this._requestVersion) {
                this.state.isLoading = false;
            }
        }
    }

    renderSkins(skins, reset = false) {
        if (!this.grid) return;
        
        if (reset) {
            this._clearCardListeners();
            this.grid.innerHTML = '';
        }
        
        skins.forEach(skin => {
            const item = document.createElement('div');
            item.className = 'mb-skin-item';

            const canvas = document.createElement('canvas');
            canvas.id = `mb-skin-canvas-${skin.id}`;

            const name = document.createElement('span');
            name.className = 'mb-skin-name';
            name.textContent = skin.name;

            const author = document.createElement('span');
            author.className = 'mb-skin-author';
            author.textContent = skin.author;

            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `${skin.name} por ${skin.author}`);
            item.appendChild(canvas);
            item.appendChild(name);
            item.appendChild(author);
            this._listenCard(item, 'click', () => this.selectSkin(skin));
            this._listenCard(item, 'keydown', event => {
                if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                    event.preventDefault();
                    this.selectSkin(skin);
                }
            });
            this.grid.appendChild(item);
            this.drawSkin(skin.id);
        });
    }

    drawSkin(id) {
        const canvas = this.grid && Array.from(this.grid.querySelectorAll('canvas'))
            .find(candidate => candidate.id === `mb-skin-canvas-${id}`);
        if (!canvas) return;
        const skinService = this.skinService || (this.skinService = createSkinService({
            apiUrl: this.config.apiUrl,
            imageUrl: this.config.imageUrl
        }));
        skinService.imageUrl = this.config.imageUrl;
        skinService.drawSkin(id, canvas).catch(() => {
            console.warn(`MBSkinAPI: Failed to load skin image for ID ${id}`);
        });
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
            const canvas = this.grid && Array.from(this.grid.querySelectorAll('canvas'))
                .find(candidate => candidate.id === `mb-skin-canvas-${skin.id}`);
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
            if (this._toastTimer) {
                clearTimeout(this._toastTimer);
                this._pendingTimers.delete(this._toastTimer);
            }
            this._toastTimer = this._scheduleTimeout(() => { 
                this.toast.style.display = 'none'; 
                this._toastTimer = null;
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
            if (this.modal.getAttribute('aria-hidden') === 'true') {
                this._returnFocusElement = document.activeElement;
            }
            this.modal.style.display = 'flex';
            this.modal.setAttribute('aria-hidden', 'false');
            this.searchInput.focus();
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
            this.modal.setAttribute('aria-hidden', 'true');
            if (this._returnFocusElement && this._returnFocusElement.isConnected) {
                this._returnFocusElement.focus();
            }
            this._returnFocusElement = null;
        } else if (this.container) {
            this.container.style.display = 'none';
        }
    }

    search(query) {
        clearTimeout(this._searchTimer);
        this._searchTimer = null;
        this.state.query = query;
        if (this.searchInput) {
            this.searchInput.value = query;
        }
        return this.fetchSkins(true);
    }

    setFilter(filter) {
        clearTimeout(this._searchTimer);
        this._searchTimer = null;
        this.state.filter = filter;
        if (this.filterSelect) {
            this.filterSelect.value = filter;
        }
        if (this.searchInput) {
            this.state.query = this.searchInput.value;
        }
        if (this.state.query) {
            return this.fetchSkins(true);
        }
    }

    reset() {
        clearTimeout(this._searchTimer);
        this._searchTimer = null;
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
        const apiUrlChanged = newConfig.apiUrl !== undefined && newConfig.apiUrl !== this.config.apiUrl;
        this.config = { ...this.config, ...newConfig };
        const theme = this.config.theme === 'dark' ? 'dark' : 'light';
        if (this.modal) {
            this.modal.dataset.theme = theme;
            this.modalContent.dataset.theme = theme;
        }
        if (this._containerSnapshot) {
            this._containerSnapshot.container.dataset.theme = theme;
            this._containerSnapshot.appliedTheme = theme;
        }
        if (this.skinService) {
            this.skinService.apiUrl = this.config.apiUrl;
            this.skinService.imageUrl = this.config.imageUrl;
            if (apiUrlChanged) this.skinService.clearCache();
        }
    }

    destroy() {
        this._requestVersion++;
        this._resetSnapshot = null;
        clearTimeout(this._searchTimer);
        this._searchTimer = null;
        for (const timer of this._pendingTimers || []) clearTimeout(timer);
        if (this._pendingTimers) this._pendingTimers.clear();
        this._toastTimer = null;
        (this._eventCleanups || []).forEach(cleanup => cleanup());
        this._eventCleanups = [];

        if (this._returnFocusElement && this._returnFocusElement.isConnected) {
            this._returnFocusElement.focus();
        }
        this._returnFocusElement = null;

        if (this.modal) {
            this.modal.remove();
        }
        if (this.toast) {
            this.toast.remove();
        }

        if (this._containerSnapshot) {
            const { container, hadClass, theme, appliedTheme, childNodes, generatedNodes } = this._containerSnapshot;
            generatedNodes.forEach(node => {
                if (node.parentNode === container) container.removeChild(node);
            });
            childNodes.forEach(node => {
                if (node.parentNode !== container) container.insertBefore(node, container.firstChild);
            });
            if (!hadClass) container.classList.remove('mb-skin-api-container');
            if (container.getAttribute('data-theme') === appliedTheme) {
                if (theme === null) container.removeAttribute('data-theme');
                else container.setAttribute('data-theme', theme);
            }
            this._containerSnapshot = null;
        }

        if (this._cardCleanups) this._cardCleanups.length = 0;
        this.modal = null;
        this.modalContent = null;
        this.grid = null;
        this.searchInput = null;
        this.filterSelect = null;
        this.closeBtn = null;
        this.loadStatus = null;
        this.toast = null;
        this.container = null;
        this.skinService = null;
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
})();
