import React, { useState, useEffect } from "react";
import "../css/DiscountPage.css";

const promotions = [
  {
    id: 1,
    title: "Кофейная Тройка",
    description: "Три вкусных напитка по выгодной цене с возможностью добавить топпинги.",
    image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
    basePrice: 650,
    drinks: [
      {
        id: "1-101",
        name: "Капучино",
        sizes: [
          { size: "0.3 л", price: 0 },
          { size: "0.4 л", price: 30 },
          { size: "0.5 л", price: 50 },
          { size: "0.8 л", price: 80 },
        ],
        toppings: [
          { id: "1-101-1", name: "Шоколадная крошка", price: 50 },
          { id: "1-101-2", name: "Карамельный сироп", price: 40 },
        ],
      },
      {
        id: "1-102",
        name: "Латте",
        sizes: [
          { size: "0.3 л", price: 0 },
          { size: "0.4 л", price: 25 },
          { size: "0.5 л", price: 45 },
          { size: "0.8 л", price: 75 },
        ],
        toppings: [
          { id: "1-102-1", name: "Ванильный сироп", price: 45 },
          { id: "1-102-2", name: "Ореховая крошка", price: 55 },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Кофейная Тройка",
    description: "Три вкусных напитка по выгодной цене с возможностью добавить топпинги.",
    image: "https://statics.mixitup.ru/img/uploads/product2/xl/121/1564.jpg",
    basePrice: 650,
    drinks: [
      {
        id: "2-101",
        name: "Капучино",
        sizes: [
          { size: "0.3 л", price: 0 },
          { size: "0.4 л", price: 30 },
          { size: "0.5 л", price: 50 },
          { size: "0.8 л", price: 80 },
        ],
        toppings: [
          { id: "2-101-1", name: "Шоколадная крошка", price: 50 },
          { id: "2-101-2", name: "Карамельный сироп", price: 40 },
        ],
      },
      {
        id: "2-102",
        name: "Латте",
        sizes: [
          { size: "0.3 л", price: 0 },
          { size: "0.4 л", price: 25 },
          { size: "0.5 л", price: 45 },
          { size: "0.8 л", price: 75 },
        ],
        toppings: [
          { id: "2-102-1", name: "Ванильный сироп", price: 45 },
          { id: "2-102-2", name: "Ореховая крошка", price: 55 },
        ],
      },
    ],
  },
];

// Закрытие окна акции
function handleClose(setActivePromotion, setSelectedSizes, setSelectedToppings) {
  document.querySelector(".promotion-detail").classList.remove("active");
  setTimeout(() => {
    setActivePromotion(null);
    setSelectedSizes({});  // Сброс размеров
    setSelectedToppings({});  // Сброс топпингов
  }, 300);
}

// Расчет итоговой цены
function calculatePromotionPrice(basePrice, selectedSizes, selectedToppings, activePromotion) {
  let extraCost = 0;

  activePromotion.drinks.forEach((drink) => {
    const selectedSize = selectedSizes[drink.id] || drink.sizes[1].size; // 0.4 л по умолчанию
    const sizeObj = drink.sizes.find((s) => s.size === selectedSize);
    extraCost += sizeObj ? sizeObj.price : 0;

    if (selectedToppings[drink.id]) {
      extraCost += selectedToppings[drink.id].reduce((sum, topping) => sum + topping.price, 0);
    }
  });

  return basePrice + extraCost;
}

// Добавление акции в корзину
function handleAddToCart(activePromotion, selectedSizes, selectedToppings, setCartItems, setActivePromotion, setSelectedSizes, setSelectedToppings) {
  if (!activePromotion) return;

  const totalPrice = calculatePromotionPrice(activePromotion.basePrice, selectedSizes, selectedToppings, activePromotion);

  const newPromoItem = {
    id: `promo-${activePromotion.id}-${JSON.stringify(selectedSizes)}-${JSON.stringify(selectedToppings)}`,
    promotionId: activePromotion.id,
    title: activePromotion.title,
    image: activePromotion.image,
    basePrice: activePromotion.basePrice,
    totalPrice: totalPrice,
    quantity: 1,
    drinks: activePromotion.drinks.map((drink) => ({
      name: drink.name,
      size: selectedSizes[drink.id] || drink.sizes[1].size, // 0.4 л по умолчанию
      toppings: selectedToppings[drink.id] || [],
    })),
  };

  setCartItems((prevItems) => {
    const existingPromo = prevItems.find((item) => item.id === newPromoItem.id);
    if (existingPromo) {
      return prevItems.map((item) =>
        item.id === newPromoItem.id ? { ...item, quantity: item.quantity + 1, totalPrice: totalPrice * (item.quantity + 1) } : item
      );
    } else {
      return [...prevItems, newPromoItem];
    }
  });

  handleClose(setActivePromotion, setSelectedSizes, setSelectedToppings);
}

// Выбор топпинга (несколько топпингов, но без дублирования)
function handleToppingChange(e, topping, drinkId, selectedToppings, setSelectedToppings) {
  const newToppings = e.target.checked
    ? [...(selectedToppings[drinkId] || []), topping].filter(
        (t, index, self) => index === self.findIndex((el) => el.id === t.id) // Убираем дубли
      )
    : (selectedToppings[drinkId] || []).filter((t) => t.id !== topping.id);

  setSelectedToppings((prevToppings) => ({
    ...prevToppings,
    [drinkId]: newToppings,
  }));
}

function DiscountPage({ setCartItems }) {
  const [activePromotion, setActivePromotion] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedToppings, setSelectedToppings] = useState({});

  // Устанавливаем размер по умолчанию
  useEffect(() => {
    if (activePromotion) {
      const defaultSizes = activePromotion.drinks.reduce((acc, drink) => {
        acc[drink.id] = "0.4 л"; // 0.4 л по умолчанию
        return acc;
      }, {});
      setSelectedSizes(defaultSizes);
      setTimeout(() => {
        document.querySelector(".promotion-detail").classList.add("active");
      }, 10);
    }
  }, [activePromotion]);

  return (
    <div className="promotions-container">
      {promotions.map((promotion) => (
        <div key={promotion.id} className="promotion-card" onClick={() => setActivePromotion(promotion)}>
          <img src={promotion.image} alt={promotion.title} />
          <h3>{promotion.title}</h3>
          <p>{promotion.description}</p>
          <p className="prices">
            <span className="discount-price">от {promotion.basePrice}₽</span>
          </p>
        </div>
      ))}

      {activePromotion && (
        <div className="promotion-detail">
          <button className="close-card" onClick={() => handleClose(setActivePromotion, setSelectedSizes, setSelectedToppings)}>
          X
          </button>
          <img src={activePromotion.image} alt={activePromotion.title} className="promotion-image" />
          <h3>{activePromotion.title}</h3>
          <p>{activePromotion.description}</p>

          {activePromotion.drinks.map((drink) => (
            <div key={drink.id} className="drink">
              <h3>{drink.name}</h3>

              <div className="option-group">
                <p>Выберите размер:</p>
                <div className="size-buttons">
                  {drink.sizes.map((sizeObj) => (
                    <button
                      key={sizeObj.size}
                      className={`size-button ${selectedSizes[drink.id] === sizeObj.size ? "selected" : ""}`}
                      onClick={() => setSelectedSizes((prev) => ({ ...prev, [drink.id]: sizeObj.size }))}>
                      {sizeObj.size} (+{sizeObj.price}₽)
                    </button>
                  ))}
                </div>
              </div>

              {/* Выбор топпингов */}
              <div className="option-group">
                <p>Добавочные топпинги:</p>
                {drink.toppings.map((topping) => (
                  <div key={topping.id} className="checkbox-group">
                    <input
                      type="checkbox"
                      id={`topping-${topping.id}`}
                      onChange={(e) => handleToppingChange(e, topping, drink.id, selectedToppings, setSelectedToppings)}
                    />
                    <label htmlFor={`topping-${topping.id}`} className="topping-label">
                      <span className="topping-name">{topping.name}</span>
                      <span className="topping-price">{topping.price}₽</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            className="add-to-cart"
            onClick={() => handleAddToCart(activePromotion, selectedSizes, selectedToppings, setCartItems, setActivePromotion, setSelectedSizes, setSelectedToppings)}>
            Добавить акцию за {calculatePromotionPrice(activePromotion.basePrice, selectedSizes, selectedToppings, activePromotion)}₽
          </button>
        </div>
      )}
    </div>
  );
}

export default DiscountPage;
