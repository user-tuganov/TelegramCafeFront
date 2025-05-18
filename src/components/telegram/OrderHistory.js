import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import "../../css/OrderHistory.css";

import { OrderItem, OrderDiscount, repeatOrder } from "./OrderDetails";
import config from '../../../env.json';

const host = config.REACT_APP_HOST_URL;

async function getOrderHistory(userId) {
  try {
    const response = await axios.get(host + `/order/get-order-history/${userId}`);
    if (response.status !== 200) {
      console.log(response.status);
    } else {
      console.log(response.data);
      return response.data;
    }
  } catch (err) {
    console.log(err);
  }
}

function OrderHistory() {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  const getCartItems = () => {
    const items = localStorage.getItem("cartItems");
    return items ? JSON.parse(items) : [];
  };

  const setCartItems = (items) => {
    localStorage.setItem("cartItems", JSON.stringify(items));
  };

  const cartItems = getCartItems();

  function toggleOrder(orderId) {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  }

  useEffect(() => {
    const fetchData = async () => {
      const initData = window.Telegram.WebApp.initData;
      const params = new URLSearchParams(initData);
      const userId = JSON.parse(params.get('user')).id
      setOrderHistory(await getOrderHistory(userId));
    };

    fetchData();
  }, []);

  return (
    <div className="order-history">
      <Link to="/profile" className="close-history-btn">X</Link>
      <h2>История заказов</h2>
      {orderHistory.length == 0 ? (
        <p className="empty-history">Вы еще не делали заказов.</p>
      ) : (
        orderHistory.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          return (
            <div key={order.id} className="order-card">
              <div className="order-summary" onClick={() => toggleOrder(order.id)}>
                <span className={`order-status ${order.status === "Выдан" ? "delivered" : "cancelled"}`}>
                  {order.status}
                </span>
                <h3>
                  Заказ № {String(order.orderNumber).padStart(3, "0")} - {new Date(order.orderDateTime).toLocaleString("ru-RU")}
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
              <button className="repeat-order-btn" onClick={() => repeatOrder(order, cartItems, setCartItems)}>
                Повторить заказ
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default OrderHistory;
