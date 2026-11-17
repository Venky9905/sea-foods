
import {
  useMemo,
  useState,
  useCallback,
} from "react";

import ShopContext from "./ShopContext";
import { deliveryAreas } from "./deliveryAreas";

export function ShopProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [deliveryArea, setDeliveryArea] = useState("");

  // ADD TO CART
  const addToCart = useCallback((product, quantity = 0.5) => {
    if (!product || !product.id || !Number.isFinite(Number(product.price))) {
      return;
    }

    const validQuantity = Math.max(
      0.5,
      Math.round(Number(quantity) * 2) / 2
    );

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? {
              ...item,
              quantity: item.quantity + validQuantity,
            }
            : item
        );
      }

      return [
        ...previous,
        {
          ...product,
          price: Number(product.price),
          quantity: validQuantity,
          cleaning: false,
        },
      ];
    });
  }, []);

  // UPDATE QUANTITY
  const updateQuantity = useCallback((id, change) => {
    setCart((previous) =>
      previous.map((item) => {
        if (item.id !== id) return item;

        const newQuantity =
          Math.round((item.quantity + change) * 2) / 2;

        return {
          ...item,
          quantity: Math.max(0.5, newQuantity),
        };
      })
    );
  }, []);

  // SET EXACT QUANTITY
  const setQuantity = useCallback((id, quantity) => {
    const validQuantity = Number(quantity);

    if (!Number.isFinite(validQuantity) || validQuantity < 0.5) {
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
            ...item,
            quantity: Math.round(validQuantity * 2) / 2,
          }
          : item
      )
    );
  }, []);

  // TOGGLE CLEANING
  const toggleCleaning = useCallback((id, cleaning) => {
    setCart((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
            ...item,
            cleaning:
              item.cleaningAvailable !== false
                ? cleaning
                : false,
          }
          : item
      )
    );
  }, []);

  // REMOVE ITEM
  const removeItem = useCallback((id) => {
    setCart((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }, []);

  // CLEAR CART
  const clearCart = useCallback(() => {
    setCart([]);
    setDeliveryArea("");
  }, []);

  // SELECTED DELIVERY AREA
  const selectedArea = deliveryAreas.find(
    (area) => area.name === deliveryArea
  );

  // CART TOTALS
  const itemCount = cart.length;

  const totalQuantity = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // CLEANING: ₹12 per ½ kg, ₹25 per full kg
  const cleaningTotal = cart.reduce((total, item) => {
    if (!item.cleaning || item.cleaningAvailable === false) {
      return total;
    }

    const fullKg = Math.floor(item.quantity);
    const halfKg = item.quantity - fullKg >= 0.5;

    const charge = fullKg * 25 + (halfKg ? 12 : 0);

    return total + charge;
  }, 0);

  // DELIVERY CHARGE
  const deliveryCharge = cart.length
    ? selectedArea?.charge ?? 0
    : 0;

  // GRAND TOTAL
  const grandTotal =
    subtotal + cleaningTotal + deliveryCharge;

  // CONTEXT VALUE
  const value = useMemo(
    () => ({
      cart,
      setCart,

      addToCart,
      updateQuantity,
      setQuantity,
      toggleCleaning,
      removeItem,
      clearCart,

      deliveryArea,
      setDeliveryArea,
      deliveryAreas,

      itemCount,
      totalQuantity,
      subtotal,
      cleaningTotal,
      deliveryCharge,
      grandTotal,
    }),
    [
      cart,
      addToCart,
      updateQuantity,
      setQuantity,
      toggleCleaning,
      removeItem,
      clearCart,
      deliveryArea,
      itemCount,
      totalQuantity,
      subtotal,
      cleaningTotal,
      deliveryCharge,
      grandTotal,
    ]
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}
