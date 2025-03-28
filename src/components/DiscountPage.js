import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/DiscountPage.css";

const host = "http://localhost:8080";

async function getDiscounts() {
  try {
    const response = await axios.get(host + `/discounts/get-discounts`);
    if (response.status === 200) {
      console.log(response.data);
      return response.data;
    } 
    console.log(response.status);
    return [];
  } catch (err) {
    console.log();
    console.log(err);
    return [];
  }
}

async function getDiscountDetails(discountId) {
  try {
    const response = await axios.get(host + `/discounts/get-discounts/${discountId}`);
    return response.status == 200 ? response.data : null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

function handleClose(setActiveDiscount, setSelectedSizes, setSelectedToppings) {
  document.querySelector(".discount-detail").classList.remove("active");
  setTimeout(() => {
    setActiveDiscount(null);
    setSelectedSizes({});
    setSelectedToppings({});
  }, 300);
}

async function handleDiscountClick(discountId, setActiveDiscount, setSelectedSizes) {
  const discountDetails = await getDiscountDetails(discountId);
  if (discountDetails) {
    setActiveDiscount(discountDetails);
    const defaultSizes = discountDetails.products.reduce((acc, drink) => {
      acc[drink.id] = drink.sizes.length > 0 ? drink.sizes[0] : null;
      return acc;
    }, {});
    setSelectedSizes(defaultSizes);
  }
}

function calculateDiscountPrice(selectedSizes, selectedToppings, activeDiscount) {
  let cost = 0;
  let extraCost = 0;
  activeDiscount.products.forEach((drink) => {
    const sizeObj = selectedSizes[drink.id] || drink.sizes[0];
    cost += sizeObj.price || 0;

    if (selectedToppings[drink.id]) {
      extraCost += selectedToppings[drink.id].reduce((sum, topping) => sum + topping.price, 0);
    }
  });
  return cost * (1 - activeDiscount.discountPercentage) + extraCost;
}

function handleAddToCart(activeDiscount, selectedSizes, selectedToppings, setActiveDiscount, setSelectedSizes, setSelectedToppings) {
  if (!activeDiscount) return;
  const sizes = Object.values(selectedSizes);
  const toppings = Object.values(selectedToppings).flat();

  const totalPrice = calculateDiscountPrice(selectedSizes, selectedToppings, activeDiscount);

  const newPromoItem = {
    id: `promo-${activeDiscount.id}-${sizes.map(size => size.id).join("-")}-${toppings.map(topping => topping.id).join("-")}`,
    discountId: activeDiscount.id,
    name: activeDiscount.name,
    image: activeDiscount.imageURL,
    totalPrice: totalPrice,
    quantity: 1,
    drinks: activeDiscount.products.map((drink) => ({
      id: drink.id,
      quantity: 1,
      name: drink.name,
      size: selectedSizes[drink.id] || drink.sizes[0],
      toppings: selectedToppings[drink.id] || [],
    })),
  };

  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const existingPromoIndex = cartItems.findIndex((item) => item.id === newPromoItem.id);

  if (existingPromoIndex !== -1) {
    cartItems[existingPromoIndex].quantity += 1;
  } else {
    cartItems.push(newPromoItem);
  }
  localStorage.setItem("cartItems", JSON.stringify(cartItems));

  handleClose(setActiveDiscount, setSelectedSizes, setSelectedToppings);
}

function handleToppingChange(e, topping, drinkId, selectedToppings, setSelectedToppings) {
  const newToppings = e.target.checked
    ? [...(selectedToppings[drinkId] || []), topping].filter(
      (t, index, self) => index === self.findIndex((el) => el.id === t.id)
    )
    : (selectedToppings[drinkId] || []).filter((t) => t.id !== topping.id);

  setSelectedToppings((prevToppings) => ({
    ...prevToppings,
    [drinkId]: newToppings,
  }));
}


function DiscountPage() {
  const [activeDiscount, setActiveDiscount] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedToppings, setSelectedToppings] = useState({});
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setDiscounts(await getDiscounts());
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeDiscount) {
      setTimeout(() => {
        document.querySelector(".discount-detail").classList.add("active");
      }, 10);
    }
  }, [activeDiscount]);

  return (
    <div className="discounts-container">
      {discounts.map((discount) => (
        <div
          key={discount.id}
          className="discount-card"
          onClick={async () => await handleDiscountClick(discount.id, setActiveDiscount, setSelectedSizes)}
        >
          <img src={discount.imageURL} alt={discount.name} />
          <h3>{discount.name}</h3>
          <p>{discount.description}</p>
          <p className="prices">
            <span className="discount-price">от {discount.price}₽</span>
          </p>
        </div>
      ))}

      {activeDiscount && (
        <div className="discount-detail">
          <button className="close-card" onClick={() => handleClose(setActiveDiscount, setSelectedSizes, setSelectedToppings)}>
            X
          </button>
          <img src={activeDiscount.imageURL} alt={activeDiscount.name} className="discount-image" />
          <h3>{activeDiscount.name}</h3>
          <p>{activeDiscount.description}</p>

          {activeDiscount.products.map((drink) => (
            <div key={drink.id} className="drink">
              <h3>{drink.name}</h3>

              <div className="option-group">
                <p>Выберите размер:</p>
                <div className="size-buttons">
                  {drink.sizes.map((sizeObj) => (
                    <button
                      key={sizeObj.id}
                      className={`size-button ${selectedSizes[drink.id]?.id === sizeObj.id ? "selected" : ""}`}
                      onClick={() => setSelectedSizes((prev) => ({ ...prev, [drink.id]: sizeObj }))}
                    >
                      {sizeObj.text} (+{sizeObj.price * (1 - activeDiscount.discountPercentage)}₽)
                    </button>
                  ))}
                </div>
              </div>

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
            onClick={() => handleAddToCart(activeDiscount, selectedSizes, selectedToppings, setActiveDiscount, setSelectedSizes, setSelectedToppings)}
          >
            Добавить акцию за {calculateDiscountPrice(selectedSizes, selectedToppings, activeDiscount)}₽
          </button>
        </div>
      )}
    </div>
  );
}

export default DiscountPage;
