import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../../css/KitchenOrderPage.css";
import config from '../../../env.json';

const host = config.REACT_APP_HOST_URL;

async function getOrders(token) {
    try {
        const response = await axios.get(host + `/kitchen/get-orders`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.status !== 200) {
            console.log(response.status);
        } else {
            return response.data;
        }
    } catch (err) {
        console.log(err);
    }
}

async function getAddress(token) {
    try {
        const response = await axios.get(host + `/kitchen/get-address`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.status !== 200) {
            console.log(response.status);
        } else {
            return response.data;
        }
    } catch (err) {
        console.log(err);
    }
}

async function setOrderStatus(userId, orderId, status, token) {
    try {
        const orderStatusDto = {
            userId,
            orderId,
            status
        };
        const response = await axios.post(host + `/kitchen/set-status`, 
            orderStatusDto,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        if (response.status === 200) {
            return true;
        } else {
            console.log(response.status);
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}

function OrderDiscount({ promo }) {
    const item = promo.discount;
    const products = promo.cafeOrderProducts;
    return (
        <li className="cart-item">
            <div className="cart-item-info">
                {Array.isArray(products) && products.length > 0 && (
                    <ul className="cart-item-drinks">
                        {products.map((drink) => (
                            <li key={drink.product.id}>
                                <p>
                                    <strong>{drink.product.name}</strong> ({drink.size.text})
                                </p>
                                {Array.isArray(drink.cafeOrderProductToppings) && drink.cafeOrderProductToppings.length > 0 && (
                                    <ul className="cart-item-toppings">
                                        {drink.cafeOrderProductToppings.map((toppingDto) => (
                                            <li key={toppingDto.id} className="topping-item">
                                                {toppingDto.topping.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                <p>Количество: {promo.quantity}</p>
            </div>
        </li>
    );
}

function OrderItem({ drink }) {
    const product = drink.product;
    const toppings = drink.cafeOrderProductToppings;
    return (
        <li className="cart-item">
            <div className="cart-item-info">
                <strong>{product.name}</strong> ({drink.size.text})
                {toppings.length > 0 && (
                    <ul className="cart-item-toppings">
                        {toppings.map((topping) => (
                            <li key={topping.id} className="topping-item">
                                {topping.topping.name}
                            </li>
                        ))}
                    </ul>
                )}
                <p>Количество: {drink.quantity}</p>
            </div>
        </li>
    );
}

function KitchenOrderPage() {
    const [orders, setOrders] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("authToken"));
    const [address, setAddress] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const ordersData = await getOrders(token);
            const addressData = await getAddress(token);
            setOrders(ordersData);
            setAddress(addressData);
        };
        fetchData();
    }, []);

    const handleStatusChange = async (userId, orderId, currentStatus, isCancel = false) => {
        let newStatus;
        if (isCancel) {
            newStatus = "Отменён";
        } else if (currentStatus === "Готовится") {
            newStatus = "Готов";
        } else if (currentStatus === "Готов") {
            newStatus = "Выдан";
        } else {
            return;
        }

        const success = await setOrderStatus(userId, orderId, newStatus, token);
        if (success) {
            if (newStatus === "Выдан" || newStatus === "Отменён") {
                setOrders(orders.filter(order => order.id !== orderId));
            } else {
                setOrders(orders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setToken(null);
        window.location.href = "/login";
    };

    return (
        <>
            <div className="kitchen-header">
                <h1>{address}</h1>
                <button className="logout-button" onClick={handleLogout}>
                    Выйти
                </button>
            </div>
            <div className="orders">
                {orders.length !== 0 &&
                    orders.map((order) => {
                        const statusClass = {
                            "Оплачен": "paid",
                            "Готовится": "prepare",
                            "Готов": "ready",
                            "Выдан": "issued",
                            "Отменён": "canceled"
                        }[order.status] || "unknown";

                        return (
                            <div key={order.id} className="order-card">
                                <div className="order-summary">
                                    <div className="order-status-control">
                                        <span className={`order-status ${statusClass}`}>
                                            {order.status}
                                        </span>
                                        <button 
                                            className="cancel-order" 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                handleStatusChange(order.telegramUser.id, order.id, order.status, true); 
                                            }}
                                        >
                                            Отменить
                                        </button>
                                    </div>
                                    <h3>
                                        Заказ №{String(order.orderNumber).padStart(3, "0")} - {new Date(order.orderDateTime).toLocaleString("ru-RU")}
                                    </h3>
                                </div>
                                <div className="order-details">
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
                                    <button
                                        className="status-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusChange(order.telegramUser.id, order.id, order.status);
                                        }}
                                    >
                                        {order.status === "Готовится" ? "Готов" :
                                         order.status === "Готов" ? "Выдать" : "Завершено"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </>
    );
}

export default KitchenOrderPage;