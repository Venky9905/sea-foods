
import { useState } from "react";

import Banner from "./Banner";
import CartItem from "./CartItem";
import Header from "./Header";
import BasketDrawer from "./BasketDrawer";
import Footer from "./Footer";

export default function Home() {
  const [basketOpen, setBasketOpen] = useState(false);

  const handleOpenBasket = () => {
    setBasketOpen(true);
  };

  const handleCloseBasket = () => {
    setBasketOpen(false);
  };

  const handlePlaceOrder = (orderDetails) => {
    try {
      const existingOrders = JSON.parse(
        localStorage.getItem("seafoodOrders") || "[]"
      );

      const newOrder = {
        ...orderDetails,
        id: Date.now(),
        orderNumber: `PKSF-${Date.now()}`,
        status: "Pending",
        paymentStatus: "Pending",
      };

      localStorage.setItem(
        "seafoodOrders",
        JSON.stringify([...existingOrders, newOrder])
      );

      alert("Your order has been placed successfully!");

      setBasketOpen(false);
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Unable to place your order.");
    }
  };

  return (
    <>
      <Header />

      <Banner />

      <CartItem
        onOpenBasket={handleOpenBasket}
      />

      <Footer />

      <BasketDrawer
        open={basketOpen}
        onClose={handleCloseBasket}
        onPlaceOrder={handlePlaceOrder}
      />
    </>
  );
}
