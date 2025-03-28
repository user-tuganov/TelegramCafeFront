import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNavBar";
import MenuPage from "./components/MenuPage";
import MapPage from "./components/MapPage";
import ProfilePage from "./components/ProfilePage";
import DiscountPage from "./components/DiscountPage";
import OrderHistory from "./components/OrderHistory";
import "./css/App.css";

function App() {
  return (
    <BrowserRouter>
      <main className="App">
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/discounts" element={<DiscountPage />} />
          <Route path="/restaurants" element={<MapPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/order-history" element={<OrderHistory/>} />
        </Routes>
      </main>
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;
