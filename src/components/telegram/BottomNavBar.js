import React, { useState } from "react";
import { Link } from "react-router-dom";
import MapPage from "./MapPage";
import CartPage from "./CartPage";
import "../../css/BottomNavBar.css";

function BottomNav() {
  const [activeBlock, setActiveBlock] = useState(null);

  return (
    <nav className="bottom-nav">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/menu">Меню</Link>
        </li>
        <li className="nav-item">
          <Link to="/discounts">Акции</Link>
        </li>
        <li className="nav-item" onClick={() => setActiveBlock("map")}>
          Рестораны
        </li>
        <li className="nav-item" onClick={() => setActiveBlock("cart")}>
          Корзина
        </li>
      </ul>

      {activeBlock === "map" && <MapPage onClose={() => setActiveBlock(null)} />}
      {activeBlock === "cart" && <CartPage onClose={() => setActiveBlock(null)} />}
    </nav>
  );
}

export default BottomNav;
