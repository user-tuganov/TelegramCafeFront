import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/MenuPage.css";

const products = [
  {
    id: 1,
    name: "Капучино",
    image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
    description: "Классический капучино с нежной молочной пенкой.",
    sizes: [
      { size: "0.3 л", price: 150 },
      { size: "0.4 л", price: 180 },
      { size: "0.5 л", price: 210 },
    ],
    toppings: [
      { id: 1, name: "Сироп ваниль", price: 20 },
      { id: 2, name: "Корица", price: 15 },
    ],
  },
  {
    id: 2,
    name: "Латте",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHOWAuSVLJPEPUCxAhdjgTiaOLn_tdow7tiQ&s",
    description: "Нежный латте с мягким вкусом и ароматом.",
    sizes: [
      { size: "0.3 л", price: 170 },
      { size: "0.4 л", price: 200 },
      { size: "0.5 л", price: 230 },
    ],
    toppings: [
      { id: 3, name: "Шоколад", price: 25 },
      { id: 4, name: "Взбитые сливки", price: 30 },
    ],
  },
  {
    id: 3,
    name: "Латте",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHOWAuSVLJPEPUCxAhdjgTiaOLn_tdow7tiQ&s",
    description: "Нежный латте с мягким вкусом и ароматом.",
    sizes: [
      { size: "0.3 л", price: 170 },
      { size: "0.4 л", price: 200 },
      { size: "0.5 л", price: 230 },
    ],
    toppings: [
      { id: 3, name: "Шоколад", price: 25 },
      { id: 4, name: "Взбитые сливки", price: 30 },
    ],
  },
  {
    id: 4,
    name: "Латте",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHOWAuSVLJPEPUCxAhdjgTiaOLn_tdow7tiQ&s",
    description: "Нежный латте с мягким вкусом и ароматом.",
    sizes: [
      { size: "0.3 л", price: 170 },
      { size: "0.4 л", price: 200 },
      { size: "0.5 л", price: 230 },
    ],
    toppings: [
      { id: 3, name: "Шоколад", price: 25 },
      { id: 4, name: "Взбитые сливки", price: 30 },
    ],
  },
  {
    id: 5,
    name: "Латте",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHOWAuSVLJPEPUCxAhdjgTiaOLn_tdow7tiQ&s",
    description: "Нежный латте с мягким вкусом и ароматом.",
    sizes: [
      { size: "0.3 л", price: 170 },
      { size: "0.4 л", price: 200 },
      { size: "0.5 л", price: 230 },
    ],
    toppings: [
      { id: 3, name: "Шоколад", price: 25 },
      { id: 4, name: "Взбитые сливки", price: 30 },
    ],
  },
  {
    id: 6,
    name: "Латте",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHOWAuSVLJPEPUCxAhdjgTiaOLn_tdow7tiQ&s",
    description: "Нежный латте с мягким вкусом и ароматом.",
    sizes: [
      { size: "0.3 л", price: 170 },
      { size: "0.4 л", price: 200 },
      { size: "0.5 л", price: 230 },
    ],
    toppings: [
      { id: 3, name: "Шоколад", price: 25 },
      { id: 4, name: "Взбитые сливки", price: 30 },
    ],
  },
];

function calculateTotalPrice(activeProduct, customization) {
  if (!activeProduct || !customization.size) return 0;

  const basePrice = activeProduct.sizes.find(s => s.size === customization.size)?.price || 0;
  const toppingsPrice = customization.toppings.reduce((sum, topping) => sum + topping.price, 0);
  return (basePrice + toppingsPrice) * customization.quantity;
}

function handleProductClick(product, setActiveProduct, setCustomization) {
  setActiveProduct(product);
  setCustomization({
    size: product.sizes[0].size,
    toppings: [],
    quantity: 1,
  });
}

function handleCloseDetail(setActiveProduct) {
  document.querySelector(".product-detail").classList.remove("active");
  setTimeout(() => setActiveProduct(null), 300);
}

function handleAddToCart(activeProduct, customization, setCartItems, setActiveProduct) {
  const item = {
    id: `${activeProduct.id}-${customization.size}-${customization.toppings.map(t => t.id).join("-")}`,
    productId: activeProduct.id,
    image: activeProduct.image,
    name: activeProduct.name,
    size: customization.size,
    toppings: customization.toppings,
    quantity: customization.quantity,
    price: calculateTotalPrice(activeProduct, customization),
  };
  console.log(item);

  setCartItems((prevItems) => {
    const existingItem = prevItems.find((i) => i.id === item.id);
    if (existingItem) {
      return prevItems.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      return [...prevItems, item];
    }
  });

  handleCloseDetail(setActiveProduct);
}

function MenuPage({ setCartItems }) {
  const [activeProduct, setActiveProduct] = useState(null);
  const [customization, setCustomization] = useState({});

  useEffect(() => {
    if (activeProduct) {
      setTimeout(() => {
        document.querySelector(".product-detail").classList.add("active");
      }, 10);
    }
  }, [activeProduct]);

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Меню кофе</h1>
        <Link to="/profile" className="profile-button">☖</Link>
      </div>

      <div className="product-list">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => handleProductClick(product, setActiveProduct, setCustomization)}
          >
            <img src={product.image} alt={product.name} className="product-image" />
            <h2 className="product-name">{product.name}</h2>
            <p className="product-price">от {product.sizes[0].price} руб.</p>
          </div>
        ))}
      </div>

      {activeProduct && (
        <div className="product-detail">
          <button className="close-button" onClick={() => handleCloseDetail(setActiveProduct)}>X</button>
          <img src={activeProduct.image} alt={activeProduct.name} className="detail-image" />
          <h2>{activeProduct.name}</h2>
          <p>{activeProduct.description}</p>

          <div className="option-group">
            <p>Выберите размер:</p>
            <div className="size-buttons">
              {activeProduct.sizes.map(({ size, price }) => (
                <button
                  key={size}
                  className={`size-button ${customization.size === size ? "selected" : ""}`}
                  onClick={() => setCustomization({ ...customization, size })}
                >
                  {size} ({price} руб.)
                </button>
              ))}
            </div>
          </div>

          {activeProduct.toppings.length > 0 && (
            <div className="option-group">
              <p>Добавочные топпинги:</p>
              {activeProduct.toppings.map((topping) => (
                <div key={topping.id} className="checkbox-group">
                  <input
                    type="checkbox"
                    id={`topping-${topping.id}`}
                    checked={customization.toppings.some((t) => t.id === topping.id)}
                    onChange={(e) => {
                      const updatedToppings = e.target.checked
                        ? [...customization.toppings, topping]
                        : customization.toppings.filter((t) => t.id !== topping.id);
                      setCustomization({ ...customization, toppings: updatedToppings });
                    }}
                  />
                  <label htmlFor={`topping-${topping.id}`} className="topping-label">
                    <span className="topping-name">{topping.name}</span>
                    <span className="topping-price">{topping.price} руб.</span>
                  </label>
                </div>
              ))}
            </div>
          )}

          <div className="option-group">
            <h3>Количество</h3>
            <div className="quantity-control">
              <button onClick={() => setCustomization(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))} disabled={customization.quantity <= 1}>-</button>
              <span>{customization.quantity}</span>
              <button onClick={() => setCustomization(prev => ({ ...prev, quantity: Math.min(100, prev.quantity + 1) }))} disabled={customization.quantity >= 100}>+</button>
            </div>
          </div>

          <button className="add-to-cart-button" onClick={() => handleAddToCart(activeProduct, customization, setCartItems, setActiveProduct)}>
            Добавить в корзину ({calculateTotalPrice(activeProduct, customization)} руб.)
          </button>
        </div>
      )}
    </div>
  );
}

export default MenuPage;
