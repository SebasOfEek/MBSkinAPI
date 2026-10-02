(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/core/MBSkinAPI.js
  var require_MBSkinAPI = __commonJS({
    "src/core/MBSkinAPI.js"(exports, module) {
      var MBSkinAPI = class {
        constructor(options = {}) {
          this.config = {
            apiUrl: options.apiUrl || "https://mineblocks.com/1/scripts/returnSkins.php",
            imageUrl: options.imageUrl || "https://mineblocks.com/1/skins/images/",
            container: options.container || null,
            // Custom container selector or element
            useModal: options.useModal !== false,
            // Default to true for backward compatibility
            autoSaveImages: options.autoSaveImages || false,
            onSkinSelect: options.onSkinSelect || this.defaultOnSkinSelect.bind(this),
            onSkinLoad: options.onSkinLoad || null,
            onError: options.onError || this.defaultOnError.bind(this),
            theme: options.theme || "dark",
            showLoadStatus: options.showLoadStatus !== false,
            enableInfiniteScroll: options.enableInfiniteScroll !== false,
            itemsPerPage: options.itemsPerPage || 20
          };
          this.state = {
            page: 1,
            query: "",
            filter: "all",
            isLoading: false,
            hasMore: true,
            totalResults: 0,
            isSmallResultSet: false,
            skins: []
          };
          this._requestVersion = 0;
          this._resetSnapshot = null;
          this._searchTimer = null;
          this.init();
        }
        init() {
          this.injectStyles();
          if (this.config.useModal) {
            this.createModal();
          } else if (this.config.container) {
            this.setupCustomContainer();
          } else {
            console.warn("MBSkinAPI: No container specified. Use container option or set useModal to true.");
            return;
          }
          this.bindEvents();
          console.log("MBSkinAPI v2.0 initialized successfully");
        }
        injectStyles() {
          if (document.getElementById("mb-skin-api-styles")) return;
          const style = document.createElement("style");
          style.id = "mb-skin-api-styles";
          style.textContent = `
            .mb-skin-api-container {
                --mb-bg: ${this.config.theme === "dark" ? "#1a1a1a" : "#ffffff"};
                --mb-border: ${this.config.theme === "dark" ? "#333" : "#ddd"};
                --mb-text: ${this.config.theme === "dark" ? "#fff" : "#333"};
                --mb-text-secondary: ${this.config.theme === "dark" ? "#aaa" : "#666"};
                --mb-accent: ${this.config.theme === "dark" ? "#4CAF50" : "#2196F3"};
                --mb-hover: ${this.config.theme === "dark" ? "#2d2d2d" : "#f5f5f5"};
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
          const existingModal = document.getElementById("mb-skin-modal");
          if (existingModal) existingModal.remove();
          const modal = document.createElement("div");
          modal.id = "mb-skin-modal";
          modal.className = "mb-skin-modal";
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
          const toast = document.createElement("div");
          toast.id = "mb-skin-toast";
          toast.className = "mb-skin-toast";
          toast.textContent = "ID Copiado";
          document.body.appendChild(modal);
          document.body.appendChild(toast);
          this.modal = modal;
          this.grid = document.getElementById("mb-skin-grid");
          this.searchInput = modal.querySelector(".mb-skin-search-input");
          this.filterSelect = modal.querySelector(".mb-skin-filter-select");
          this.closeBtn = document.getElementById("mb-skin-close");
          this.loadStatus = document.getElementById("mb-skin-load-status");
          this.toast = toast;
        }
        setupCustomContainer() {
          const container = typeof this.config.container === "string" ? document.querySelector(this.config.container) : this.config.container;
          if (!container) {
            console.error("MBSkinAPI: Container not found:", this.config.container);
            return;
          }
          container.className += " mb-skin-api-container";
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
          this.grid = document.getElementById("mb-skin-grid");
          this.searchInput = container.querySelector(".mb-skin-search-input");
          this.filterSelect = container.querySelector(".mb-skin-filter-select");
          this.loadStatus = document.getElementById("mb-skin-load-status");
          if (!document.getElementById("mb-skin-toast")) {
            const toast = document.createElement("div");
            toast.id = "mb-skin-toast";
            toast.className = "mb-skin-toast";
            toast.textContent = "ID Copiado";
            document.body.appendChild(toast);
            this.toast = toast;
          }
        }
        bindEvents() {
          if (this.closeBtn) {
            this.closeBtn.onclick = () => this.hide();
          }
          this.searchInput.oninput = (e) => {
            clearTimeout(this._searchTimer);
            this._searchTimer = setTimeout(() => {
              this._searchTimer = null;
              this.search(e.target.value);
            }, 500);
          };
          this.filterSelect.onchange = (e) => {
            this.setFilter(e.target.value);
          };
          if (this.config.enableInfiniteScroll && this.grid) {
            this.grid.onscroll = () => this.handleScroll();
          }
        }
        async fetchSkins(reset = false) {
          if (!reset && (this.state.isLoading || !this.state.hasMore)) return;
          const requestVersion = reset ? ++this._requestVersion : this._requestVersion;
          this.state.isLoading = true;
          this.updateLoadStatus("Cargando...");
          if (reset) {
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
            if (this.grid) this.grid.innerHTML = "";
          }
          const formData = new FormData();
          formData.append("type", this.state.query ? "search" : "new");
          formData.append("page", this.state.page);
          if (this.state.query) formData.append("key", this.state.query);
          try {
            const response = await fetch(this.config.apiUrl, { method: "POST", body: formData });
            if (!response || typeof response.ok !== "boolean") {
              const responseError = new TypeError("Invalid HTTP response");
              responseError.kind = "response";
              throw responseError;
            }
            if (!response.ok) {
              const httpError = new Error(`HTTP ${response.status} ${response.statusText || ""}`.trim());
              httpError.name = "HttpError";
              httpError.kind = "http";
              httpError.status = response.status;
              throw httpError;
            }
            const text = await response.text();
            if (typeof text !== "string") {
              const responseError = new TypeError("Response body must be text");
              responseError.kind = "response";
              throw responseError;
            }
            if (text.trim() === "0") {
              if (requestVersion === this._requestVersion) {
                console.log("MBSkinAPI: No more results available");
                this.state.hasMore = false;
                this._resetSnapshot = null;
                this.updateLoadStatus("No hay m\xE1s resultados");
              }
              return [];
            }
            let cleanText = text;
            const jsonStart = text.indexOf("[");
            const jsonEnd = text.lastIndexOf("]");
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              cleanText = text.substring(jsonStart, jsonEnd + 1);
            } else {
              const jsonMatch = text.match(new RegExp("\\[.*?\\]", "s"));
              if (jsonMatch) {
                cleanText = jsonMatch[0];
              } else {
                cleanText = text.replace(/<[^>]*>/g, "").replace(/Warning:[^\[]*(?!0$)/gi, "").replace(/Notice:[^\[]*(?!0$)/gi, "").replace(/Fatal error:[^\[]*(?!0$)/gi, "").trim();
                const finalJsonMatch = cleanText.match(new RegExp("\\[.*?\\]", "s"));
                if (finalJsonMatch) {
                  cleanText = finalJsonMatch[0];
                }
              }
            }
            if (!cleanText || cleanText.trim() === "") {
              const parseError = new Error("No valid JSON content found in server response");
              parseError.kind = "parse";
              throw parseError;
            }
            if (!cleanText.startsWith("[") || !cleanText.endsWith("]")) {
              const parseError = new Error("Server response does not contain valid JSON array");
              parseError.kind = "parse";
              throw parseError;
            }
            const data = JSON.parse(cleanText);
            if (!Array.isArray(data)) {
              const validationError = new TypeError("Server response must be an array of skins");
              validationError.kind = "validation";
              throw validationError;
            }
            const invalidSkinIndex = data.findIndex(
              (skin) => !skin || typeof skin !== "object" || Array.isArray(skin) || typeof skin.id !== "string" || skin.id.length === 0 || typeof skin.name !== "string" || skin.name.length === 0 || typeof skin.author !== "string" || skin.author.length === 0
            );
            if (invalidSkinIndex !== -1) {
              const validationError = new TypeError(`Invalid skin record at index ${invalidSkinIndex}`);
              validationError.kind = "validation";
              throw validationError;
            }
            if (!data || data === 0 || data.length === 0) {
              if (requestVersion !== this._requestVersion) {
                return [];
              }
              this.state.hasMore = false;
              this._resetSnapshot = null;
              this.updateLoadStatus("Fin del cat\xE1logo");
              return [];
            }
            let filteredData = data;
            if (this.state.query && this.state.filter !== "all") {
              filteredData = data.filter(
                (s) => this.state.filter === "author" ? s.author.toLowerCase().includes(this.state.query.toLowerCase()) : s.name.toLowerCase().includes(this.state.query.toLowerCase())
              );
            }
            if (requestVersion !== this._requestVersion) {
              return filteredData;
            }
            if (reset && this.state.page === 1 && this.state.query) {
              this.state.totalResults = filteredData.length;
              this.state.isSmallResultSet = this.state.totalResults < 35;
            } else if (!this.state.query) {
              this.state.isSmallResultSet = false;
            }
            this.state.skins = reset ? filteredData : [...this.state.skins, ...filteredData];
            this.state.page++;
            try {
              this.renderSkins(filteredData, reset);
            } catch (error) {
              error.kind = "render";
              throw error;
            }
            if (reset) this._resetSnapshot = null;
            this.updateLoadStatus(this.state.hasMore ? "Desplaza para cargar m\xE1s" : "Fin del cat\xE1logo");
            if (this.config.enableInfiniteScroll) {
              const currentItems = this.grid.querySelectorAll(".mb-skin-item").length;
              if (this.state.isSmallResultSet && this.state.hasMore) {
                this.state.isLoading = false;
                setTimeout(() => {
                  if (requestVersion === this._requestVersion) this.fetchSkins();
                }, 100);
              } else if (currentItems < this.config.itemsPerPage && this.state.hasMore) {
                this.state.isLoading = false;
                setTimeout(() => {
                  if (requestVersion === this._requestVersion) this.fetchSkins();
                }, 100);
              }
            }
            if (this.config.onSkinLoad) {
              this.config.onSkinLoad(filteredData, this.state);
            }
            return filteredData;
          } catch (error) {
            if (requestVersion !== this._requestVersion) {
              return [];
            }
            if (reset && this._resetSnapshot) {
              const previousState = this._resetSnapshot;
              this._resetSnapshot = null;
              this.state.page = previousState.page;
              this.state.hasMore = previousState.hasMore;
              this.state.totalResults = previousState.totalResults;
              this.state.isSmallResultSet = previousState.isSmallResultSet;
              this.state.skins = previousState.skins;
              try {
                if (this.grid) this.grid.innerHTML = "";
                this.renderSkins(previousState.skins, true);
              } catch (restoreError) {
                error.restoreError = restoreError;
              }
            }
            if (!error.kind) {
              error.kind = error instanceof SyntaxError ? "parse" : "network";
            }
            console.error("MBSkinAPI: Error fetching skins:", error);
            this.updateLoadStatus("Error al cargar skins");
            if (this.config.onError) {
              this.config.onError(error);
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
            this.grid.innerHTML = "";
          }
          skins.forEach((skin) => {
            const item = document.createElement("div");
            item.className = "mb-skin-item";
            const canvas = document.createElement("canvas");
            canvas.id = `mb-skin-canvas-${skin.id}`;
            const name = document.createElement("span");
            name.className = "mb-skin-name";
            name.textContent = skin.name;
            const author = document.createElement("span");
            author.className = "mb-skin-author";
            author.textContent = skin.author;
            item.appendChild(canvas);
            item.appendChild(name);
            item.appendChild(author);
            item.onclick = () => this.selectSkin(skin);
            this.grid.appendChild(item);
            this.drawSkin(skin.id);
          });
        }
        drawSkin(id) {
          const canvas = document.getElementById(`mb-skin-canvas-${id}`);
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = `${this.config.imageUrl}${id}.png`;
          img.onload = () => {
            canvas.width = 16;
            canvas.height = 22;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, 16, 22, 0, 0, 16, 22);
            const imgData = ctx.getImageData(0, 0, 16, 22);
            const px = imgData.data;
            const r = px[0], g = px[1], b = px[2];
            for (let i = 0; i < px.length; i += 4) {
              if (px[i] === r && px[i + 1] === g && px[i + 2] === b) px[i + 3] = 0;
            }
            ctx.putImageData(imgData, 0, 0);
          };
          img.onerror = () => {
            console.warn(`MBSkinAPI: Failed to load skin image for ID ${id}`);
          };
        }
        async selectSkin(skin) {
          try {
            await navigator.clipboard.writeText(skin.id);
            this.showToast(`ID ${skin.id} copiado`);
            if (this.config.autoSaveImages) {
              await this.saveSkinImage(skin);
            }
            this.config.onSkinSelect(skin);
          } catch (error) {
            console.error("MBSkinAPI: Error selecting skin:", error);
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
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `skin_${skin.id}_${skin.name.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
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
            this.toast.style.display = "block";
            setTimeout(() => {
              this.toast.style.display = "none";
            }, 2e3);
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
            this.modal.style.display = "flex";
            if (this.grid && this.grid.innerHTML === "") {
              this.fetchSkins();
            }
          } else if (this.container) {
            this.container.style.display = "block";
            if (this.grid && this.grid.innerHTML === "") {
              this.fetchSkins();
            }
          }
        }
        hide() {
          if (this.modal) {
            this.modal.style.display = "none";
          } else if (this.container) {
            this.container.style.display = "none";
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
          this.state.query = "";
          if (this.searchInput) {
            this.searchInput.value = "";
          }
          return this.fetchSkins(true);
        }
        getState() {
          return __spreadValues({}, this.state);
        }
        getConfig() {
          return __spreadValues({}, this.config);
        }
        updateConfig(newConfig) {
          this.config = __spreadValues(__spreadValues({}, this.config), newConfig);
        }
        destroy() {
          this._requestVersion++;
          this._resetSnapshot = null;
          clearTimeout(this._searchTimer);
          this._searchTimer = null;
          if (this.modal) {
            this.modal.remove();
          }
          const styles = document.getElementById("mb-skin-api-styles");
          if (styles) {
            styles.remove();
          }
          if (this.toast) {
            this.toast.remove();
          }
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
          console.log("MBSkinAPI: Skin selected:", skin);
        }
        defaultOnError(error) {
          console.error("MBSkinAPI: Error occurred:", error);
        }
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = MBSkinAPI;
      } else {
        window.MBSkinAPI = MBSkinAPI;
      }
    }
  });

  // src/services/SkinService.js
  var require_SkinService = __commonJS({
    "src/services/SkinService.js"(exports, module) {
      var SkinService = class {
        constructor(options = {}) {
          this.apiUrl = options.apiUrl || "https://mineblocks.com/1/scripts/returnSkins.php";
          this.imageUrl = options.imageUrl || "https://mineblocks.com/1/skins/images/";
          this.cache = /* @__PURE__ */ new Map();
          this.cacheTimeout = options.cacheTimeout || 3e5;
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
          if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
              return cached.data;
            }
          }
          const formData = new FormData();
          formData.append("type", params.type || "new");
          formData.append("page", params.page || 1);
          if (params.key) formData.append("key", params.key);
          try {
            const response = await fetch(this.apiUrl, { method: "POST", body: formData });
            if (!response || typeof response.ok !== "boolean") {
              const responseError = new TypeError("Invalid HTTP response");
              responseError.kind = "response";
              throw responseError;
            }
            if (!response.ok) {
              const httpError = new Error(`HTTP ${response.status} ${response.statusText || ""}`.trim());
              httpError.name = "HttpError";
              httpError.kind = "http";
              httpError.status = response.status;
              throw httpError;
            }
            const text = await response.text();
            if (typeof text !== "string") {
              const responseError = new TypeError("Response body must be text");
              responseError.kind = "response";
              throw responseError;
            }
            if (text.trim() === "0") {
              return [];
            }
            let cleanText = text;
            const jsonStart = text.indexOf("[");
            const jsonEnd = text.lastIndexOf("]");
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              cleanText = text.substring(jsonStart, jsonEnd + 1);
              console.log("SkinService: Cleaned response using method 1");
            } else {
              const jsonMatch = text.match(new RegExp("\\[.*?\\]", "s"));
              if (jsonMatch) {
                cleanText = jsonMatch[0];
                console.log("SkinService: Cleaned response using method 2");
              } else {
                cleanText = text.replace(/<[^>]*>/g, "").replace(/Warning:[^\[]*/gi, "").replace(/Notice:[^\[]*/gi, "").replace(/Fatal error:[^\[]*/gi, "").trim();
                const finalJsonMatch = cleanText.match(new RegExp("\\[.*?\\]", "s"));
                if (finalJsonMatch) {
                  cleanText = finalJsonMatch[0];
                  console.log("SkinService: Cleaned response using method 3 (with regex)");
                } else {
                  console.log("SkinService: Cleaned response using method 3 (final)");
                }
              }
            }
            if (!cleanText || cleanText.trim() === "") {
              console.warn("SkinService: No valid JSON content found after cleaning");
              const parseError = new Error("No valid JSON content found in server response");
              parseError.kind = "parse";
              throw parseError;
            }
            if (!cleanText.startsWith("[") || !cleanText.endsWith("]")) {
              console.warn("SkinService: Cleaned text does not appear to be valid JSON array");
              const parseError = new Error("Server response does not contain valid JSON array");
              parseError.kind = "parse";
              throw parseError;
            }
            console.log("SkinService: Original response length:", text.length);
            console.log("SkinService: Cleaned response length:", cleanText.length);
            console.log("SkinService: Cleaned response preview:", cleanText.substring(0, 100));
            const data = JSON.parse(cleanText);
            if (!data || data === 0) {
              return [];
            }
            if (!Array.isArray(data)) {
              const validationError = new TypeError("Server response must be an array of skins");
              validationError.kind = "validation";
              throw validationError;
            }
            const invalidSkinIndex = data.findIndex((skin) => !this.isValidSkin(skin));
            if (invalidSkinIndex !== -1) {
              const validationError = new TypeError(`Invalid skin record at index ${invalidSkinIndex}`);
              validationError.kind = "validation";
              throw validationError;
            }
            this.cache.set(cacheKey, {
              data: Array.isArray(data) ? data : [],
              timestamp: Date.now()
            });
            return Array.isArray(data) ? data : [];
          } catch (error) {
            const wrappedError = new Error("Could not load skins");
            wrappedError.kind = error.kind || (error instanceof SyntaxError ? "parse" : "network");
            wrappedError.cause = error;
            if (error.status !== void 0) {
              wrappedError.status = error.status;
            }
            console.error("Error fetching skins:", wrappedError);
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
        async searchSkins(query, filter = "all", page = 1) {
          const skins = await this.fetchSkins({
            type: "search",
            key: query,
            page
          });
          if (filter === "all" || !query) {
            return skins;
          }
          return skins.filter((skin) => {
            const searchTerm = query.toLowerCase();
            if (filter === "author") {
              return skin.author.toLowerCase().includes(searchTerm);
            } else if (filter === "name") {
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
          return this.fetchSkins({ type: "new", page });
        }
        /**
         * Filters skins locally
         * @param {Array} skins - Array of skins
         * @param {string} query - Search term
         * @param {string} filter - Filter type
         * @returns {Array} - Filtered array
         */
        filterSkins(skins, query, filter = "all") {
          if (!query || filter === "all") {
            return skins;
          }
          const searchTerm = query.toLowerCase();
          return skins.filter((skin) => {
            if (filter === "author") {
              return skin.author.toLowerCase().includes(searchTerm);
            } else if (filter === "name") {
              return skin.name.toLowerCase().includes(searchTerm);
            }
            return skin.name.toLowerCase().includes(searchTerm) || skin.author.toLowerCase().includes(searchTerm);
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
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            const contextError = new Error("Canvas 2D context is unavailable");
            contextError.kind = "render";
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
                  if (px[i] === r && px[i + 1] === g && px[i + 2] === b) {
                    px[i + 3] = 0;
                  }
                }
                ctx.putImageData(imgData, 0, 0);
                resolve();
              } catch (error) {
                error.kind = "render";
                reject(error);
              }
            };
            img.onerror = () => {
              console.error(`Error loading skin image: ${skinId}`);
              const imageError = new Error(`Could not load skin image ${skinId}`);
              imageError.name = "ImageLoadError";
              imageError.kind = "image";
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
          return `${params.type || "new"}_${params.page || 1}_${params.key || ""}`;
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
          return skin && typeof skin.id === "string" && typeof skin.name === "string" && typeof skin.author === "string" && skin.id.length > 0 && skin.name.length > 0 && skin.author.length > 0;
        }
        /**
         * Searches for similar skins by author
         * @param {string} author - Author name
         * @param {number} limit - Result limit
         * @returns {Promise<Array>} - Array of author's skins
         */
        async getSkinsByAuthor(author, limit = 50) {
          const skins = await this.searchSkins(author, "author");
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
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = SkinService;
      } else {
        window.SkinService = SkinService;
      }
    }
  });

  // src/ui/SkinExplorerUI.js
  var require_SkinExplorerUI = __commonJS({
    "src/ui/SkinExplorerUI.js"(exports, module) {
      var SkinExplorerUI = class {
        constructor(options = {}) {
          this.container = options.container || document.body;
          this.skinService = options.skinService;
          this.onSkinSelect = options.onSkinSelect || (() => {
          });
          this.theme = options.theme || "dark";
          this.customStyles = options.customStyles || {};
          this._searchRequestId = 0;
          this._searchSnapshot = null;
          this._searchTimer = null;
          this._view = "results";
          this.state = {
            skins: [],
            filteredSkins: [],
            isLoading: false,
            hasMore: true,
            currentPage: 1,
            query: "",
            filter: "all",
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
          if (document.getElementById("mb-ui-styles")) return;
          const style = document.createElement("style");
          style.id = "mb-ui-styles";
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
          let customCSS = "";
          for (const [property, value] of Object.entries(this.customStyles)) {
            customCSS += `${property} { ${value} }
`;
          }
          return baseStyles + customCSS;
        }
        createUI() {
          const explorer = document.createElement("div");
          explorer.className = "mb-explorer";
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
                    <button class="mb-btn" id="mb-load-more" style="display: none;">Cargar m\xE1s</button>
                </div>
            </div>
        `;
          this.container.appendChild(explorer);
          this.explorer = explorer;
          this.content = explorer.querySelector(".mb-content");
          this.grid = document.getElementById("mb-skins-grid");
          this.loading = document.getElementById("mb-loading");
          this.error = document.getElementById("mb-error");
          this.empty = document.getElementById("mb-empty");
          this.status = document.getElementById("mb-status");
          this.loadMoreBtn = document.getElementById("mb-load-more");
          this.searchInput = explorer.querySelector(".mb-search-input");
          this.filterSelect = explorer.querySelector(".mb-filter-select");
        }
        bindEvents() {
          this.searchInput.addEventListener("input", () => {
            clearTimeout(this._searchTimer);
            this._searchTimer = setTimeout(() => {
              this._searchTimer = null;
              this.state.query = this.searchInput.value;
              this.performSearch();
            }, 300);
          });
          this.filterSelect.addEventListener("change", () => {
            clearTimeout(this._searchTimer);
            this._searchTimer = null;
            this.state.filter = this.filterSelect.value;
            this.state.query = this.searchInput.value;
            this.performSearch();
          });
          document.getElementById("mb-search-btn").addEventListener("click", () => {
            clearTimeout(this._searchTimer);
            this._searchTimer = null;
            this.state.query = this.searchInput.value;
            this.performSearch();
          });
          document.getElementById("mb-reset-btn").addEventListener("click", () => {
            this.reset();
          });
          this.loadMoreBtn.addEventListener("click", () => {
            this.loadMore();
          });
          const scrollContainer = this.content || this.grid;
          scrollContainer.addEventListener("scroll", () => {
            if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 100) {
              this.loadMore();
            }
          });
        }
        async performSearch() {
          const requestId = ++this._searchRequestId;
          if (!this.skinService) {
            this._restoreSearchSnapshot();
            this.showError("SkinService not configured");
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
            const skins = this.state.query ? await this.skinService.searchSkins(this.state.query, this.state.filter, 1) : await this.skinService.getNewSkins(1);
            if (requestId !== this._searchRequestId) return;
            this.state.skins = skins;
            this.state.hasMore = skins.length > 0;
            this.renderSkins();
            this._searchSnapshot = null;
            this.updateStatus(`Se encontraron ${skins.length} skins`);
          } catch (error) {
            if (requestId !== this._searchRequestId) return;
            this._restoreSearchSnapshot(error.kind === "render");
            this.showError("Error searching skins");
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
            const skins = this.state.query ? await this.skinService.searchSkins(this.state.query, this.state.filter, requestedPage) : await this.skinService.getNewSkins(requestedPage);
            if (requestId !== this._searchRequestId) return;
            if (skins.length === 0) {
              this.state.hasMore = false;
              this.renderSkins(true);
              this.updateStatus("Fin del cat\xE1logo");
            } else {
              this.state.skins.push(...skins);
              this.renderSkins(true);
              this.updateStatus(`Se encontraron ${this.state.skins.length} skins`);
            }
          } catch (error) {
            if (requestId !== this._searchRequestId) return;
            this.state.currentPage = previousPage;
            if (error.kind === "render") {
              this.state.skins = previousSkins;
              try {
                this.renderSkins();
              } catch (restoreError) {
                error.restoreError = restoreError;
              }
            }
            this.showError("Error loading more skins");
            console.error(error);
          } finally {
            if (requestId === this._searchRequestId) this.showLoading(false);
          }
        }
        renderSkins(append = false) {
          if (!append) {
            this.grid.innerHTML = "";
          }
          const skinsToRender = append ? this.state.skins.slice(this.grid.children.length) : this.state.skins;
          if (skinsToRender.length === 0 && !append) {
            this.showEmpty(true);
            return;
          }
          this.showEmpty(false);
          try {
            skinsToRender.forEach((skin) => {
              const card = this.createSkinCard(skin);
              this.grid.appendChild(card);
            });
          } catch (error) {
            error.kind = "render";
            throw error;
          }
          this.loadMoreBtn.style.display = this.state.hasMore ? "block" : "none";
        }
        createSkinCard(skin) {
          const card = document.createElement("div");
          card.className = "mb-skin-card";
          card.dataset.skinId = skin.id;
          if (this.state.selectedSkin === skin.id) {
            card.classList.add("selected");
          }
          const canvas = document.createElement("canvas");
          canvas.className = "mb-skin-canvas";
          canvas.width = 16;
          canvas.height = 22;
          const name = document.createElement("div");
          name.className = "mb-skin-name";
          name.textContent = skin.name;
          name.title = skin.name;
          const author = document.createElement("div");
          author.className = "mb-skin-author";
          author.textContent = skin.author;
          card.appendChild(canvas);
          card.appendChild(name);
          card.appendChild(author);
          card.addEventListener("click", () => {
            this.selectSkin(skin);
          });
          if (this.skinService) {
            this.skinService.drawSkin(skin.id, canvas).catch((error) => {
              console.error(`Error drawing skin ${skin.id}:`, error);
            });
          }
          return card;
        }
        selectSkin(skin) {
          this.grid.querySelectorAll(".mb-skin-card").forEach((card) => {
            card.classList.remove("selected");
          });
          const selectedCard = Array.from(this.grid.querySelectorAll(".mb-skin-card")).find((card) => card.dataset.skinId === String(skin.id));
          if (selectedCard) {
            selectedCard.classList.add("selected");
          }
          this.state.selectedSkin = skin.id;
          this.onSkinSelect(skin);
          this.showToast(`Skin selected: ${skin.name}`);
        }
        showLoading(show) {
          this.state.isLoading = show;
          if (show) this._view = "loading";
          this._renderView();
        }
        showError(show) {
          if (show) {
            this.state.isLoading = false;
            this._view = "error";
          } else if (this._view === "error") {
            this._view = "results";
          }
          this._renderView();
        }
        showEmpty(show) {
          if (show) {
            this.state.isLoading = false;
            this._view = "empty";
          } else if (this._view === "empty") {
            this._view = "results";
          }
          this._renderView();
        }
        _renderView() {
          this.loading.style.display = this._view === "loading" ? "block" : "none";
          this.error.style.display = this._view === "error" ? "block" : "none";
          this.empty.style.display = this._view === "empty" ? "block" : "none";
          this.grid.style.display = this._view === "results" ? "grid" : "none";
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
        showToast(message, type = "success") {
          const toast = document.createElement("div");
          toast.className = "mb-toast";
          toast.textContent = message;
          if (type === "error") {
            toast.style.background = "var(--mb-error)";
          } else if (type === "warning") {
            toast.style.background = "var(--mb-warning)";
          }
          document.body.appendChild(toast);
          setTimeout(() => toast.classList.add("show"), 100);
          setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => document.body.removeChild(toast), 300);
          }, 3e3);
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
          this.state.query = "";
          this.state.filter = "all";
          this.state.currentPage = 1;
          this.state.skins = [];
          this.state.selectedSkin = null;
          this.searchInput.value = "";
          this.filterSelect.value = "all";
          this.updateStatus("Listo");
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
          return this.state.skins.find((skin) => skin.id === this.state.selectedSkin);
        }
        destroy() {
          this._searchRequestId++;
          this._searchSnapshot = null;
          clearTimeout(this._searchTimer);
          this._searchTimer = null;
          if (this.explorer && this.explorer.parentNode) {
            this.explorer.parentNode.removeChild(this.explorer);
          }
        }
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = SkinExplorerUI;
      } else {
        window.SkinExplorerUI = SkinExplorerUI;
      }
    }
  });

  // src/index.js
  var require_index = __commonJS({
    "src/index.js"() {
      var import_MBSkinAPI = __toESM(require_MBSkinAPI());
      var import_SkinService = __toESM(require_SkinService());
      var import_SkinExplorerUI = __toESM(require_SkinExplorerUI());
      window.MBSkinAPI = import_MBSkinAPI.default;
      window.SkinService = import_SkinService.default;
      window.SkinExplorerUI = import_SkinExplorerUI.default;
    }
  });
  require_index();
})();
