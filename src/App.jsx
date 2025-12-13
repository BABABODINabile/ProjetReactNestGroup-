// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "primereact/resources/themes/lara-light-blue/theme.css"; 
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import "./App.css";
export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
       {/* Toast container global */}
      <ToastContainer position="top-right" theme="colored" autoClose={3000} />
    </BrowserRouter>
  );
}
