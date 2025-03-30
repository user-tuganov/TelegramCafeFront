import React, { useState, useEffect, use } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import "../../css/ProfilePage.css";

import { OrderItem, OrderDiscount, repeatOrder } from "./OrderDetails";

const host = process.env.REACT_APP_HOST_URL;

async function getCurrentOrders(userId) {
  try {
    const response = await axios.get(host + `/order/get-current-orders/${userId}`);
    if (response.status !== 200) {
      console.log(response.status);
    } else {
      return response.data;
    }
  } catch (err) {
    console.log(err);
  }
}

async function cancelOrder(orderId) {
  try {
    const initData = window.Telegram.WebApp.initData;
    const params = new URLSearchParams(initData);
    const userId = JSON.parse(params.get('user')).id;

    const orderStatusDto = {
      userId,
      orderId,
      status: "Отменен"
    };
    const response = await axios.post(host + `/order/set-status`, orderStatusDto);
    if (response.status !== 200) {
      console.log(response.status);
    }
  } catch (err) {
    console.log(err);
  }
}

async function confirmCancelOrder(orderId, setCurrentOrders) {
  console.log(orderId);
  await cancelOrder(orderId);
  setCurrentOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
}

function ProfilePage() {
  const [cartItems, setCartItems] = useState(() => {
    const savedCartItems = localStorage.getItem("cartItems");
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });
  const [currentOrders, setCurrentOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const initData = window.Telegram.WebApp.initData;
      const params = new URLSearchParams(initData);
      const userInfo = JSON.parse(params.get('user'));
      setCurrentUser({ id: userInfo.id, username: userInfo.username });
      setCurrentOrders(await getCurrentOrders(userInfo.id));
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);

  function toggleOrder(orderId) {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  }
  return (
    <>
      <div className="user-profile">
        <h2>Личный кабинет</h2>

        <div className="view-profile">
          <p><strong>Никнейм:</strong> {currentUser ? currentUser.username : "Ошибка("}</p>
        </div>

        <Link to="/order-history" className="history-button">
          История заказов
        </Link>

        <Link to="/menu" className="close-history-btn">X</Link>
      </div>

      {currentOrders.length != 0 &&
        currentOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const statusClass = {
            "Оплачен": "paid",
            "Готовится": "prepare",
            "Готов": "ready",
          }[order.status] || "unknown";

          return (
            <div key={order.id} className="order-card">
              <div className="order-summary" onClick={() => toggleOrder(order.id)}>
                <div className="order-status-control">
                  <span className={`order-status ${statusClass}`}>
                    {order.status}
                  </span>
                  <button className="cancel-order" onClick={(e) => { e.stopPropagation(); setOrderToCancel(order); }}>
                    Отменить
                  </button>
                </div>
                <h3>
                  Заказ №{String(order.orderNumber).padStart(3, "0")} - {new Date(order.orderDateTime).toLocaleString("ru-RU")}
                </h3>
                <p className="order-address"><strong>Адрес:</strong> {order.cafeAddress.address}</p>
                {!isExpanded && order.products.length > 0 && <p><strong>Первая позиция:</strong> {order.products[0].product.name} ({order.products[0].size.text})</p>}
                {!isExpanded && order.discounts.length > 0 && order.products.length === 0 && <p><strong>Акция:</strong> {order.discounts[0].discount.name}</p>}
                {!isExpanded && (<p className="order-total"><strong>Общая сумма:</strong> {order.totalPrice}₽</p>)}
              </div>
              {isExpanded && (
                <div className="order-details" onClick={() => toggleOrder(order.id)}>
                  {order.products.length > 0 && (
                    <>
                      <h4>Позиции:</h4>
                      <ul className="cart-items">
                        {order.products.map((drink) => (
                          <OrderItem key={drink.id} drink={drink} />
                        ))}
                      </ul>
                    </>
                  )}

                  {order.discounts.length > 0 && (
                    <>
                      <h4>Акции:</h4>
                      <ul className="cart-promotions">
                        {order.discounts.map((promo) => (
                          <OrderDiscount key={promo.id} promo={promo} />
                        ))}
                      </ul>
                    </>
                  )}
                  <p className="order-total"><strong>Общая сумма:</strong> {order.totalPrice}₽</p>
                </div>
              )}
              <button className="repeat-order" onClick={() => repeatOrder(order, cartItems, setCartItems)}>
                Повторить заказ
              </button>
            </div>
          );
        })}

      {orderToCancel && (
        <div className="modal">
          <div className="modal-content">
            <h3>Отмена заказа</h3>
            <p>Вы уверены, что хотите отменить заказ №{String(orderToCancel.orderNumber).padStart(3, "0")}?</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={() => { confirmCancelOrder(orderToCancel.id, setCurrentOrders); setOrderToCancel(null)} }>
                Да, отменить
              </button>
              <button className="cancel-btn" onClick={() => setOrderToCancel(null)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePage;