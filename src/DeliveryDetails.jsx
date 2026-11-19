import { useState } from "react";
import { FiCheckCircle, FiMapPin } from "react-icons/fi";

export default function DeliveryDetails({
  areas,
  deliveryArea,
  onDeliveryAreaChange,
  address,
  onAddressChange,
  location,
  onLocationChange,
  includePickup = false,
  showPrices = false,
  showLocation = true,
  addressLabel = "Delivery Address *",
  addressPlaceholder = "Enter your complete delivery address...",
  addressRequired = false,
  areaId = "delivery-area",
  addressId = "delivery-address",
}) {
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const availableAreas = includePickup
    ? areas
    : areas.filter((area) => area.name !== "Store Pickup");

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support location sharing."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");
    onLocationChange(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationLoading(false);
        setLocationError("");
      },
      (error) => {
        setLocationLoading(false);
        onLocationChange(null);

        if (error.code === 1) {
          setLocationError(
            "Please allow location permission in your browser."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Your location is unavailable. Please try again."
          );
        } else {
          setLocationError(
            "Location request timed out. Please try again."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="basket-delivery">
      <label htmlFor={areaId}>
        <FiMapPin />
        Select Delivery Area
      </label>

      <div className="basket-delivery-select-wrapper">
        <select
          id={areaId}
          value={deliveryArea || ""}
          onChange={(event) => {
            setLocationError("");
            onLocationChange?.(null);
            onDeliveryAreaChange(event.target.value)
          }}
        >
          <option value="">Choose your delivery area</option>
          {availableAreas.map((area) => (
            <option key={area.name} value={area.name}>
              {showPrices
                ? area.name === "Store Pickup"
                  ? "Store Pickup — FREE"
                  : `${area.name} — ₹${area.charge} delivery`
                : area.name}
            </option>
          ))}
        </select>
      </div>

      {deliveryArea && !(includePickup && deliveryArea === "Store Pickup") && (
        <div className="basket-address-section">
          <label htmlFor={addressId}>{addressLabel}</label>
          <textarea
            id={addressId}
            className="basket-address-input"
            rows={3}
            placeholder={addressPlaceholder}
            value={address}
            onChange={(event) => onAddressChange(event.target.value)}
            required={addressRequired}
          />

          {showLocation && (
            <>
              <button
                type="button"
                className="basket-location-btn"
                onClick={handleShareLocation}
                disabled={locationLoading}
              >
                <FiMapPin />
                {locationLoading ? "Getting Location..." : "Share My Location"}
              </button>

              {location && (
                <div className="basket-location-success">
                  <span>
                    <FiCheckCircle />
                    Location captured successfully
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Shared Location
                  </a>
                </div>
              )}

              {locationError && (
                <small className="basket-validation">{locationError}</small>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}