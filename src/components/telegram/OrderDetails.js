import React from "react";

function OrderItem({ drink }) {
  const product = drink.product;
  const toppings = drink.cafeOrderProductToppings;
  return (
    <li className="cart-item">
      <img src={product.imageURL} alt={product.name} className="cart-item-img" />
      <div className="cart-item-info">
        <strong>{product.name}</strong> ({drink.size.text}) - {drink.size.price}₽
        {toppings.length > 0 && (
          <ul className="cart-item-toppings">
            {toppings.map((topping) => (
              <li key={topping.id} className="topping-item">
                {topping.topping.name} (+{topping.topping.price}₽)
              </li>
            ))}
          </ul>
        )}
        <p>Количество: {drink.quantity}</p>
        <p>Итого: {(drink.size.price + (toppings?.reduce((sum, topping) => sum + topping.price, 0) || 0)) * drink.quantity}₽</p>
      </div>
    </li>
  );
}

function calculateTotalPrice(promo) {
  if (!promo || !promo.cafeOrderProducts) return 0;

  let total = promo.cafeOrderProducts.reduce((sum, drink) => {
    let toppingPrice = 0;
    if (Array.isArray(drink.cafeOrderProductToppings)) {
      toppingPrice += drink.cafeOrderProductToppings.reduce((toppingSum, toppingDto) => toppingSum + toppingDto.topping.price, 0);
    }

    return sum + drink.size.price * (1 - promo.discount.discountPercentage) + toppingPrice;
  }, 0);

  if (promo.discount && promo.discount.discountValue) {
    total -= promo.discount.discountValue;
  }

  return Math.max(total, 0);
}

function OrderDiscount({ promo }) {
  const item = promo.discount;
  const products = promo.cafeOrderProducts;
  return (
    <li className="cart-item">
      <img src={item.imageURL} alt={item.name} className="cart-item-img" />
      <div className="cart-item-info">
        <h4>{item.name}</h4>
        <p className="promo-description">{item.description}</p>
        {Array.isArray(products) && products.length > 0 && (
          <ul className="cart-item-drinks">
            {products.map((drink) => (
              <li key={drink.product.id}>
                <p>
                  <strong>{drink.product.name}</strong> ({drink.size.text}) - {drink.size.price * (1 - item.discountPercentage)}₽
                </p>
                {Array.isArray(drink.cafeOrderProductToppings) && drink.cafeOrderProductToppings.length > 0 && (
                  <ul className="cart-item-toppings">
                    {drink.cafeOrderProductToppings.map((toppingDto) => (
                      <li key={toppingDto.id} className="topping-item">
                        {toppingDto.topping.name} (+{toppingDto.topping.price}₽)
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
        <p>Количество: {promo.quantity}</p>
        <p>Итого: {calculateTotalPrice(promo) * promo.quantity}₽</p>
      </div>
    </li>
  );
};

function repeatOrder(order, cartItems, setCartItems) {
  const newCartItems = Array.isArray(cartItems) ? [...cartItems] : [];
  order.products.forEach((drink) => {
    const itemId = `${drink.product.id}-${drink.size.id}-${drink.cafeOrderProductToppings.map(t => t.topping.id).join("-")}`;
    console.log(itemId);
    const existingItemIndex = newCartItems.findIndex(item => item.id === itemId);

    if (existingItemIndex !== -1) {
      newCartItems[existingItemIndex].quantity += drink.quantity;
    } else {
      newCartItems.push({
        id: itemId,
        productId: drink.product.id,
        imageURL: drink.product.imageURL,
        name: drink.product.name,
        size: drink.size,
        toppings: drink.cafeOrderProductToppings.map(item => item.topping) || [],
        quantity: drink.quantity,
        price: drink.size.price + (drink.cafeOrderProductToppings?.reduce((sum, item) => sum + (item.topping?.price || 0), 0) || 0)
      });
      console.log(newCartItems);
    }
  });
  order.discounts.forEach((promo) => {
    const products = promo.cafeOrderProducts;
    console.log(promo);
    const productsId = products.map(item => item.size.id).join("-");
    const toppings = products.map(item => item.cafeOrderProductToppings.map(item2 => item2.topping)).flat();
    const toppingsId = toppings.map(item => item.id).join("-")
    const promoId = `promo-${promo.discount.id}-${productsId}-${toppingsId}`;
    console.log(promoId);


    const existingPromoIndex = newCartItems.findIndex((item) => item.id === promoId);
    const totalPrice = calculateTotalPrice(promo);

    if (existingPromoIndex !== -1) {
      newCartItems[existingPromoIndex].quantity += promo.quantity;
      newCartItems[existingPromoIndex].totalPrice = totalPrice * newCartItems[existingPromoIndex].quantity;
    } else {
      newCartItems.push({
        id: promoId,
        discountId: promo.discount.id,
        title: promo.discount.name,
        image: promo.discount.imageURL,
        quantity: promo.quantity,
        totalPrice,
        drinks: promo.cafeOrderProducts.map((drink) => ({
          id: drink.product.id,
          quantity: 1,
          name: drink.product.name,
          size: drink.size,
          toppings: drink.cafeOrderProductToppings.map(item => item.topping) || []
        })),
      });
    }
  });

  setCartItems(newCartItems);
}


export { OrderItem, OrderDiscount, repeatOrder };