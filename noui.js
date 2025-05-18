class NoUI {
  constructor(config = {}) {
    // Initialize component storage
    this.components = new Map();
    // Initialize translation storage
    this.translations = new Map();
    // Set current language from localStorage or config
    this.currentLang = localStorage.getItem("language") || config.defaultLang || "en";
    // Store translation change subscribers
    this.translationSubscribers = new Set();
    // Initialize MutationObserver for DOM changes
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    // Store configuration for translations
    this.config = {
      langs: config.langs || [],
      localePath: config.localePath || "assets/locale",
      defaultLang: config.defaultLang || "en"
    };
    // Run initialization
    this.init();
  }

  async init() {
    // Load translations if languages are specified
    if (this.config.langs.length) {
      await this.loadTranslations(this.config.langs, this.config.localePath);
    }
    // Observe DOM changes
    this.observer.observe(document.body, { childList: true, subtree: true });
    // Scan for components
    this.scanComponents();
  }

  async loadTranslations(langs, localePath) {
    // Load translation files for each language
    for (const lang of langs) {
      try {
        const response = await fetch(`${localePath}/${lang}.json`);
        const data = await response.json();
        this.translations.set(lang, data);
      } catch (error) {
        console.error(`Error loading translation for ${lang}:`, error);
      }
    }
    // Notify subscribers of translation changes
    this.notifyTranslationSubscribers();
  }

  setLanguage(lang) {
    // Set language if it exists in translations
    if (this.translations.has(lang)) {
      this.currentLang = lang;
      localStorage.setItem("language", lang);
      this.notifyTranslationSubscribers();
    }
  }

  t(key) {
    // Get translation for the current language
    const translations = this.translations.get(this.currentLang) || {};
    return translations[key] || key;
  }

  subscribeToLanguageChange(callback) {
    // Subscribe to language changes
    this.translationSubscribers.add(callback);
    return () => this.translationSubscribers.delete(callback);
  }

  notifyTranslationSubscribers() {
    // Notify all language change subscribers
    this.translationSubscribers.forEach((callback) => callback(this.currentLang));
  }

  registerComponent(name, component) {
    // Register a Web Component
    this.components.set(name.toLowerCase(), component);
    customElements.define(
      name.toLowerCase(),
      class extends HTMLElement {
        connectedCallback() {
          component.render(this);
        }
      }
    );
  }

  scanComponents() {
    // Scan DOM for registered components and render them
    this.components.forEach((component, name) => {
      const elements = document.querySelectorAll(name);
      elements.forEach((el) => {
        if (!el._rendered) {
          component.render(el);
          el._rendered = true;
        }
      });
    });
  }

  handleMutations(mutations) {
    // Handle DOM mutations to scan for new components
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        this.scanComponents();
      }
    });
  }

  renderPage(path, component) {
    // Render a page component into #app
    const main = document.querySelector("#app");
    if (main) {
      main.innerHTML = "";
      component.render(main);
      this.scanComponents();
    }
  }

  static createState(initialValue) {
    // Create a local reactive state
    let value = initialValue;
    const listeners = new Set();
    return {
      get value() { return value; },
      set value(newValue) {
        if (newValue !== value) {
          value = newValue;
          listeners.forEach((listener) => listener(value));
        }
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
    };
  }
}

// Global state manager with middleware support
function createStore(createState, middlewares = []) {
  let state = {};
  const listeners = new Set();

  // Wrap setState with middleware chain
  const setState = (partial) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    const newState = { ...state, ...nextState };
    
    let currentState = state;
    let update = nextState;
    
    middlewares.forEach((middleware) => {
      const result = middleware({
        getState: () => currentState,
        setState: (next) => {
          update = typeof next === 'function' ? next(currentState) : next;
          currentState = { ...currentState, ...update };
        },
        nextState: update
      });
      if (result) {
        update = result;
        currentState = { ...currentState, ...update };
      }
    });

    state = { ...state, ...update };
    listeners.forEach((listener) => listener(state));
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const store = createState(setState, getState);
  state = store.state || {};

  return {
    getState,
    setState,
    subscribe,
    ...store.actions
  };
}

// Middleware to log state changes
function loggerMiddleware({ getState, nextState }) {
  // console.log('Previous state:', getState());
  // console.log('Next state:', nextState);
  return nextState;
}

// Middleware to persist state to localStorage
function persistMiddleware({ getState, nextState }, storageKey = 'noUIState') {
  const newState = { ...getState(), ...nextState };
  localStorage.setItem(storageKey, JSON.stringify(newState));
  return nextState;
}

// Global variables
window.noUI = null; // Will be initialized in HTML
window.createStore = createStore;
window.noUIMiddlewares = { loggerMiddleware, persistMiddleware };