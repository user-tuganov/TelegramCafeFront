import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/ProfilePage.css";

import { OrderItem, OrderPromotion, repeatOrder } from "./OrderDetails";

const currentOrders = [
  {
    id: 1,
    number: "043",
    datetime: "2024-03-11 14:30",
    address: "Кофейня на Ленина, 12",
    total: 1280,
    status: "Оплачен",
    drinks: [
      {
        id: 1,
        name: "Капучино",
        size: "0.4 л",
        image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
        toppings: [
          { id: 101, name: "Шоколадная крошка", price: 50 },
          { id: 102, name: "Карамельный сироп", price: 40 },
        ],
        price: 260,
        quantity: 1,
      },
      {
        id: 2,
        name: "Латте",
        size: "0.5 л",
        image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
        toppings: [{ id: 103, name: "Ванильный сироп", price: 50 }],
        price: 240,
        quantity: 1,
      },
      {
        id: 3,
        name: "Американо",
        size: "0.3 л",
        image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
        toppings: [],
        price: 150,
        quantity: 1,
      },
    ],
    promotions: [
      {
        id: 10,
        title: "Кофейная Тройка",
        description: "Три напитка по выгодной цене.",
        originalPrice: 900,
        discountPrice: 650,
        quantity: 1,
        image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
        drinks: [
          {
            id: "10-101",
            name: "Капучино",
            size: "0.4 л",
            toppings: [
              { id: "10-101-1", name: "Шоколадная крошка", price: 50 },
              { id: "10-101-2", name: "Карамельный сироп", price: 40 },
            ],
            price: 260,
            quantity: 1,
          },
          {
            id: "10-102",
            name: "Латте",
            size: "0.5 л",
            toppings: [],
            price: 240,
            quantity: 1,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    number: "043",
    datetime: "2024-03-08 10:15",
    address: "Кофейня на Пушкина, 5",
    total: 1050,
    status: "Готовится",
    drinks: [

    ],
    promotions: [
      {
        id: 12,
        title: "Сладкая парочка",
        description: "Латте и круассан по специальной цене.",
        originalPrice: 500,
        discountPrice: 350,
        quantity: 1,
        image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
        drinks: [
          {
            id: "12-101",
            name: "Латте",
            size: "0.4 л",
            toppings: [{ id: "12-101-1", name: "Карамельный сироп", price: 50 }],
            price: 240,
            quantity: 1,
          },
          {
            id: "12-102",
            name: "Лимонад",
            size: "0.5 л",
            toppings: [{ id: "12-102-1", name: "Карамельный сироп", price: 50 }],
            price: 240,
            quantity: 2,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    number: "043",
    datetime: "2024-03-08 10:15",
    address: "Кофейня на Пушкина, 5",
    total: 1050,
    status: "Готов к выдаче",
    drinks: [

    ],
    promotions: [
      {
        id: 12,
        title: "Сладкая парочка",
        description: "Латте и круассан по специальной цене.",
        originalPrice: 500,
        discountPrice: 350,
        quantity: 1,
        image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
        drinks: [
          {
            id: "12-102",
            name: "Латте",
            size: "0.4 л",
            toppings: [{ id: "12-103-1", name: "Карамельный сироп", price: 50 }],
            price: 240,
            quantity: 1,
          },
          {
            id: "12-103",
            name: "Лимонад",
            size: "0.5 л",
            toppings: [{ id: "12-103-1", name: "Карамельный сироп", price: 50 }],
            price: 240,
            quantity: 2,
          },
        ],
      },
    ],
  },
];

const mockProfileData = {
  nickname: "coffee_lover",
  email: "user@example.com",
  phone: "79991234567",
};

function confirmCancelOrder(orderId, setOrderToCancel) {
  console.log(`Отмена заказа ${orderId}`);
  setOrderToCancel(null);
}

function ProfilePage({ cartItems, setCartItems }) {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  function toggleOrder(orderId) {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  }
  const [isEditing, setIsEditing] = useState(false); 
  const [editedData, setEditedData] = useState(mockProfileData);

  const handlePhoneChange = (event) => {
    const rawPhone = event.target.value.replace(/\D/g, "");

    if (rawPhone.length > 11) {
      return;
    }

    setEditedData({ ...editedData, phone: rawPhone }); 
  };


  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditedData({ ...editedData, [name]: value });
  };

  const handleSave = () => {

    mockProfileData.nickname = editedData.nickname;
    mockProfileData.email = editedData.email;
    mockProfileData.phone = editedData.phone;

    console.log("Данные сохранены:", mockProfileData);
    setIsEditing(false);
  };

  return (
    <>
      <div className="user-profile">
        <h2>Личный кабинет</h2>
        {!isEditing ? (
          <div className="view-profile">
            <p><strong>Никнейм:</strong> {mockProfileData.nickname}</p>
            <p><strong>Email:</strong> {mockProfileData.email}</p>
            <p><strong>Телефон:</strong> {mockProfileData.phone}</p>

            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              Редактировать
            </button>
          </div>
        ) : (
          <div className="edit-profile">
            <label>
              Никнейм:
              <input
                type="text"
                name="nickname"
                value={editedData.nickname}
                onChange={handleChange}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={editedData.email}
                onChange={handleChange}
              />
            </label>
            <label>
              Телефон:
              <input
                type="text"
                name="phone"
                value={editedData.phone}
                onChange={handlePhoneChange} 
                maxLength="18"
              />
            </label>
            <div className="edit-buttons">
              <button className="save-btn" onClick={handleSave}>
                Сохранить
              </button>
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                Отмена
              </button>
            </div>
          </div>
        )}

        <Link to="/order-history" className="history-button">
          История заказов
        </Link>

        <Link to="/menu" className="close-history-btn">X</Link>
      </div>
      {currentOrders.length != 0 && (
        currentOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const statusClass = {
            "Оплачен": "paid",
            "Готовится": "prepare",
            "Готов к выдаче": "ready"
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
                  Заказ №{order.number} - {order.datetime}
                </h3>
                <p className="order-address"><strong>Адрес:</strong> {order.address}</p>
                {!isExpanded && order.drinks.length > 0 && <p><strong>Первая позиция:</strong> {order.drinks[0].name} ({order.drinks[0].size})</p>}
                {!isExpanded && order.promotions.length > 0 && order.drinks.length === 0 && <p><strong>Акция:</strong> {order.promotions[0].title}</p>}
                {!isExpanded && (<p className="order-total"><strong>Общая сумма:</strong> {order.total}₽</p>)}
              </div>
              {isExpanded && (
                <div className="order-details" onClick={() => toggleOrder(order.id)}>
                  {order.drinks.length > 0 && (
                    <>
                      <h4>Позиции:</h4>
                      <ul className="cart-items">
                        {order.drinks.map((drink) => (
                          <OrderItem key={drink.id} drink={drink} />
                        ))}
                      </ul>
                    </>
                  )}

                  {order.promotions.length > 0 && (
                    <>
                      <h4>Акции:</h4>
                      <ul className="cart-promotions">
                        {order.promotions.map((promo) => (
                          <OrderPromotion key={promo.id} promo={promo} />
                        ))}
                      </ul>
                    </>
                  )}
                  <p className="order-total"><strong>Общая сумма:</strong> {order.total}₽</p>
                </div>
              )}
              <button className="repeat-order" onClick={() => repeatOrder(order, cartItems, setCartItems)}>
                Повторить заказ
              </button>
            </div>
          );
        })
      )}
      {orderToCancel && (
        <div className="modal">
          <div className="modal-content">
            <h3>Отмена заказа</h3>
            <p>Вы уверены, что хотите отменить заказ №{orderToCancel.number}?</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={() => confirmCancelOrder(orderToCancel.id, setOrderToCancel)}>
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
