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
            cleanText = text.replace(/<[^>]*>/g, "").replace(/Warning:[^\[\n]*/gi, "").replace(/Notice:[^\[\n]*/gi, "").replace(/Fatal error:[^\[\n]*/gi, "").replace(/<br\s*\/?>/gi, "").trim();
            if (cleanText === "0") {
              console.log("SkinService: Server returned 0 after cleaning");
              return [];
            }
            const jsonStart = cleanText.indexOf("[");
            const jsonEnd = cleanText.lastIndexOf("]");
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
              console.log("SkinService: Cleaned response using method 2");
            } else {
              const jsonMatch = cleanText.match(new RegExp("\\[.*?\\]", "s"));
              if (jsonMatch) {
                cleanText = jsonMatch[0];
                console.log("SkinService: Cleaned response using method 3 (regex)");
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
          return `${this.imageUrl}${encodeURIComponent(skinId)}.png`;
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

  // src/core/MBSkinAPI.js
  var require_MBSkinAPI = __commonJS({
    "src/core/MBSkinAPI.js"(exports, module) {
      (function() {
        function createSkinService(options = {}) {
          let SkinServiceClass;
          if (typeof module !== "undefined" && module.exports) {
            SkinServiceClass = require_SkinService();
          } else if (typeof window !== "undefined") {
            SkinServiceClass = window.SkinService;
          }
          if (typeof SkinServiceClass !== "function") {
            throw new Error("SkinService is not available");
          }
          return new SkinServiceClass(options);
        }
        class MBSkinAPI {
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
            this.skinService = createSkinService({
              apiUrl: this.config.apiUrl,
              imageUrl: this.config.imageUrl
            });
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
            this._eventCleanups = [];
            this._cardCleanups = [];
            this._pendingTimers = /* @__PURE__ */ new Set();
            this._autoLoadCount = 0;
            this._returnFocusElement = null;
            this._containerSnapshot = null;
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
          }
          createModal() {
            const modal = document.createElement("div");
            modal.id = "mb-skin-modal";
            modal.className = "mb-skin-modal";
            modal.dataset.theme = this.config.theme === "dark" ? "dark" : "light";
            modal.setAttribute("role", "dialog");
            modal.setAttribute("aria-modal", "true");
            modal.setAttribute("aria-hidden", "true");
            modal.setAttribute("aria-label", "Explorador de skins");
            modal.innerHTML = `
            <div class="mb-skin-modal-content mb-skin-api-container" tabindex="-1" data-theme="${this.config.theme === "dark" ? "dark" : "light"}">
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
            const toast = document.createElement("div");
            toast.id = "mb-skin-toast";
            toast.className = "mb-skin-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            toast.textContent = "ID Copiado";
            document.body.appendChild(modal);
            modal.appendChild(toast);
            this.modal = modal;
            this.modalContent = modal.querySelector(".mb-skin-modal-content");
            this.grid = modal.querySelector("#mb-skin-grid");
            this.searchInput = modal.querySelector(".mb-skin-search-input");
            this.filterSelect = modal.querySelector(".mb-skin-filter-select");
            this.closeBtn = modal.querySelector("#mb-skin-close");
            this.loadStatus = modal.querySelector("#mb-skin-load-status");
            this.toast = toast;
          }
          setupCustomContainer() {
            const container = typeof this.config.container === "string" ? document.querySelector(this.config.container) : this.config.container;
            if (!container) {
              console.error("MBSkinAPI: Container not found:", this.config.container);
              return;
            }
            this._containerSnapshot = {
              container,
              hadClass: container.classList.contains("mb-skin-api-container"),
              theme: container.getAttribute("data-theme"),
              appliedTheme: this.config.theme === "dark" ? "dark" : "light",
              childNodes: Array.from(container.childNodes)
            };
            container.classList.add("mb-skin-api-container");
            container.dataset.theme = this.config.theme === "dark" ? "dark" : "light";
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
            this.grid = container.querySelector("#mb-skin-grid");
            this.searchInput = container.querySelector(".mb-skin-search-input");
            this.filterSelect = container.querySelector(".mb-skin-filter-select");
            this.loadStatus = container.querySelector("#mb-skin-load-status");
            const toast = document.createElement("div");
            toast.id = "mb-skin-toast";
            toast.className = "mb-skin-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            toast.textContent = "ID Copiado";
            container.appendChild(toast);
            this.toast = toast;
            this._containerSnapshot.generatedNodes = Array.from(container.childNodes).filter((node) => !this._containerSnapshot.childNodes.includes(node));
          }
          bindEvents() {
            if (this.closeBtn) this._listen(this.closeBtn, "click", () => this.hide());
            if (this.modal) {
              this._listen(this.modal, "keydown", (event) => this.handleModalKeydown(event));
            }
            this._listen(this.searchInput, "input", (event) => {
              clearTimeout(this._searchTimer);
              this._searchTimer = setTimeout(() => {
                this._searchTimer = null;
                this.search(event.target.value);
              }, 500);
            });
            this._listen(this.filterSelect, "change", (event) => this.setFilter(event.target.value));
            if (this.config.enableInfiniteScroll && this.grid) {
              this._listen(this.grid, "scroll", () => this.handleScroll());
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
            if (!this._pendingTimers) this._pendingTimers = /* @__PURE__ */ new Set();
            const timer = setTimeout(() => {
              this._pendingTimers.delete(timer);
              callback();
            }, delay);
            this._pendingTimers.add(timer);
            return timer;
          }
          handleModalKeydown(event) {
            if (event.key === "Escape") {
              event.preventDefault();
              this.hide();
              return;
            }
            if (event.key !== "Tab" || !this.modal) return;
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
                this.grid.innerHTML = "";
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
              const data = this.state.query ? await skinService.searchSkins(this.state.query, this.state.filter, this.state.page) : await skinService.getNewSkins(this.state.page);
              if (!data || data === 0 || data.length === 0) {
                if (requestVersion !== this._requestVersion) {
                  return [];
                }
                this.state.hasMore = false;
                this._resetSnapshot = null;
                this.updateLoadStatus("Fin del cat\xE1logo");
                return [];
              }
              const filteredData = data;
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
              if (this.config.enableInfiniteScroll && this._autoLoadCount < 2) {
                const currentItems = this.grid.querySelectorAll(".mb-skin-item").length;
                if (currentItems < this.config.itemsPerPage && this.state.hasMore) {
                  this.state.isLoading = false;
                  this._autoLoadCount++;
                  this._scheduleTimeout(() => {
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
                    this.grid.innerHTML = "";
                  }
                  this.renderSkins(previousState.skins, true);
                } catch (restoreError) {
                  callbackError.restoreError = restoreError;
                }
              }
              if (!callbackError.kind) {
                callbackError.kind = callbackError instanceof SyntaxError ? "parse" : "network";
              }
              console.error("MBSkinAPI: Error fetching skins:", callbackError);
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
              item.setAttribute("role", "button");
              item.setAttribute("tabindex", "0");
              item.setAttribute("aria-label", `${skin.name} por ${skin.author}`);
              item.appendChild(canvas);
              item.appendChild(name);
              item.appendChild(author);
              this._listenCard(item, "click", () => this.selectSkin(skin));
              this._listenCard(item, "keydown", (event) => {
                if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
                  event.preventDefault();
                  this.selectSkin(skin);
                }
              });
              this.grid.appendChild(item);
              this.drawSkin(skin.id);
            });
          }
          drawSkin(id) {
            const canvas = this.grid && Array.from(this.grid.querySelectorAll("canvas")).find((candidate) => candidate.id === `mb-skin-canvas-${id}`);
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
              const canvas = this.grid && Array.from(this.grid.querySelectorAll("canvas")).find((candidate) => candidate.id === `mb-skin-canvas-${skin.id}`);
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
              if (this._toastTimer) {
                clearTimeout(this._toastTimer);
                this._pendingTimers.delete(this._toastTimer);
              }
              this._toastTimer = this._scheduleTimeout(() => {
                this.toast.style.display = "none";
                this._toastTimer = null;
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
              if (this.modal.getAttribute("aria-hidden") === "true") {
                this._returnFocusElement = document.activeElement;
              }
              this.modal.style.display = "flex";
              this.modal.setAttribute("aria-hidden", "false");
              this.searchInput.focus();
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
              this.modal.setAttribute("aria-hidden", "true");
              if (this._returnFocusElement && this._returnFocusElement.isConnected) {
                this._returnFocusElement.focus();
              }
              this._returnFocusElement = null;
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
            const apiUrlChanged = newConfig.apiUrl !== void 0 && newConfig.apiUrl !== this.config.apiUrl;
            this.config = __spreadValues(__spreadValues({}, this.config), newConfig);
            const theme = this.config.theme === "dark" ? "dark" : "light";
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
            (this._eventCleanups || []).forEach((cleanup) => cleanup());
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
              generatedNodes.forEach((node) => {
                if (node.parentNode === container) container.removeChild(node);
              });
              childNodes.forEach((node) => {
                if (node.parentNode !== container) container.insertBefore(node, container.firstChild);
              });
              if (!hadClass) container.classList.remove("mb-skin-api-container");
              if (container.getAttribute("data-theme") === appliedTheme) {
                if (theme === null) container.removeAttribute("data-theme");
                else container.setAttribute("data-theme", theme);
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
            console.log("MBSkinAPI: Skin selected:", skin);
          }
          defaultOnError(error) {
            console.error("MBSkinAPI: Error occurred:", error);
          }
        }
        if (typeof module !== "undefined" && module.exports) {
          module.exports = MBSkinAPI;
        } else {
          window.MBSkinAPI = MBSkinAPI;
        }
      })();
    }
  });

  // src/ui/SkinExplorerUI.js
  var require_SkinExplorerUI = __commonJS({
    "src/ui/SkinExplorerUI.js"(exports, module) {
      (function() {
        function createSkinService(options = {}) {
          let SkinServiceClass;
          if (typeof module !== "undefined" && module.exports) {
            SkinServiceClass = require_SkinService();
          } else if (typeof window !== "undefined") {
            SkinServiceClass = window.SkinService;
          }
          if (typeof SkinServiceClass !== "function") {
            throw new Error("SkinService is not available");
          }
          return new SkinServiceClass(options);
        }
        class SkinExplorerUI {
          constructor(options = {}) {
            this.container = options.container || document.body;
            this.skinService = options.skinService || createSkinService();
            this.onSkinSelect = options.onSkinSelect || (() => {
            });
            this.theme = options.theme || "dark";
            this.customStyles = options.customStyles || {};
            this._searchRequestId = 0;
            this._searchSnapshot = null;
            this._searchTimer = null;
            this._eventCleanups = [];
            this._cardCleanups = [];
            this._pendingTimers = /* @__PURE__ */ new Set();
            this._toasts = /* @__PURE__ */ new Set();
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
            if (!this.skinService) {
              this.skinService = createSkinService();
            }
            this.loadStyles();
            this.createUI();
            this.bindEvents();
          }
          loadStyles() {
          }
          getStyles() {
            return "";
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
            if (!this._pendingTimers) this._pendingTimers = /* @__PURE__ */ new Set();
            const timer = setTimeout(() => {
              this._pendingTimers.delete(timer);
              callback();
            }, delay);
            this._pendingTimers.add(timer);
            return timer;
          }
          createUI() {
            const explorer = document.createElement("div");
            explorer.className = "mb-explorer";
            explorer.dataset.theme = this.theme;
            explorer.setAttribute("role", "region");
            explorer.setAttribute("aria-label", "Explorador de skins");
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
                    <button class="mb-btn" id="mb-load-more" style="display: none;">Cargar m\xE1s</button>
                </div>
            </div>
        `;
            this.container.appendChild(explorer);
            this.explorer = explorer;
            this.content = explorer.querySelector(".mb-content");
            this.grid = explorer.querySelector("#mb-skins-grid");
            this.loading = explorer.querySelector("#mb-loading");
            this.error = explorer.querySelector("#mb-error");
            this.empty = explorer.querySelector("#mb-empty");
            this.status = explorer.querySelector("#mb-status");
            this.loadMoreBtn = explorer.querySelector("#mb-load-more");
            this.searchBtn = explorer.querySelector("#mb-search-btn");
            this.resetBtn = explorer.querySelector("#mb-reset-btn");
            this.searchInput = explorer.querySelector(".mb-search-input");
            this.filterSelect = explorer.querySelector(".mb-filter-select");
            for (const [selector, declarations] of Object.entries(this.customStyles)) {
              const elements = [];
              if (this.explorer.matches(selector)) elements.push(this.explorer);
              elements.push(...this.explorer.querySelectorAll(selector));
              elements.forEach((element) => {
                element.style.cssText += `${element.style.cssText ? ";" : ""}${declarations}`;
              });
            }
          }
          bindEvents() {
            this._listen(this.searchInput, "input", () => {
              clearTimeout(this._searchTimer);
              this._searchTimer = setTimeout(() => {
                this._searchTimer = null;
                this.state.query = this.searchInput.value;
                this.performSearch();
              }, 300);
            });
            this._listen(this.filterSelect, "change", () => {
              clearTimeout(this._searchTimer);
              this._searchTimer = null;
              this.state.filter = this.filterSelect.value;
              this.state.query = this.searchInput.value;
              this.performSearch();
            });
            this._listen(this.searchBtn, "click", () => {
              clearTimeout(this._searchTimer);
              this._searchTimer = null;
              this.state.query = this.searchInput.value;
              this.performSearch();
            });
            this._listen(this.resetBtn, "click", () => {
              this.reset();
            });
            this._listen(this.loadMoreBtn, "click", () => {
              this.loadMore();
            });
            const scrollContainer = this.content || this.grid;
            this._listen(scrollContainer, "scroll", () => {
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
              this._clearCardListeners();
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
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-label", `${skin.name} por ${skin.author}`);
            card.setAttribute("aria-pressed", String(this.state.selectedSkin === skin.id));
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
            this._listenCard(card, "click", () => {
              this.selectSkin(skin);
            });
            this._listenCard(card, "keydown", (event) => {
              if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
                event.preventDefault();
                this.selectSkin(skin);
              }
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
              card.setAttribute("aria-pressed", "false");
            });
            const selectedCard = Array.from(this.grid.querySelectorAll(".mb-skin-card")).find((card) => card.dataset.skinId === String(skin.id));
            if (selectedCard) {
              selectedCard.classList.add("selected");
              selectedCard.setAttribute("aria-pressed", "true");
            }
            this.state.selectedSkin = skin.id;
            this.onSkinSelect(skin);
            this.showToast(`Skin selected: ${skin.name}`);
          }
          showLoading(show) {
            this.state.isLoading = show;
            if (show) this._view = "loading";
            else if (this._view === "loading") this._view = "results";
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
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            toast.textContent = message;
            if (type === "error") {
              toast.style.background = "var(--mb-error)";
            } else if (type === "warning") {
              toast.style.background = "var(--mb-warning)";
            }
            this.explorer.appendChild(toast);
            this._toasts.add(toast);
            this._scheduleTimeout(() => toast.classList.add("show"), 100);
            this._scheduleTimeout(() => {
              toast.classList.remove("show");
              this._scheduleTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
                this._toasts.delete(toast);
              }, 300);
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
            for (const timer of this._pendingTimers || []) clearTimeout(timer);
            if (this._pendingTimers) this._pendingTimers.clear();
            (this._eventCleanups || []).forEach((cleanup) => cleanup());
            this._eventCleanups = [];
            if (this._cardCleanups) this._cardCleanups.length = 0;
            (this._toasts || /* @__PURE__ */ new Set()).forEach((toast) => {
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
        if (typeof module !== "undefined" && module.exports) {
          module.exports = SkinExplorerUI;
        } else {
          window.SkinExplorerUI = SkinExplorerUI;
        }
      })();
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
