import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import './styles/globals.css';
import './styles/government-theme.css';



(() => {
    try {
        const stored = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
        const theme = stored || (systemPrefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
    } catch {
        
    }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
