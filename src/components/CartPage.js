import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../css/CartPage.css";

function calculateTotalPrice(cartItems) {
    return cartItems.reduce(
        (sum, item) => {
            const itemPrice = item.totalPrice || item.price;
            return sum + itemPrice * item.quantity;
        },
        0
    );
}

function handleQuantityChange(cartItems, setCartItems, id, amount) {
    setCartItems(
        cartItems
            .map((item) =>
                item.id === id
                    ? { ...item, quantity: item.quantity + amount }
                    : item
            )
            .filter((item) => item.quantity > 0)
    );
}

function handlePayment(cartItems, setCartItems, email, address, deliveryMethod, onClose) {
    // if (!email.trim()) {
    //     alert("Введите email для получения чека.");
    //     return;
    // }

    alert("Оплата прошла успешно!");
    setCartItems([]);
    onClose();
}

function CartPage({ cartItems, setCartItems, onClose }) {
    const [deliveryMethod, setDeliveryMethod] = useState("cafe");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState(localStorage.getItem("highlightedCafeId") || "Адрес не выбран");
    const singleItems = cartItems.filter((item) => item.promotionId == null);
    const promotions = cartItems.filter((item) => item.promotionId != null);
    const navigate = useNavigate();
    console.log(cartItems);

    // const calculateDrinkPrice = (drink) => {
    //     const toppingsPrice = drink.toppings?.reduce((sum, topping) => sum + topping.price, 0) || 0;
    //     return drink.price + toppingsPrice;
    // };

    return (
        <div className="overlay">
            <div className="cart-container">
                <button className="close-button" onClick={onClose}> X </button>
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
                            <>
                                <ul className="cart-items">
                                    {singleItems.map((item) => (
                                        <li key={item.id} className="cart-item">
                                            <img src={item.image} alt={item.name} className="cart-item-img" />
                                            <div className="cart-item-info">
                                                <p><strong>{item.name}</strong> ({item.size})</p>


                                                {item.toppings && item.toppings.length > 0 && (
                                                    <ul className="cart-item-toppings">
                                                        {item.toppings.map((topping) => (
                                                            <li key={topping.id} className="topping-item">
                                                                {topping.name} (+{topping.price}₽)
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                <div className="quantity-control">
                                                    <button onClick={() => handleQuantityChange(cartItems, setCartItems, item.id, -1)} >
                                                        -
                                                    </button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => handleQuantityChange(cartItems, setCartItems, item.id, 1)} >
                                                        +
                                                    </button>
                                                </div>
                                                <p>Итого: {item.price * item.quantity}₽</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {promotions.length > 0 && (
                            <>
                                <h3>Акции</h3>
                                <ul className="cart-promotions">
                                    {promotions.map((promo) => (
                                        <li key={promo.id} className="cart-item">
                                            <img src={promo.image} alt={promo.title} className="cart-item-img" />
                                            <div className="cart-item-info">
                                                <h4>{promo.title}</h4>

                                                {Array.isArray(promo.drinks) && promo.drinks.length > 0 && (
                                                    <ul className="cart-item-drinks">
                                                        {promo.drinks.map((drink, index) => (
                                                            <li key={index}>
                                                                <p><strong>{drink.name}</strong> ({drink.size})</p>
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

                                                <div className="quantity-control">
                                                    <button onClick={() => handleQuantityChange(cartItems, setCartItems, promo.id, -1)} >
                                                        -
                                                    </button>
                                                    <span>{promo.quantity}</span>
                                                    <button onClick={() => handleQuantityChange(cartItems, setCartItems, promo.id, 1)} >
                                                        +
                                                    </button>
                                                </div>
                                                <p>Итого: {promo.totalPrice * promo.quantity}₽</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        <h3>Общая сумма: {calculateTotalPrice(cartItems)}₽</h3>

                        <div className="delivery-method">
                            <span className="delivery-label">Упаковать с собой</span>
                            <div
                                className={`delivery-toggle ${deliveryMethod === "takeaway" ? "active" : ""}`}
                                onClick={() => setDeliveryMethod(deliveryMethod === "cafe" ? "takeaway" : "cafe")}
                            >
                                <div className="toggle-circle"></div>
                            </div>
                        </div>

                        <div className="selected-address">
                            <p><strong>Адрес доставки:</strong> {address}</p>
                        </div>



                        {/* <div className="email-input">
                            <label>Email для чека:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Введите email"
                            />
                        </div> */}

                        <button
                            className="pay-button"
                            onClick={() => handlePayment(cartItems, setCartItems, email, address, deliveryMethod, onClose)}
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
