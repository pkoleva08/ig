import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Calc from "./pages/Calc";
import Avg from "./pages/Avg";
import Gauss from "./pages/Gauss";
import About from "./pages/About";

function PathNormalizer() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const lower = location.pathname.toLowerCase();
    if (location.pathname !== lower) {
      navigate({ pathname: lower, search: location.search }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  return null;
}

function NotFound() {
  return (
    <section className="p-6 text-center">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-xl mb-4">Страницата не е намерена.</p>
      <p>
        <a href="/home" className="text-blue-500 hover:underline">
          Към началната
        </a>
      </p>
    </section>
  );
}

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header user={user} setUser={setUser} />
      <main className="container mx-auto px-4 py-8">
        {/* Нормализира главни/малки букви в пътищата */}
        <PathNormalizer />

        <Routes>
          {/* Коренът → /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Начална страница – поддържаме и /Home (редирект към /home) */}
          <Route path="/home" element={<h1 className="text-4xl font-bold text-center mt-10">Welcome to the App</h1>} />
          <Route path="/Home" element={<Navigate to="/home" replace />} />

          {/* About – пазя компонента; ако не се ползва, може да остане за бъдеще */}
          <Route path="/about" element={<About />} />
          <Route path="/About" element={<Navigate to="/about" replace />} />

          {/* Calc – връщам активен маршрут + дублиран с главна буква */}
          <Route path="/calc" element={<Calc />} />
          <Route path="/Calc" element={<Navigate to="/calc" replace />} />

          {/* Avg – нова страница за среден резултат на студент */}
          <Route path="/avg" element={<Avg user={user} />} />
          <Route path="/Avg" element={<Navigate to="/avg" replace />} />

          {/* Gauss – нова страница за Гаус */}
          <Route path="/gauss" element={<Gauss user={user} />} />
          <Route path="/Gauss" element={<Navigate to="/gauss" replace />} />

          {/* Login/Register – поддържам и двете версии */}
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/Login" element={<Navigate to="/login" replace />} />

          <Route path="/register" element={<Register />} />
          <Route path="/Register" element={<Navigate to="/register" replace />} />

          {/* 404 fallback */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
