/*
 * MBSkinAPI - Main module for exploring Mine Blocks skins
 * @author SebasOfEek
 * @version 2.0.0
 */

// Import dependencies (for modular development)
// import SkinService from '../services/SkinService.js';
// import SkinExplorerUI from '../ui/SkinExplorerUI.js';

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
                    <input type="text" id="mb-search" placeholder="Buscar skin...">
                    <select id="mb-filter">
                        <option value="all">Todo</option>
                        <option value="name">Nombre</option>
                        <option value="author">Autor</option>
                    </select>
                    <span class="mb-close" id="mb-close">&times;</span>
                </div>
                <div id="mb-grid" class="mb-grid"></div>
                <div id="mb-load-status">Cargando...</div>
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

// Export para módulos y compatibilidad global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MBSkinAPI;
} else {
    window.MBSkinAPI = MBSkinAPI;
}
