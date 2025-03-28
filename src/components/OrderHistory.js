import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import "../css/OrderHistory.css";

import { OrderItem, OrderDiscount, repeatOrder } from "./OrderDetails";

// const orderHistory = [
//   {
//     id: 1,
//     number: "043",
//     datetime: "2024-03-11 14:30",
//     address: "Кофейня на Ленина, 12",
//     total: 1280,
//     status: "Выдан",
//     drinks: [
//       {
//         id: 1,
//         name: "Капучино",
//         size: "0.4 л",
//         image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
//         toppings: [
//           { id: 101, name: "Шоколадная крошка", price: 50 },
//           { id: 102, name: "Карамельный сироп", price: 40 },
//         ],
//         price: 260,
//         quantity: 1,
//       },
//       {
//         id: 2,
//         name: "Латте",
//         size: "0.5 л",
//         image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
//         toppings: [{ id: 103, name: "Ванильный сироп", price: 50 }],
//         price: 240,
//         quantity: 1,
//       },
//       {
//         id: 3,
//         name: "Американо",
//         size: "0.3 л",
//         image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
//         toppings: [],
//         price: 150,
//         quantity: 1,
//       },
//     ],
//     promotions: [
//       {
//         id: 10,
//         title: "Кофейная Тройка",
//         description: "Три напитка по выгодной цене.",
//         originalPrice: 900,
//         discountPrice: 650,
//         quantity: 1,
//         image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
//         drinks: [
//           {
//             id: "10-101",
//             name: "Капучино",
//             size: "0.4 л",
//             toppings: [
//               { id: "10-101-1", name: "Шоколадная крошка", price: 50 },
//               { id: "10-101-2", name: "Карамельный сироп", price: 40 },
//             ],
//             price: 260,
//             quantity: 1,
//           },
//           {
//             id: "10-102",
//             name: "Латте",
//             size: "0.5 л",
//             toppings: [],
//             price: 240,
//             quantity: 1,
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: 2,
//     number: "120",
//     datetime: "2024-03-08 10:15",
//     address: "Кофейня на Пушкина, 5",
//     total: 1050,
//     status: "Отменен",
//     drinks: [],
//     promotions: [
//       {
//         id: 12,
//         title: "Сладкая парочка",
//         description: "Латте и круассан по специальной цене.",
//         originalPrice: 500,
//         discountPrice: 350,
//         quantity: 1,
//         image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
//         drinks: [
//           {
//             id: "12-101",
//             name: "Латте",
//             size: "0.4 л",
//             toppings: [{ id: "12-101-1", name: "Карамельный сироп", price: 50 }],
//             price: 240,
//             quantity: 1,
//           },
//           {
//             id: "12-102",
//             name: "Лимонад",
//             size: "0.5 л",
//             toppings: [{ id: "12-102-1", name: "Карамельный сироп", price: 50 }],
//             price: 240,
//             quantity: 2,
//           },
//         ],
//       },
//     ],
//   },
// ];

const host = "http://localhost:8080";

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
