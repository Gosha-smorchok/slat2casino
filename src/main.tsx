import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HashRouter } from 'react-router-dom'

// Error handling to debug black screen
window.onerror = (message, source, lineno, _colno, _error) => {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.background = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.padding = '10px';
    errorDiv.style.fontSize = '12px';
    errorDiv.innerHTML = `Error: ${message}<br/>at ${source}:${lineno}`;
    document.body.appendChild(errorDiv);
};

console.log("%c KAZIK V2.1 LOADED SUCCESSFULLY ", "background: #222; color: #bada55; font-size: 20px");
console.log("Current Hash:", window.location.hash);
console.log("Current Path:", window.location.pathname);

const rootElement = document.getElementById('root');
if (!rootElement) {
    console.error("Main.tsx: Root element not found!");
} else {
    try {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <HashRouter>
              <App />
            </HashRouter>
        );
        console.log("React Render triggered");
        
        // Debug: Check if mounted after 1s
        setTimeout(() => {
            if (rootElement.innerHTML === "") {
               console.error("React failed to produce HTML in #root");
               document.body.innerHTML += "<div style='color:red; padding:20px'>REACT MOUNT FAILED</div>";
            } else {
               console.log("React Mount verified, root html length:", rootElement.innerHTML.length);
            }
        }, 1000);

    } catch (e) {
        console.error("React render crashed:", e);
        document.body.innerHTML += `<div style='color:red'>CRASH: ${e}</div>`;
    }
}

if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
}
