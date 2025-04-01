import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Font Awesome CSS for icons
const fontAwesomeCSS = document.createElement("link");
fontAwesomeCSS.rel = "stylesheet";
fontAwesomeCSS.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(fontAwesomeCSS);

// Add Inter font
const interFont = document.createElement("link");
interFont.rel = "stylesheet";
interFont.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
document.head.appendChild(interFont);

// Set page title
const titleElement = document.createElement("title");
titleElement.textContent = "Social Content Planner";
document.head.appendChild(titleElement);

createRoot(document.getElementById("root")!).render(<App />);
