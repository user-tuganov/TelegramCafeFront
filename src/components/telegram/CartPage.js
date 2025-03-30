import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "../../css/CartPage.css";

const host = process.env.REACT_APP_HOST_URL;

function getCartItems() {
  return JSON.parse(localStorage.getItem("cartItems")) || [];
}

function setCartItems(items) {
  localStorage.setItem("cartItems", JSON.stringify(items));
}

function calculateTotalPrice() {
  const cartItems = getCartItems();
  return cartItems.reduce((sum, item) => {
    const itemPrice = item.totalPrice || item.price;
    return sum + itemPrice * item.quantity;
  }, 0);
}

function handleQuantityChange(id, amount) {
  let cartItems = getCartItems();
  cartItems = cartItems
    .map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + amount } : item
    )
    .filter((item) => item.quantity > 0);

  setCartItems(cartItems);
  window.dispatchEvent(new Event("storage"));
}

async function saveNewOrder(newOrder) {
  try {
    const response = await axios.post(host + `/order/new-order`, newOrder);
    if (response !== 200) {
      console.log(response.status);
    }
  } catch (err) {
    console.log(err);
  }
}

async function getCurrentCafe() {
  try {
    const initData = window.Telegram.WebApp.initData;
    const params = new URLSearchParams(initData);
    const userId = JSON.parse(params.get('user')).id;
    const response = await axios.get(host + `/profile/get-address/${userId}`);
    if (response.status !== 200) {
      console.log(response.status);
    } else {
      return response.data;
    }
  } catch (err) {
    console.log(err);
  }
}

function parseProducts(products) {
  const productsDto = products.map(product => ({
    id: product.id,
    quantity: product.quantity,
    sizeId: product.size.id,
    toppingsIds: (product.toppings || []).map(topping => topping.id)
  }));
  return productsDto;
}

function parseDiscounts(discounts) {
  const discountsDto = discounts.map(discount => ({
    id: discount.discountId,
    quantity: discount.quantity,
    cafeOrderProductDtoList: parseProducts(discount.drinks)
  }));
  return discountsDto;
}

function getCurrentDateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${hours}:${minutes} ${year}-${month}-${day}`;
}

async function handlePayment(orderCafeId, deliveryMethod, cartItems, setCartItems, onClose) {
  if (orderCafeId == null) {
    return;
  }
  const initData = window.Telegram.WebApp.initData;
  const params = new URLSearchParams(initData);
  const userId = JSON.parse(params.get('user')).id;

  const currentDateTime = getCurrentDateTime();

  const frontProducts = cartItems.filter((item) => item.discountId == null);
  const frondDiscounts = cartItems.filter((item) => item.discountId != null);
  const newOrder = {
    userId,
    deliveryMethod,
    addressId: orderCafeId,
    orderDateTime: currentDateTime,
    products: parseProducts(frontProducts),
    discounts: parseDiscounts(frondDiscounts),
    totalPrice: calculateTotalPrice()
  }
  await saveNewOrder(newOrder);
  setCartItems([]);
  onClose();
}

function CartPage({ onClose }) {
  const [cartItems, setCartState] = useState(getCartItems());
  const [deliveryMethod, setDeliveryMethod] = useState("В кафе");
  const [orderCafe, setOrderCafe] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const updateCart = () => setCartState(getCartItems());
    window.onstorage = updateCart;
    return () => {
      window.onstorage = null;
    };
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      const cafe = await getCurrentCafe();
      setOrderCafe(cafe ? cafe : "Адрес не выбран");
    };
    fetchData();
  }, []);


  const singleItems = cartItems.filter((item) => item.discountId == null) || [];
  const discounts = cartItems.filter((item) => item.discountId != null) || [];
  return (
    <div className="overlay">
      <div className="cart-container">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Корзина</h2>

        {cartItems.length === 0 ? (
          <>
            <p className="empty-cart">Корзина пуста</p>
            <button className="empty-button" onClick={() => { onClose(); navigate('/menu') }}>
              Перейти в меню
            </button>
          </>
        ) : (
          <>
            {singleItems.length > 0 && (
              <ul className="cart-items">
                {singleItems.map((item) => (
                  <li key={item.id} className="cart-item">
                    <img src={item.imageURL} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <p><strong>{item.name}</strong> ({item.size.text})</p>
                      {item.toppings?.length > 0 && (
                        <ul className="cart-item-toppings">
                          {item.toppings.map((topping) => (
                            <li key={topping.id} className="topping-item">
                              {topping.name} (+{topping.price}₽)
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="quantity-control">
                        <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                      </div>
                      <p>Итого: {item.price * item.quantity}₽</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {discounts.length > 0 && (
              <>
                <h3>Акции</h3>
                <ul className="cart-discounts">
                  {discounts.map((promo) => (
                    <li key={promo.id} className="cart-item">
                      <img src={promo.image} alt={promo.name} className="cart-item-img" />
                      <div className="cart-item-info">
                        <h4>{promo.name}</h4>
                        {promo.drinks?.length > 0 && (
                          <ul className="cart-item-drinks">
                            {promo.drinks.map((drink, index) => (
                              <li key={index}>
                                <p><strong>{drink.name}</strong> ({drink.size.text})</p>
                                {drink.toppings?.length > 0 && (
                                  <ul className="cart-item-toppings">
                                    {drink.toppings.map((topping) => (
                                      <li key={topping.id} className="topping-item">
                                        {topping.name} (+{topping.price}₽)
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="quantity-control">
                          <button onClick={() => handleQuantityChange(promo.id, -1)}>-</button>
                          <span>{promo.quantity}</span>
                          <button onClick={() => handleQuantityChange(promo.id, 1)}>+</button>
                        </div>
                        <p>Итого: {promo.totalPrice * promo.quantity}₽</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3>Общая сумма: {calculateTotalPrice()}₽</h3>

            <div className="delivery-method">
              <span className="delivery-label">Упаковать с собой</span>
              <div
                className={`delivery-toggle ${deliveryMethod === "В кафе" ? "active" : ""}`}
                onClick={() => setDeliveryMethod(deliveryMethod === "С собой" ? "takeaway" : "cafe")}
              >
                <div className="toggle-circle"></div>
              </div>
            </div>

            <div className="selected-address">
              <p><strong>Адрес доставки:</strong> {orderCafe ? orderCafe.address : "Грузится..."}</p>
            </div>
            <button
              className="pay-button"
              onClick={async () => await handlePayment(orderCafe ? orderCafe.id : null, deliveryMethod, cartItems, setCartItems, onClose)}
            >
              Оплатить
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;
