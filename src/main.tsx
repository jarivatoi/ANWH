import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Remove loading screen when React app mounts
const removeLoadingScreen = () => {
  const loadingScreen = document.querySelector('.app-loading');
  if (loadingScreen) {
    loadingScreen.remove();
  }
};

// Enhanced app initialization with error handling
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  // Remove loading screen after React renders
  setTimeout(removeLoadingScreen, 100);
  
} catch (error) {
  console.error('Failed to initialize app:', error);
  
  // Fallback: Show error message and reload button
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div class="app-loading">
        <div class="loading-content">
          <h1>⚠️ App Error</h1>
          <p>Something went wrong. Please try reloading the app.</p>
          <button onclick="window.location.reload()" style="
            background: #6366f1; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            font-size: 16px; 
            font-weight: 600;
            cursor: pointer;
            margin-top: 20px;
          ">Reload App</button>
        </div>
      </div>
    `;
  }
}