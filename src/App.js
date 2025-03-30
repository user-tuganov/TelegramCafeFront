import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BottomNav from "./components/telegram/BottomNavBar";
import MenuPage from "./components/telegram/MenuPage";
import MapPage from "./components/telegram/MapPage";
import ProfilePage from "./components/telegram/ProfilePage";
import DiscountPage from "./components/telegram/DiscountPage";
import OrderHistory from "./components/telegram/OrderHistory";

import LoginPage from "./components/cafe/LoginPage";
import KitchenOrderPage from './components/cafe/KitchenOrderPage';
import "./css/App.css";

function TelegramRoutes() {
  return (
    <>
      <main className="App">
        <Routes>
          <Route path={`/`} element={<MenuPage />} />
          <Route path={`/menu`} element={<MenuPage />} />
          <Route path={`/discounts`} element={<DiscountPage />} />
          <Route path={`/restaurants`} element={<MapPage />} />
          <Route path={`/profile`} element={<ProfilePage />} />
          <Route path={`/order-history`} element={<OrderHistory />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  );
}

function CafeRoutes() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/cafe/login" />;
  };
  return (
    <>
      <Routes>
        <Route path={`/login`} element={<LoginPage />} />
        <Route path={`/kitchen`} element={<PrivateRoute><KitchenOrderPage/></PrivateRoute>}/>
      </Routes>
    </>
  );
}


function App() {
  const cafePath = "/cafe/*";
  return (
    <BrowserRouter>
      <Routes>
        <Route path={`/*`} element={<TelegramRoutes />} />
        <Route path={cafePath} element={<CafeRoutes />} />
      </Routes>
    </BrowserRouter>
  );

}

export default App;
