import { Routes, Route } from "react-router-dom";
import "./Style.css";
import Home from "./Home";
import { ShopProvider } from "./ShopProvider";
import Dashboard from "./Dashboard";

export default function App() {
  return (
    <ShopProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Dashboard" element={<Dashboard />} />

        <Route
          path="*"
          element={
            <main className="page-content">
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </main>
          }
        />
      </Routes>
    </ShopProvider>
  );
}