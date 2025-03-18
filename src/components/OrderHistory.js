import React from "react";
import { Link } from "react-router-dom";
import "../css/OrderHistory.css";

const orderHistory = [
  {
    id: 1,
    datetime: "2024-03-11 14:30",
    address: "Кофейня на Ленина, 12",
    total: 1280,
    status: "Выдан",
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
    datetime: "2024-03-08 10:15",
    address: "Кофейня на Пушкина, 5",
    total: 1050,
    status: "Отменен",
    drinks: [
      {
        id: 4,
        name: "Флэт Уайт",
        size: "0.3 л",
        image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
        toppings: [{ id: 104, name: "Ореховая крошка", price: 30 }],
        price: 280,
        quantity: 1,
      },
      {
        id: 5,
        name: "Американо",
        size: "0.4 л",
        image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
        toppings: [],
        price: 170,
        quantity: 1,
      },
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
];


function calculateDrinkTotal(drink) {
  const toppingsTotal = drink.toppings?.reduce((sum, topping) => sum + topping.price, 0) || 0;
  return (drink.price + toppingsTotal) * drink.quantity;
}

function repeatOrder(order, cartItems, setCartItems) {

  const newCartItems = Array.isArray(cartItems) ? [...cartItems] : [];

  order.drinks.forEach((drink) => {
    newCartItems.push({
      id: `${drink.id}-${drink.size}-${drink.quantity}`,
      productId: drink.id,
      image: drink.image,
      name: drink.name,
      size: drink.size,
      price: drink.price + (drink.toppings?.reduce((sum, topping) => sum + topping.price, 0) || 0),
      quantity: drink.quantity,
      toppings: drink.toppings || [],
    });
  });

  order.promotions.forEach((promo) => {
    newCartItems.push({
      id: `promo-${promo.id}-${JSON.stringify(promo.drinks.reduce((sizes, drink) => {
        sizes[drink.id] = drink.size;
        return sizes;
      }, {}))}-${JSON.stringify(promo.drinks.reduce((toppings, drink) => {
        toppings[drink.id] = drink.toppings;
        return toppings;
      }, {}))}`,
      promotionId: promo.id,
      title: promo.title,
      image: promo.image,
      basePrice: promo.discountPrice,
      quantity: promo.quantity,
      totalPrice: promo.discountPrice * promo.quantity,
      drinks: promo.drinks.map((drink) => ({
        id: drink.id,
        name: drink.name,
        size: drink.size,
        image: drink.image,
        price: drink.price,
        toppings: drink.toppings || [],
        quantity: drink.quantity,
      })),
    });
  });
  setCartItems(newCartItems);
  console.log("Повторение заказа:", newCartItems);
}

function OrderHistory({ cartItems, setCartItems }) {

  return (
    <div className="order-history">
      <Link to="/profile" className="close-history-btn">X</Link>
      <h2>История заказов</h2>

      {orderHistory.length === 0 ? (
        <p className="empty-history">Вы еще не делали заказов.</p>
      ) : (
        orderHistory.map((order) => (
          <div key={order.id} className="order-card">
            <h3>
              Заказ от {order.datetime}
              <span className={`order-status ${order.status === "Выдан" ? "delivered" : "cancelled"}`}>
                {order.status}
              </span>
            </h3>
            <p className="order-address"><strong>Адрес:</strong> {order.address}</p>

            {order.drinks.length > 0 && (
              <>
                <h4>Позиции:</h4>
                <ul className="cart-items">
                  {order.drinks.map((drink) => (
                    <li key={drink.id} className="cart-item">
                      <img src={drink.image} alt={drink.name} className="cart-item-img" />
                      <div className="cart-item-info">
                        <strong>{drink.name}</strong> ({drink.size}) - {drink.price}₽

                        {drink.toppings.length > 0 && (
                          <ul className="cart-item-toppings">
                            {drink.toppings.map((topping) => (
                              <li key={topping.id} className="topping-item">
                                {topping.name} (+{topping.price}₽)
                              </li>
                            ))}
                          </ul>
                        )}

                        <p>Количество: {drink.quantity}</p>
                        <p>Итого: {calculateDrinkTotal(drink)}₽</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {order.promotions.length > 0 && (
              <>
                <h4>Акции:</h4>
                <ul className="cart-promotions">
                  {order.promotions.map((promo) => (
                    <li key={promo.id} className="cart-item">
                      <img src={promo.image} alt={promo.title} className="cart-item-img" />
                      <div className="cart-item-info">
                        <h4>{promo.title}</h4>
                        <p className="promo-description">{promo.description}</p>

                        {Array.isArray(promo.drinks) && promo.drinks.length > 0 && (
                          <ul className="cart-item-drinks">
                            {promo.drinks.map((drink) => (
                              <li key={drink.id}>
                                <p><strong>{drink.name}</strong> ({drink.size}) - {drink.price}₽</p>
                                {Array.isArray(drink.toppings) && drink.toppings.length > 0 && (
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

                        <p>Количество: {promo.quantity}</p>
                        <p>Итого: {promo.discountPrice * promo.quantity}₽</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="order-total"><strong>Общая сумма:</strong> {order.total}₽</p>

            <button className="repeat-order-btn" onClick={() => repeatOrder(order, cartItems, setCartItems)}>
              Повторить заказ
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderHistory;