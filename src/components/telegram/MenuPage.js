import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Link } from "react-router-dom";
import "../../css/MenuPage.css";

const host = process.env.REACT_APP_HOST_URL;

const groupProductsByCategory = (products) => {
  if (!products || !Array.isArray(products)) {
    console.warn('groupProductsByCategory: products is not an array', products);
    return {};
  }
  return products.reduce((acc, product) => {
    if (!acc[product.type]) acc[product.type] = [];
    acc[product.type].push(product);
    return acc;
  }, {});
};

async function checkUser() {
  try {
    const initData = window.Telegram.WebApp.initData;
    const params = new URLSearchParams(initData);
    const userId = JSON.parse(params.get('user')).id;
    const response = await axios.post(host + `/profile/check-user/${userId}`);
    if (response.status != 200) {
      console.log(response.status);
    }
  } catch (err) {
    console.log(err);
  }
}

async function getMenu() {
  try {
    const response = await axios.get(host + `/menu/get-products`);
    if (response.status !== 200) {
      console.log(response.status);
    } else {
      return response.data;
    }
  } catch (err) {
    console.log(err);
  }
}

async function getProductDetails(productId) {
  try {
    const response = await axios.get(host + `/menu/get-products/${productId}`)
    if (response.status !== 200) {
      console.log(response.status);
    } else {
      return response.data;
    }
  } catch (err) {
    console.log(err);
  }
}


function calculatePrice(activeProduct, customization) {
  if (!activeProduct || !customization.size) return 0;

  const basePrice = activeProduct.sizes.find((s) => s.id === customization.size.id)?.price || 0;
  const toppingsPrice = customization.toppings.reduce((sum, topping) => sum + topping.price, 0);
  return basePrice + toppingsPrice;
}

async function handleProductClick(productId, setActiveProduct, setCustomization) {
  const productDetails = await getProductDetails(productId);
  setActiveProduct(productDetails);
  setCustomization({
    size: productDetails.sizes[0],
    toppings: [],
    quantity: 1,
  });
}


function handleAddToCart(activeProduct, customization, setActiveProduct) {
  const item = {
    id: `${activeProduct.id}-${customization.size.id}-${customization.toppings.map(t => t.id).join("-")}`,
    productId: activeProduct.id,
    imageURL: activeProduct.imageURL,
    name: activeProduct.name,
    size: customization.size,
    toppings: customization.toppings,
    quantity: customization.quantity,
    price: calculatePrice(activeProduct, customization),
  };

  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const existingItemIndex = cartItems.findIndex(i => i.id === item.id);

  if (existingItemIndex !== -1) {
    cartItems[existingItemIndex].quantity += item.quantity;
  } else {
    cartItems.push(item);
  }

  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  setActiveProduct(null);
}

function MenuPage() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [customization, setCustomization] = useState({});
  const [products, setProducts] = useState([]);
  const [categorizedProducts, setCategorizedProducts] = useState({});


  useEffect(() => {
    const fetchData = async () => {
      await checkUser();
      const menuData = await getMenu();
      setProducts(menuData || []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setCategorizedProducts(groupProductsByCategory(products));
    }
  }, [products]);

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
        <h1>Меню</h1>
        <Link to="/profile" className="profile-button">☖</Link>
      </div>

      {categorizedProducts != {} && Object.entries(categorizedProducts).map(([type, items]) => (
        <div key={type} className="category-section">
          <h2 className="category-title">{type}</h2>
          <div className="product-list">
            {items.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={async () => await handleProductClick(product.id, setActiveProduct, setCustomization)}
              >
                <img src={product.imageURL} alt={product.name} className="product-image" />
                <h2 className="product-name">{product.name}</h2>
                <p className="product-price">от {product.cheapestPrice} руб.</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {activeProduct && (
        <div className="product-detail">
          <button className="close-button" onClick={() => setActiveProduct(null)}>X</button>
          <img src={activeProduct.imageURL} alt={activeProduct.name} className="detail-image" />
          <h2>{activeProduct.name}</h2>
          <p>{activeProduct.description}</p>

          <div className="option-group">
            <p>Выберите размер:</p>
            <div className="size-buttons">
              {(() => {
                const buttons = [];
                activeProduct.sizes.forEach((item) => {
                  buttons.push(
                    <button
                      key={item.id}
                      className={`size-button ${customization.size && customization.size.id === item.id ? "selected" : ""}`}
                      onClick={() => setCustomization({ ...customization, size: item })}
                    >
                      {item.text} ({item.price} руб.)
                    </button>
                  );
                });
                return buttons;
              })()}
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

          <button className="add-to-cart-button" onClick={() => handleAddToCart(activeProduct, customization, setActiveProduct)}>
            Добавить в корзину ({calculatePrice(activeProduct, customization) * customization.quantity} руб.)
          </button>
        </div>
      )}
    </div>
  );
}

export default MenuPage;
