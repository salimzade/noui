# NoUI Documentation

## Introduction

`NoUI` is a lightweight, pure JavaScript framework for building traditional web applications (non-SPA) with server-side routing. It leverages Web Components, internationalization (i18n), and two state management solutions: a local reactive `createState` and a global centralized `createStore` (inspired by Zustand). Designed for simplicity and readability, `NoUI` requires no build tools and works by including two scripts in your HTML.

### Key Features
- **Server-side routing**: Clean URLs (`/`, `/about`, `/contact`) without `.html`, no `Cannot GET` errors on refresh.
- **Web Components**: Reusable, encapsulated UI components.
- **Internationalization (i18n)**: Multi-language support with configurable JSON-based translations.
- **Dual state management**:
  - `createState`: Local, reactive state for simple, isolated components.
  - `createStore`: Global, centralized state with actions and middleware support, inspired by Zustand.
- **No build required**: Pure JavaScript, works with `<script>` tags.
- **Readable code**: Full, descriptive variable and method names (e.g., `registerComponent`, `translations`).
- **English comments**: All code comments are in English for international accessibility.

## Quick Start

Get started with `NoUI` in 5 minutes.

### Prerequisites
- A web server (e.g., Python's `http.server`, Apache, or any static file server).
- A modern browser with Web Components support (polyfill included via CDN).

### Steps
1. **Create project structure**:
   ```
   noui/
   ├── assets/
   │   └── locale/
   │       ├── en.json
   │       ├── az.json
   │       ├── ru.json
   ├── noui.js
   ├── components.js
   ├── index.html
   ├── about.html
   ├── contact.html
   ├── server.py
   ```

2. **Download files**:
   - Copy `noui.js`, `components.js`, `index.html`, `about.html`, `contact.html`, and `assets/locale/*.json` from the provided code (see project repository or code snippets).
   - Configure translations in each HTML file (e.g., `index.html`):
     ```html
     <script>
       // Initialize NoUI with translation configuration
       window.noUI = new NoUI({
         langs: ["en", "az", "ru"],
         localePath: "assets/locale",
         defaultLang: "en"
       });
     </script>
     ```
   - Create `server.py` for local testing:
     ```python
     import http.server
     import socketserver

     PORT = 8000

     class Handler(http.server.SimpleHTTPRequestHandler):
         def do_GET(self):
             if self.path == "/":
                 self.path = "/index.html"
             elif self.path == "/about":
                 self.path = "/about.html"
             elif self.path == "/contact":
                 self.path = "/contact.html"
             return http.server.SimpleHTTPRequestHandler.do_GET(self)

     with socketserver.TCPServer(("", PORT), Handler) as httpd:
         print(f"Serving at http://localhost:{PORT}")
         httpd.serve_forever()
     ```

3. **Run the server**:
   ```bash
   python3 server.py
   ```

4. **Open in browser**:
   - Visit `http://localhost:8000/`.
   - Navigate to `/about` and `/contact`.
   - Test features: click buttons, switch languages, check global state persistence in `localStorage`.

5. **Verify**:
   - Home page (`/`): Shows "Welcome to Home".
   - About page (`/about`): Shows "About Us".
   - Contact page (`/contact`): Shows global state (count, message) with middleware logging and persistence.
   - Refresh any page → No `Cannot GET` errors.
   - Language switcher: Changes text across pages.
   - Console: Logs state changes (via `loggerMiddleware`).
   - `localStorage`: Stores global state (via `persistMiddleware`).

## Setup

### Project Structure
- `noui.js`: Core framework (class `NoUI`, `createState`, `createStore`, middleware).
- `components.js`: Web Components and page logic.
- `index.html`, `about.html`, `contact.html`: HTML files for each route, with translation configuration.
- `assets/locale/*.json`: Translation files (`en.json`, `az.json`, `ru.json`).
- `server.py`: Optional Python server for local testing.

### Translation Configuration
Configure translations in each HTML file via `<script>` before loading `components.js`:
```html
<script src="noui.js"></script>
<script>
  // Initialize NoUI with translation configuration
  window.noUI = new NoUI({
    langs: ["en", "az", "ru"], // List of languages
    localePath: "assets/locale", // Path to translation files
    defaultLang: "en" // Default language
  });
</script>
<script src="components.js"></script>
```

- `langs`: Array of language codes (e.g., `["en", "fr"]`).
- `localePath`: Directory or URL for `.json` files (e.g., `assets/locale/en.json`).
- `defaultLang`: Fallback language if none saved in `localStorage`.

### Server Configuration
To support clean URLs (`/about` instead of `/about.html`), configure your server:

#### Local Testing (Python)
Use `server.py` (see Quick Start) to map:
- `/` → `index.html`
- `/about` → `about.html`
- `/contact` → `contact.html`

Run:
```bash
python3 server.py
```

#### Production (Apache)
Create `.htaccess` in the `noui/` folder:
```
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^about$ about.html [L]
RewriteRule ^contact$ contact.html [L]
RewriteRule ^$ index.html [L]
```

Ensure Apache has `mod_rewrite` enabled.

#### Other Servers
- **Nginx**:
  ```nginx
  server {
      listen 80;
      root /path/to/noui;
      index index.html;
      location / {
          try_files $uri $uri.html /index.html;
      }
  }
  ```
- **Node.js (Express)**:
  ```javascript
  const express = require('express');
  const app = express();
  app.use(express.static('noui'));
  app.get('/about', (req, res) => res.sendFile('about.html', { root: 'noui' }));
  app.get('/contact', (req, res) => res.sendFile('contact.html', { root: 'noui' }));
  app.get('/', (req, res) => res.sendFile('index.html', { root: 'noui' }));
  app.listen(8000);
  ```

### Dependencies
- Web Components polyfill (loaded via CDN in HTML):
  ```html
  <script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.8.0/webcomponents-bundle.js"></script>
  ```
- No other dependencies required.

## Creating Pages

Each page in `NoUI` corresponds to an HTML file (`index.html`, `about.html`, etc.) and a component in `components.js`.

### Adding a New Page
1. **Create HTML file** (e.g., `blog.html`):
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>NoUI Demo - Blog</title>
     <script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.8.0/webcomponents-bundle.js"></script>
   </head>
   <body>
     <div id="app"></div>
     <script src="noui.js"></script>
     <script>
       // Initialize NoUI with translation configuration
       window.noUI = new NoUI({
         langs: ["en", "az", "ru"],
         localePath: "assets/locale",
         defaultLang: "en"
       });
     </script>
     <script src="components.js"></script>
   </body>
   </html>
   ```

2. **Add component** in `components.js`:
   ```javascript
   // Blog page component
   const BlogComponent = {
     render(element) {
       element.innerHTML = `
         <no-lang-switcher></no-lang-switcher>
         <no-header></no-header>
         <div>
           <h2>${noUI.t("blog.title")}</h2>
           <p>${noUI.t("blog.description")}</p>
           <a href="/">Go to Home</a>
         </div>
         <no-footer></no-footer>`;
     }
   };
   ```

3. **Update routes** in `components.js` (in `renderPage`):
   ```javascript
   // Route configuration
   const routes = {
     "/": HomeComponent,
     "/about": AboutComponent,
     "/contact": ContactComponent,
     "/blog": BlogComponent
   };
   ```

4. **Update translations** (e.g., `en.json`):
   ```json
   {
     "blog.title": "Blog",
     "blog.description": "This is the blog page."
   }
   ```

5. **Update server**:
   - In `server.py`:
     ```python
     elif self.path == "/blog":
         self.path = "/blog.html"
     ```
   - In `.htaccess`:
     ```apache
     RewriteRule ^blog$ blog.html [L]
     ```

6. **Test**:
   - Visit `http://localhost:8000/blog`.
   - Verify content, components, and translations.

## Creating Components

`NoUI` uses Web Components for reusable UI elements.

### Adding a New Component
1. **Define component** in `components.js`:
   ```javascript
   // Sidebar component
   const SidebarComponent = {
     render(element) {
       element.innerHTML = `
         <div>
           <h3>Sidebar</h3>
           <p>${noUI.t("sidebar.text")}</p>
         </div>`;
     }
   };
   ```

2. **Register component**:
   ```javascript
   // Register Sidebar component
   noUI.registerComponent("no-sidebar", SidebarComponent);
   ```

3. **Use in pages** (e.g., in `HomeComponent`):
   ```javascript
   // Home page component
   const HomeComponent = {
     render(element) {
       element.innerHTML = `
         <no-lang-switcher></no-lang-switcher>
         <no-header></no-header>
         <no-sidebar></no-sidebar>
         <div>
           <h2>${noUI.t("home.title")}</h2>
           <p>${noUI.t("home.description")}</p>
         </div>
         <no-footer></no-footer>`;
     }
   };
   ```

4. **Add translations** (e.g., `en.json`):
   ```json
   {
     "sidebar.text": "This is the sidebar."
   }
   ```

5. **Test**:
   - Open a page using the component.
   - Verify rendering and translations.

### Component with State
Use `createState` for local state:
```javascript
// Counter component with local state
const CounterComponent = {
  render(element) {
    const state = noUI.constructor.createState(0);
    const update = () => {
      element.innerHTML = `
        <div>
          <p>Count: ${state.value}</p>
          <button id="increment">Increment</button>
        </div>`;
      element.querySelector("#increment")?.addEventListener("click", () => state.value++);
    };
    state.subscribe(update);
    update();
  }
};
// Register Counter component
noUI.registerComponent("no-counter", CounterComponent);
```

## State Management

`NoUI` offers two state management solutions: `createState` (local, reactive) and `createStore` (global, centralized, with middleware support).

### Local State: `createState`
- **Purpose**: Simple, isolated state for individual components.
- **API**:
  - `createState(initialValue)`: Creates a reactive state object.
  - `state.value`: Get or set the current value.
  - `state.subscribe(listener)`: Subscribe to changes.
- **Example**:
  ```javascript
  // Create a reactive state
  const state = noUI.constructor.createState(0);
  state.subscribe((value) => console.log(`Count: ${value}`));
  state.value = 1; // Logs: Count: 1
  ```

- **Use case**:
  ```javascript
  // Header component with local state
  const HeaderComponent = {
    render(element) {
      const state = noUI.constructor.createState(0);
      const update = () => {
        element.innerHTML = `
          <p>Count: ${state.value}</p>
          <button id="increment">Increment</button>`;
        element.querySelector("#increment")?.addEventListener("click", () => state.value++);
      };
      state.subscribe(update);
      update();
    }
  };
  ```

### Global State: `createStore`
- **Purpose**: Centralized state for sharing data across components, with actions and middleware.
- **API**:
  - `createStore(createState, middlewares = [])`: Creates a store with state, actions, and optional middleware.
  - `store.getState()`: Returns current state.
  - `store.setState(partial)`: Updates state (object or function).
  - `store.subscribe(listener)`: Subscribes to state changes.
  - `store.actionName()`: Calls an action (defined in `createState`).
- **Example**:
  ```javascript
  // Create a global store with middleware
  const useStore = createStore(
    (set, get) => ({
      state: { count: 0, text: "Hello" },
      actions: {
        increment: () => set({ count: get().count + 1 }),
        updateText: (text) => set({ text })
      }
    }),
    [noUIMiddlewares.loggerMiddleware]
  );
  useStore.subscribe((state) => console.log(state));
  useStore.increment(); // Logs previous and next state, then: { count: 1, text: "Hello" }
  useStore.updateText("Hi"); // Logs previous and next state, then: { count: 1, text: "Hi" }
  ```

- **Use case**:
  ```javascript
  // Contact component with global state
  const ContactComponent = {
    render(element) {
      const update = () => {
        const { count, message } = useGlobalStore.getState();
        element.innerHTML = `
          <p>Global Count: ${count}</p>
          <button id="increment">Increment</button>`;
        element.querySelector("#increment")?.addEventListener("click", () => useGlobalStore.increment());
      };
      useGlobalStore.subscribe(update);
      update();
    }
  };
  ```

### Middleware for `createStore`
- **Purpose**: Intercept and modify state updates (e.g., logging, persistence, async handling).
- **API**:
  - Middleware is a function that receives `{ getState, setState, nextState }` and returns `nextState` or nothing.
  - Passed as an array to `createStore(createState, middlewares)`.
- **Built-in Middleware**:
  - `noUIMiddlewares.loggerMiddleware`: Logs previous and next state to console.
  - `noUIMiddlewares.persistMiddleware`: Saves state to `localStorage` (default key: `noUIState`).
- **Example**:
  ```javascript
  // Create a store with logging and persistence
  const useStore = createStore(
    (set, get) => ({
      state: { count: 0 },
      actions: { increment: () => set({ count: get().count + 1 }) }
    }),
    [noUIMiddlewares.loggerMiddleware, noUIMiddlewares.persistMiddleware]
  );
  // Logs state changes and saves to localStorage
  useStore.increment();
  ```

- **Custom Middleware**:
  ```javascript
  // Middleware for async actions
  const asyncMiddleware = ({ getState, setState, nextState }) => {
    if (nextState.asyncAction) {
      fetch('/api/data').then((data) => setState({ data }));
      return null; // Prevent immediate state update
    }
    return nextState;
  };
  // Create a store with async middleware
  const useStore = createStore(
    (set, get) => ({
      state: { data: null },
      actions: { fetchData: () => set({ asyncAction: true }) }
    }),
    [asyncMiddleware]
  );
  ```

## Routing

`NoUI` uses server-side routing with clean URLs (`/`, `/about`, `/contact`).

### How It Works
- Each route corresponds to an HTML file (`index.html`, `about.html`, `contact.html`).
- Server maps URLs to files (e.g., `/about` → `about.html`).
- `components.js` renders the appropriate component based on `location.pathname`:
  ```javascript
  // Route configuration
  const routes = {
    "/": HomeComponent,
    "/about": AboutComponent,
    "/contact": ContactComponent
  };
  noUI.renderPage(path, routes[path] || routes["/"]);
  ```

### Adding a New Route
See "Creating Pages" section.

### Server Configuration
See "Setup" section for Python, Apache, Nginx, or Express configurations.

## API Reference

### Class: `NoUI`
- **Constructor**: `new NoUI(config)`
  - Initializes components, translations, and MutationObserver.
  - Stored in `window.noUI`.
  - `config`:
    - `langs`: Array of language codes (default: `[]`).
    - `localePath`: Path to translation files (default: `assets/locale`).
    - `defaultLang`: Default language (default: `en`).
  - Example:
    ```javascript
    // Initialize NoUI with translation configuration
    window.noUI = new NoUI({
      langs: ["en", "fr"],
      localePath: "assets/translations",
      defaultLang: "en"
    });
    ```

- **Methods**:
  - `init()`: Loads translations and sets up component scanning.
  - `loadTranslations(langs, localePath)`: Loads JSON translation files.
    - Example: `noUI.loadTranslations(["fr"], "assets/translations")`.
  - `setLanguage(lang)`: Sets the active language and saves to `localStorage`.
    - Example: `noUI.setLanguage("az")`.
  - `t(key)`: Returns translated string for the current language.
    - Example: `noUI.t("home.title")` → "Welcome to Home".
  - `subscribeToLanguageChange(callback)`: Subscribes to language changes.
    - Example: `noUI.subscribeToLanguageChange(() => render())`.
  - `registerComponent(name, component)`: Registers a Web Component.
    - Example: `noUI.registerComponent("no-header", HeaderComponent)`.
  - `scanComponents()`: Scans DOM for registered components and renders them.
  - `renderPage(path, component)`: Renders a component into `#app`.
    - Example: `noUI.renderPage("/about", AboutComponent)`.

### Static Method: `createState`
- `NoUI.createState(initialValue)`: Creates a local reactive state.
- See "State Management" for details.

### Function: `createStore`
- `createStore(createState, middlewares = [])`: Creates a global state store with optional middleware.
- See "State Management" for details.

### Middleware
- `noUIMiddlewares.loggerMiddleware`: Logs state changes.
- `noUIMiddlewares.persistMiddleware`: Persists state to `localStorage`.
- See "Middleware for `createStore`" for details.

## Advanced Techniques

### Dynamic Translations
Load additional languages dynamically:
```javascript
// Load French translations dynamically
noUI.loadTranslations(["fr"], "assets/translations").then(() => {
  noUI.setLanguage("fr");
});
```
Add `fr.json` to `assets/translations/`:
```json
{
  "home.title": "Bienvenue"
}
```

### Global State Across Pages
Share `useGlobalStore` across all pages:
```javascript
// Create a global store with persistence
const useGlobalStore = createStore(
  (set, get) => ({
    state: { theme: "light" },
    actions: {
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" })
    }
  }),
  [noUIMiddlewares.persistMiddleware]
);
// Theme component using global state
const ThemeComponent = {
  render(element) {
    const update = () => {
      const { theme } = useGlobalStore.getState();
      element.innerHTML = `
        <p>Theme: ${theme}</p>
        <button id="toggle">Toggle Theme</button>`;
      element.querySelector("#toggle")?.addEventListener("click", () => useGlobalStore.toggleTheme());
    };
    useGlobalStore.subscribe(update);
    update();
  }
};
```

### Optimizing Component Rendering
Avoid redundant renders by checking state changes:
```javascript
// Optimized counter component
const CounterComponent = {
  render(element) {
    let lastValue = null;
    const state = noUI.constructor.createState(0);
    const update = () => {
      if (state.value !== lastValue) {
        lastValue = state.value;
        element.innerHTML = `<p>Count: ${state.value}</p>`;
      }
    };
    state.subscribe(update);
    update();
  }
};
```

### Custom Middleware
Create a middleware for async actions:
```javascript
// Middleware for async actions
const asyncMiddleware = ({ getState, setState, nextState }) => {
  if (nextState.asyncAction) {
    fetch('/api/data').then((response) => response.json()).then((data) => setState({ data }));
    return null;
  }
  return nextState;
};
// Create a store with async middleware
const useStore = createStore(
  (set, get) => ({
    state: { data: null },
    actions: { fetchData: () => set({ asyncAction: true }) }
  }),
  [asyncMiddleware]
);
```

### Custom Translation Paths
Use a CDN for translations:
```html
<script>
  // Initialize NoUI with CDN translations
  window.noUI = new NoUI({
    langs: ["en", "fr"],
    localePath: "https://cdn.example.com/translations",
    defaultLang: "en"
  });
</script>
```

## Best Practices

### Code Structure
- Keep components small and focused.
- Group related components in `components.js` with comments:
  ```javascript
  // UI Components
  const HeaderComponent = { ... };
  const FooterComponent = { ... };

  // Page Components
  const HomeComponent = { ... };
  ```

### State Management
- Use `createState` for local, isolated state (e.g., form inputs, counters).
- Use `createStore` for shared state (e.g., user data, theme).
- Define clear action names in `createStore`:
  ```javascript
  // Define clear actions
  actions: {
    incrementCount: () => set({ count: get().count + 1 }),
    setUserData: (user) => set({ user })
  }
  ```
- Use middleware for cross-cutting concerns (logging, persistence).

### Performance
- Minimize DOM updates by checking state changes (see "Optimizing Component Rendering").
- Use `noUI.scanComponents()` only when necessary (automatically called in `renderPage`).
- Cache translation lookups:
  ```javascript
  // Cache translation function
  const t = noUI.t.bind(noUI);
  const title = t("home.title");
  ```

### Scalability
- Organize translations in nested objects for large apps:
  ```json
  {
    "home": {
      "title": "Welcome to Home",
      "description": "This is the home page."
    }
  }
  ```
  Access: `noUI.t("home.title")`.
- Split `components.js` into multiple files if it grows large (requires a build tool).

### Error Handling
- Handle translation errors:
  ```javascript
  // Handle translation loading errors
  noUI.loadTranslations(["en"], "assets/locale").catch(() => console.error("Failed to load translations"));
  ```
- Check for missing `#app`:
  ```javascript
  // Verify #app element exists
  const main = document.querySelector("#app");
  if (!main) throw new Error("No #app element found");
  ```

## Examples

### Counter Component with `createState`
```javascript
// Counter component with local state
const CounterComponent = {
  render(element) {
    const state = noUI.constructor.createState(0);
    const update = () => {
      element.innerHTML = `
        <p>Count: ${state.value}</p>
        <button id="increment">Increment</button>`;
      element.querySelector("#increment")?.addEventListener("click", () => state.value++);
    };
    state.subscribe(update);
    update();
  }
};
// Register Counter component
noUI.registerComponent("no-counter", CounterComponent);
```

### Theme Toggle with `createStore` and Middleware
```javascript
// Create a global store with middleware
const useThemeStore = createStore(
  (set, get) => ({
    state: { theme: "light" },
    actions: {
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" })
    }
  }),
  [noUIMiddlewares.loggerMiddleware, noUIMiddlewares.persistMiddleware]
);
// Theme component using global state
const ThemeComponent = {
  render(element) {
    const update = () => {
      const { theme } = useThemeStore.getState();
      element.innerHTML = `
        <p>Theme: ${theme}</p>
        <button id="toggle">Toggle Theme</button>`;
      element.querySelector("#toggle")?.addEventListener("click", () => useThemeStore.toggleTheme());
    };
    useThemeStore.subscribe(update);
    update();
  }
};
// Register Theme component
noUI.registerComponent("no-theme", ThemeComponent);
```

### New Page
See "Creating Pages" section.

### Async Middleware
```javascript
// Middleware for async actions
const asyncMiddleware = ({ getState, setState, nextState }) => {
  if (nextState.asyncAction) {
    fetch('/api/data').then((response) => response.json()).then((data) => setState({ data }));
    return null;
  }
  return nextState;
};
// Create a store with async middleware
const useStore = createStore(
  (set, get) => ({
    state: { data: null },
    actions: { fetchData: () => set({ asyncAction: true }) }
  }),
  [asyncMiddleware]
);
```

## Troubleshooting

- **Page not found (`Cannot GET /contact`)**:
  - Ensure server is configured (e.g., `server.py` or `.htaccess`).
  - Verify HTML files exist (`contact.html`).
- **Translations not loading**:
  - Check `localePath` and `langs` in HTML configuration.
  - Verify `.json` files exist in `localePath`.
  - Use an HTTP server (not `file://`) to avoid CORS issues.
- **Components not rendering**:
  - Verify `<div id="app">` in HTML.
  - Check console for errors (e.g., `customElements.define`).
  - Ensure Web Components polyfill is loaded.
- **State not persisting**:
  - Check `localStorage` for `noUIState`.
  - Ensure `persistMiddleware` is included in `createStore`.

## Contributing
- Report issues or suggest features via the project repository.
- Keep code readable with full variable names.
- Use English for all comments and documentation.
- Avoid build tools to maintain simplicity.

## License
MIT License. Use `NoUI` freely in your projects.