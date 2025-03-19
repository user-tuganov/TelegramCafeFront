import React from "react";

function OrderItem({ drink }) {
  return (
    <li className="cart-item">
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
        <p>Итого: {(drink.price + (drink.toppings?.reduce((sum, topping) => sum + topping.price, 0) || 0)) * drink.quantity}₽</p>
      </div>
    </li>
  );
}


function OrderPromotion({ promo }) {
  return (
    <li className="cart-item">
      <img src={promo.image} alt={promo.title} className="cart-item-img" />
      <div className="cart-item-info">
        <h4>{promo.title}</h4>
        <p className="promo-description">{promo.description}</p>
        {Array.isArray(promo.drinks) && promo.drinks.length > 0 && (
          <ul className="cart-item-drinks">
            {promo.drinks.map((drink) => (
              <li key={drink.id}>
                <p>
                  <strong>{drink.name}</strong> ({drink.size}) - {drink.price}₽
                </p>
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
  );
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
}

export { OrderItem, OrderPromotion, repeatOrder };