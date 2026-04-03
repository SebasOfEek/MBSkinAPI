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
