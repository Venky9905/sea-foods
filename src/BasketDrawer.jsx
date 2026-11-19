
import { useState, useEffect, useMemo, useRef } from "react";
import {
  FiX,
  FiPlus,
  FiMinus,
  FiTrash2,
} from "react-icons/fi";

import { useShop } from "./useShop";
import DeliveryDetails from "./DeliveryDetails";
import { useAuth } from "./useAuth";

export default function BasketDrawer({
  open,
  onClose,
  onPlaceOrder,
}) {
  const {
    cart = [],
    updateQuantity,
    toggleCleaning,
    removeItem,
    clearCart,
    deliveryArea,
    setDeliveryArea,
    deliveryAreas = [],
    itemCount = 0,
    subtotal = 0,
    cleaningTotal = 0,
    deliveryCharge = 0,
  } = useShop();
  const { isAuthenticated, requestLogin, loginOpen } = useAuth();

  // Local states
  const [confirmClear, setConfirmClear] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const pendingOrder = useRef(null);

  // Safe numeric values
  const safeSubtotal = Number(subtotal) || 0;
  const safeCleaningTotal = Number(cleaningTotal) || 0;

  // Add Store Pickup automatically
  const allDeliveryOptions = useMemo(() => {
    const areas = Array.isArray(deliveryAreas)
      ? deliveryAreas
      : [];

    const pickupExists = areas.some(
      (area) => area.name === "Store Pickup"
    );

    return pickupExists
      ? areas
      : [
        { name: "Store Pickup", charge: 0 },
        ...areas,
      ];
  }, [deliveryAreas]);

  // Selected delivery option
  const selectedDelivery = allDeliveryOptions.find(
    (area) => area.name === deliveryArea
  );

  const isStorePickup = deliveryArea === "Store Pickup";

  // Delivery charge
  const currentDeliveryCharge = isStorePickup
    ? 0
    : selectedDelivery
      ? Number(selectedDelivery.charge) || 0
      : Number(deliveryCharge) || 0;

  // Grand total
  const currentGrandTotal =
    safeSubtotal +
    safeCleaningTotal +
    currentDeliveryCharge;

  // Checkout validation
  const isDeliveryDetailsValid =
    isStorePickup ||
    deliveryAddress.trim().length > 0;

  const canCheckout =
    cart.length > 0 &&
    Boolean(deliveryArea) &&
    isDeliveryDetailsValid;

  // Reset address/location when changing delivery option
  useEffect(() => {
    setDeliveryAddress("");
  }, [deliveryArea]);

  // Reset confirmation when drawer closes
  useEffect(() => {
    if (!open) {
      setConfirmClear(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      pendingOrder.current = null;
      return;
    }

    if (isAuthenticated && pendingOrder.current) {
      const order = pendingOrder.current;
      pendingOrder.current = null;
      onPlaceOrder?.(order);
    }
  }, [isAuthenticated, onPlaceOrder, open]);

  useEffect(() => {
    if (!loginOpen && !isAuthenticated) {
      pendingOrder.current = null;
    }
  }, [isAuthenticated, loginOpen]);

  // Prevent background scrolling
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight =
      document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight =
        previousPaddingRight;
    };
  }, [open]);

  // Place order
  const handleCheckout = () => {
    if (!canCheckout) return;

    const orderDetails = {
      orderType: isStorePickup
        ? "Store Pickup"
        : "Home Delivery",

      deliveryArea,

      deliveryAddress: isStorePickup
        ? ""
        : deliveryAddress.trim(),

      customerLocation: isStorePickup
        ? null
        : null,

      deliveryCharge: currentDeliveryCharge,
      subtotal: safeSubtotal,
      cleaningTotal: safeCleaningTotal,
      grandTotal: currentGrandTotal,

      cart: cart.map((item) => ({
        ...item,
      })),

      itemCount,
      createdAt: new Date().toISOString(),
    };

    if (typeof onPlaceOrder !== "function") {
      console.error(
        "onPlaceOrder function is missing. Connect your order creation function."
      );
      alert(
        "Order submission is not connected yet. Please connect onPlaceOrder."
      );
      return;
    }

    if (!isAuthenticated) {
      pendingOrder.current = orderDetails;
      requestLogin();
      return;
    }

    onPlaceOrder(orderDetails);
  };

  if (!open) return null;

  return (
    <div
      className="basket-overlay"
      onClick={onClose}
    >
      <aside
        className="basket-drawer"
        onClick={(event) => event.stopPropagation()}
      >

        {/* HEADER */}
        <div className="basket-header">
          <div>
            <h2>Your Basket</h2>
            <p>{itemCount} different products</p>
          </div>

          <button
            type="button"
            className="basket-close"
            onClick={onClose}
            aria-label="Close basket"
          >
            <FiX />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="basket-empty">
            <h3>Your basket is empty</h3>

            <p>
              Add your favourite seafood to get started.
            </p>

            <button
              type="button"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* CART ITEMS */}
            <div className="basket-items">

              {cart.map((item) => {
                const cleaningAvailable =
                  item.cleaningAvailable !== false;

                const itemPrice =
                  Number(item.price) || 0;

                const itemQuantity =
                  Number(item.quantity) || 0;

                const itemSubtotal =
                  itemPrice * itemQuantity;

                // Cleaning charge: ₹25 per kg
                const itemCleaning =
                  item.cleaning && cleaningAvailable
                    ? 25 * itemQuantity
                    : 0;

                return (
                  <article
                    className="basket-item"
                    key={item.id}
                  >
                    <img
                      className="basket-item-image"
                      src={item.image}
                      alt={item.name}
                    />

                    <div className="basket-item-content">

                      {/* PRODUCT NAME */}
                      <div className="basket-item-title">
                        <div>
                          <h3>{item.name}</h3>

                          <p>
                            ₹{itemPrice.toFixed(2)} / kg
                          </p>
                        </div>

                        <button
                          type="button"
                          className="basket-remove"
                          onClick={() =>
                            removeItem(item.id)
                          }
                          aria-label={`Remove ${item.name}`}
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      {/* QUANTITY */}
                      <div className="basket-quantity">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, -0.5)
                          }
                          disabled={itemQuantity <= 0.5}
                          aria-label="Decrease quantity"
                        >
                          <FiMinus />
                        </button>

                        <span>{itemQuantity} kg</span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, 0.5)
                          }
                          aria-label="Increase quantity"
                        >
                          <FiPlus />
                        </button>
                      </div>

                      {/* CLEANING OPTION */}
                      {cleaningAvailable ? (
                        <label className="basket-cleaning">
                          <input
                            type="checkbox"
                            checked={Boolean(item.cleaning)}
                            onChange={(event) =>
                              toggleCleaning(
                                item.id,
                                event.target.checked
                              )
                            }
                          />

                          <span>
                            Clean this seafood (+₹25/kg)
                          </span>
                        </label>
                      ) : (
                        <p className="basket-no-cleaning">
                          Available without cleaning only
                        </p>
                      )}

                      {/* PRODUCT TOTAL */}
                      <div className="basket-item-total">
                        <span>Seafood</span>
                        <strong>
                          ₹{itemSubtotal.toFixed(2)}
                        </strong>
                      </div>

                      {itemCleaning > 0 && (
                        <div className="basket-item-total">
                          <span>Cleaning</span>
                          <strong>
                            ₹{itemCleaning.toFixed(2)}
                          </strong>
                        </div>
                      )}

                    </div>
                  </article>
                );
              })}

            </div>

            {/* BASKET FOOTER */}
            <div className="basket-footer">

              {/* DELIVERY AREA */}
              <DeliveryDetails
                areas={allDeliveryOptions}
                deliveryArea={deliveryArea}
                onDeliveryAreaChange={setDeliveryArea}
                address={deliveryAddress}
                onAddressChange={setDeliveryAddress}
                includePickup
                showPrices
                showLocation={false}
                addressRequired
              />

              {deliveryArea && !isStorePickup &&
                !deliveryAddress.trim() && (
                  <small className="basket-validation">
                    Please enter your delivery address.
                  </small>
                )}

                {/* STORE PICKUP MESSAGE */}
                {isStorePickup && (
                  <div className="basket-pickup-success">
                    <div className="store-div">
                      <img
                        src="../images/store.svg"
                        className="store img-fluid"
                        alt="store"
                      />

                      <span>
                        Store Pickup Selected
                      </span>
                    </div>

                    <p>
                      No delivery charges. Collect your
                      seafood directly from our store.
                    </p>
                  </div>
                )}

                {/* DELIVERY CHARGE MESSAGE */}
                {deliveryArea && !isStorePickup && (
                  <div className="basket-delivery-info">
                    <span>📍</span>

                    <span>
                      Delivery charge: ₹
                      {currentDeliveryCharge.toFixed(2)}
                    </span>
                  </div>
                )}

              {/* BILL SUMMARY */}
              <div className="basket-bill-row">
                <span>Seafood subtotal</span>
                <strong>
                  ₹{safeSubtotal.toFixed(2)}
                </strong>
              </div>

              <div className="basket-bill-row">
                <span>Cleaning charges</span>
                <strong>
                  ₹{safeCleaningTotal.toFixed(2)}
                </strong>
              </div>

              <div className="basket-bill-row">
                <span>
                  {isStorePickup
                    ? "Store Pickup"
                    : "Delivery charges"}
                </span>

                <strong
                  className={
                    isStorePickup ? "pickup-free" : ""
                  }
                >
                  {isStorePickup
                    ? "FREE"
                    : `₹${currentDeliveryCharge.toFixed(2)}`}
                </strong>
              </div>

              {!deliveryArea && (
                <p className="basket-hint">
                  Please select your delivery area or Store
                  Pickup to continue.
                </p>
              )}

              {/* GRAND TOTAL */}
              <div className="basket-grand-total">
                <span>Total Amount</span>

                <strong>
                  ₹{currentGrandTotal.toFixed(2)}
                </strong>
              </div>

              {/* CLEAR CART */}
              <div className="basket-clear-section">
                {!confirmClear ? (
                  <button
                    type="button"
                    className="basket-clear-btn"
                    onClick={() => setConfirmClear(true)}
                  >
                    <FiTrash2 />
                    Clear All
                  </button>
                ) : (
                  <div className="basket-clear-confirm">
                    <p>
                      Remove all products from your basket?
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        if (typeof clearCart === "function") {
                          clearCart();
                        }

                        setConfirmClear(false);
                      }}
                    >
                      Yes, Clear All
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setConfirmClear(false)
                      }
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* CHECKOUT */}
              <button
                type="button"
                className="basket-checkout-btn"
                disabled={!canCheckout}
                onClick={handleCheckout}
              >
                Continue to Checkout
              </button>

              {!canCheckout && deliveryArea && !isStorePickup && (
                <p className="basket-hint">
                  Enter your address to continue.
                </p>
              )}

            </div>
          </>
        )}

      </aside>
    </div>
  );
}
