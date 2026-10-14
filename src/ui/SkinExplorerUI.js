/*
 * SkinExplorerUI - UI component for exploring Mine Blocks skins
 * @author SebasOfEek
 * @version 2.0.0
 */

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

class SkinExplorerUI {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.skinService = options.skinService || createSkinService();
        this.onSkinSelect = options.onSkinSelect || (() => {});
        this.theme = options.theme || 'dark';
        this.customStyles = options.customStyles || {};
        this._searchRequestId = 0;
        this._searchSnapshot = null;
        this._searchTimer = null;
        this._eventCleanups = [];
        this._cardCleanups = [];
        this._pendingTimers = new Set();
        this._toasts = new Set();
        this._view = 'results';
        
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
        if (!this.skinService) {
            this.skinService = createSkinService();
        }
        this.loadStyles();
        this.createUI();
        this.bindEvents();
    }

    loadStyles() {
        // Component styles are provided by MBSkinStyles.css.
    }

    getStyles() {
        return '';
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

    createUI() {
        const explorer = document.createElement('div');
        explorer.className = 'mb-explorer';
        explorer.dataset.theme = this.theme;
        explorer.setAttribute('role', 'region');
        explorer.setAttribute('aria-label', 'Explorador de skins');
        explorer.innerHTML = `
            <div class="mb-header">
                <h2 class="mb-title">Explorador de Skins</h2>
                <div class="mb-controls">
                    <input type="text" class="mb-search-input" placeholder="Buscar skins..." aria-label="Buscar skins">
                    <select class="mb-filter-select" aria-label="Filtrar skins">
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
                <div class="mb-loading" id="mb-loading" style="display: none;" role="status" aria-live="polite">
                    <div class="mb-spinner"></div>
                    Loading skins...
                </div>
                <div class="mb-error" id="mb-error" style="display: none;" role="alert">
                    Error loading skins. Please try again.
                </div>
                <div class="mb-empty" id="mb-empty" style="display: none;" role="status">
                    No skins found.
                </div>
            </div>
            <div class="mb-footer">
                <div class="mb-status" id="mb-status" role="status" aria-live="polite">Ready</div>
                <div class="mb-pagination">
                    <button class="mb-btn" id="mb-load-more" style="display: none;">Cargar más</button>
                </div>
            </div>
        `;

        this.container.appendChild(explorer);
        
        // References to elements
        this.explorer = explorer;
        this.content = explorer.querySelector('.mb-content');
        this.grid = explorer.querySelector('#mb-skins-grid');
        this.loading = explorer.querySelector('#mb-loading');
        this.error = explorer.querySelector('#mb-error');
        this.empty = explorer.querySelector('#mb-empty');
        this.status = explorer.querySelector('#mb-status');
        this.loadMoreBtn = explorer.querySelector('#mb-load-more');
        this.searchBtn = explorer.querySelector('#mb-search-btn');
        this.resetBtn = explorer.querySelector('#mb-reset-btn');
        this.searchInput = explorer.querySelector('.mb-search-input');
        this.filterSelect = explorer.querySelector('.mb-filter-select');

        for (const [selector, declarations] of Object.entries(this.customStyles)) {
            const elements = [];
            if (this.explorer.matches(selector)) elements.push(this.explorer);
            elements.push(...this.explorer.querySelectorAll(selector));
            elements.forEach(element => {
                element.style.cssText += `${element.style.cssText ? ';' : ''}${declarations}`;
            });
        }
    }

    bindEvents() {
        this._listen(this.searchInput, 'input', () => {
            clearTimeout(this._searchTimer);
            this._searchTimer = setTimeout(() => {
                this._searchTimer = null;
                this.state.query = this.searchInput.value;
                this.performSearch();
            }, 300);
        });

        this._listen(this.filterSelect, 'change', () => {
            clearTimeout(this._searchTimer);
            this._searchTimer = null;
            this.state.filter = this.filterSelect.value;
            this.state.query = this.searchInput.value;
            this.performSearch();
        });

        this._listen(this.searchBtn, 'click', () => {
            clearTimeout(this._searchTimer);
            this._searchTimer = null;
            this.state.query = this.searchInput.value;
            this.performSearch();
        });

        this._listen(this.resetBtn, 'click', () => {
            this.reset();
        });

        this._listen(this.loadMoreBtn, 'click', () => {
            this.loadMore();
        });

        const scrollContainer = this.content || this.grid;
        this._listen(scrollContainer, 'scroll', () => {
            if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 100) {
                this.loadMore();
            }
        });
    }

    async performSearch() {
        const requestId = ++this._searchRequestId;

        if (!this.skinService) {
            this._restoreSearchSnapshot();
            this.showError('SkinService not configured');
            return;
        }

        if (!this._searchSnapshot) {
            this._searchSnapshot = {
                skins: [...this.state.skins],
                currentPage: this.state.currentPage,
                hasMore: this.state.hasMore,
                selectedSkin: this.state.selectedSkin
            };
        }
        this.state.currentPage = 1;
        this.state.skins = [];
        this.state.hasMore = true;
        this.showLoading(true);

        try {
            const skins = this.state.query 
                ? await this.skinService.searchSkins(this.state.query, this.state.filter, 1)
                : await this.skinService.getNewSkins(1);

            if (requestId !== this._searchRequestId) return;

            this.state.skins = skins;
            this.state.hasMore = skins.length > 0;
            this.renderSkins();
            this._searchSnapshot = null;
            this.updateStatus(`Se encontraron ${skins.length} skins`);
        } catch (error) {
            if (requestId !== this._searchRequestId) return;
            this._restoreSearchSnapshot(error.kind === 'render');
            this.showError('Error searching skins');
            console.error(error);
        } finally {
            if (requestId === this._searchRequestId) this.showLoading(false);
        }
    }

    async loadMore() {
        if (!this.state.hasMore || this.state.isLoading || !this.skinService) return;

        const requestId = this._searchRequestId;
        const previousPage = this.state.currentPage;
        const previousSkins = [...this.state.skins];
        const requestedPage = this.state.currentPage + 1;
        this.state.currentPage = requestedPage;
        this.showLoading(true);

        try {
            const skins = this.state.query 
                ? await this.skinService.searchSkins(this.state.query, this.state.filter, requestedPage)
                : await this.skinService.getNewSkins(requestedPage);

            if (requestId !== this._searchRequestId) return;

            if (skins.length === 0) {
                this.state.hasMore = false;
                this.renderSkins(true);
                this.updateStatus('Fin del catálogo');
            } else {
                this.state.skins.push(...skins);
                this.renderSkins(true);
                this.updateStatus(`Se encontraron ${this.state.skins.length} skins`);
            }
        } catch (error) {
            if (requestId !== this._searchRequestId) return;
            this.state.currentPage = previousPage;
            if (error.kind === 'render') {
                this.state.skins = previousSkins;
                try {
                    this.renderSkins();
                } catch (restoreError) {
                    error.restoreError = restoreError;
                }
            }
            this.showError('Error loading more skins');
            console.error(error);
        } finally {
            if (requestId === this._searchRequestId) this.showLoading(false);
        }
    }

    renderSkins(append = false) {
        if (!append) {
            this._clearCardListeners();
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

        try {
            skinsToRender.forEach(skin => {
                const card = this.createSkinCard(skin);
                this.grid.appendChild(card);
            });
        } catch (error) {
            error.kind = 'render';
            throw error;
        }

        this.loadMoreBtn.style.display = this.state.hasMore ? 'block' : 'none';
    }

    createSkinCard(skin) {
        const card = document.createElement('div');
        card.className = 'mb-skin-card';
        card.dataset.skinId = skin.id;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${skin.name} por ${skin.author}`);
        card.setAttribute('aria-pressed', String(this.state.selectedSkin === skin.id));
        
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

        this._listenCard(card, 'click', () => {
            this.selectSkin(skin);
        });
        this._listenCard(card, 'keydown', event => {
            if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                event.preventDefault();
                this.selectSkin(skin);
            }
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
            card.setAttribute('aria-pressed', 'false');
        });

        // Add new selection
        const selectedCard = Array.from(this.grid.querySelectorAll('.mb-skin-card'))
            .find(card => card.dataset.skinId === String(skin.id));
        if (selectedCard) {
            selectedCard.classList.add('selected');
            selectedCard.setAttribute('aria-pressed', 'true');
        }

        this.state.selectedSkin = skin.id;
        this.onSkinSelect(skin);
        this.showToast(`Skin selected: ${skin.name}`);
    }

    showLoading(show) {
        this.state.isLoading = show;
        if (show) this._view = 'loading';
        else if (this._view === 'loading') this._view = 'results';
        this._renderView();
    }

    showError(show) {
        if (show) {
            this.state.isLoading = false;
            this._view = 'error';
        } else if (this._view === 'error') {
            this._view = 'results';
        }
        this._renderView();
    }

    showEmpty(show) {
        if (show) {
            this.state.isLoading = false;
            this._view = 'empty';
        } else if (this._view === 'empty') {
            this._view = 'results';
        }
        this._renderView();
    }

    _renderView() {
        this.loading.style.display = this._view === 'loading' ? 'block' : 'none';
        this.error.style.display = this._view === 'error' ? 'block' : 'none';
        this.empty.style.display = this._view === 'empty' ? 'block' : 'none';
        this.grid.style.display = this._view === 'results' ? 'grid' : 'none';
    }

    _restoreSearchSnapshot(shouldRender = false) {
        if (!this._searchSnapshot) return;

        this.state.skins = this._searchSnapshot.skins;
        this.state.currentPage = this._searchSnapshot.currentPage;
        this.state.hasMore = this._searchSnapshot.hasMore;
        this.state.selectedSkin = this._searchSnapshot.selectedSkin;
        this._searchSnapshot = null;

        if (shouldRender) {
            try {
                this.renderSkins();
            } catch (error) {
                console.error(error);
            }
        }
    }

    updateStatus(message) {
        this.status.textContent = message;
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'mb-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = message;
        
        if (type === 'error') {
            toast.style.background = 'var(--mb-error)';
        } else if (type === 'warning') {
            toast.style.background = 'var(--mb-warning)';
        }

        this.explorer.appendChild(toast);
        this._toasts.add(toast);
        
        this._scheduleTimeout(() => toast.classList.add('show'), 100);
        this._scheduleTimeout(() => {
            toast.classList.remove('show');
            this._scheduleTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
                this._toasts.delete(toast);
            }, 300);
        }, 3000);
    }

    reset() {
        clearTimeout(this._searchTimer);
        this._searchTimer = null;
        if (!this._searchSnapshot) {
            this._searchSnapshot = {
                skins: [...this.state.skins],
                currentPage: this.state.currentPage,
                hasMore: this.state.hasMore,
                selectedSkin: this.state.selectedSkin
            };
        }
        this.state.query = '';
        this.state.filter = 'all';
        this.state.currentPage = 1;
        this.state.skins = [];
        this.state.selectedSkin = null;
        
        this.searchInput.value = '';
        this.filterSelect.value = 'all';
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
        clearTimeout(this._searchTimer);
        this._searchTimer = null;
        this.state.query = query;
        this.searchInput.value = query;
        this.performSearch();
    }

    getSelectedSkin() {
        return this.state.skins.find(skin => skin.id === this.state.selectedSkin);
    }

    destroy() {
        this._searchRequestId++;
        this._searchSnapshot = null;
        clearTimeout(this._searchTimer);
        this._searchTimer = null;
        for (const timer of this._pendingTimers || []) clearTimeout(timer);
        if (this._pendingTimers) this._pendingTimers.clear();
        (this._eventCleanups || []).forEach(cleanup => cleanup());
        this._eventCleanups = [];
        if (this._cardCleanups) this._cardCleanups.length = 0;
        (this._toasts || new Set()).forEach(toast => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        });
        if (this._toasts) this._toasts.clear();
        if (this.explorer && this.explorer.parentNode) {
            this.explorer.parentNode.removeChild(this.explorer);
        }
        this.skinService = null;
        this.container = null;
        this.explorer = null;
        this.content = null;
        this.grid = null;
        this.loading = null;
        this.error = null;
        this.empty = null;
        this.status = null;
        this.loadMoreBtn = null;
        this.searchBtn = null;
        this.resetBtn = null;
        this.searchInput = null;
        this.filterSelect = null;
    }
}

// Export para módulos y compatibilidad global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkinExplorerUI;
} else {
    window.SkinExplorerUI = SkinExplorerUI;
}
})();
