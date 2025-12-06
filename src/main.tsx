import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme from localStorage before render to prevent flash
const initializeTheme = () => {
  try {
    const settings = localStorage.getItem('patripro_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed.darkMode !== false) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Default to dark mode
      document.documentElement.classList.add('dark');
    }
  } catch {
    // Default to dark mode on error
    document.documentElement.classList.add('dark');
  }
};

initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
