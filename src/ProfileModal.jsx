
import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";

import {
  FiUser,
  FiPhone,
  FiShoppingBag,
  FiLogOut,
  FiEdit2,
  FiArrowLeft,
} from "react-icons/fi";

import { FaWhatsapp } from "react-icons/fa";

const getResponseData = async (response) => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export default function ProfileModal({
  show,
  customer,
  onHide,
  onCustomerUpdate,
  onLogout,
}) {
  const [showChangeMobile, setShowChangeMobile] =
    useState(false);

  const [newMobile, setNewMobile] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!show) return;

    setShowChangeMobile(false);
    setNewMobile("");
    setOtp("");
    setStep(1);
    setError("");
    setSuccess("");

    // Read locally saved orders.
    // Replace with your orders API when available.
    try {
      const savedOrders = JSON.parse(
        localStorage.getItem("customerOrders") || "[]"
      );

      setOrders(
        Array.isArray(savedOrders) ? savedOrders : []
      );
    } catch {
      setOrders([]);
    }
  }, [show]);

  const handleClose = () => {
    setShowChangeMobile(false);
    setNewMobile("");
    setOtp("");
    setStep(1);
    setError("");
    setSuccess("");
    onHide();
  };

  // Send OTP to new mobile number
  const handleSendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!/^[6-9]\d{9}$/.test(newMobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (newMobile === customer?.mobile) {
      setError("This is already your registered mobile number.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/send-whatsapp-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("customerToken")
              ? {
                Authorization: `Bearer ${localStorage.getItem(
                  "customerToken"
                )}`,
              }
              : {}),
          },
          body: JSON.stringify({
            mobile: newMobile,
            currentMobile: customer?.mobile,
            mode: "change-mobile",
          }),
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send OTP."
        );
      }

      setStep(2);
      setSuccess("OTP sent to your new WhatsApp number.");

    } catch (err) {
      setError(err.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and update mobile number
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/verify-whatsapp-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("customerToken")
              ? {
                Authorization: `Bearer ${localStorage.getItem(
                  "customerToken"
                )}`,
              }
              : {}),
          },
          body: JSON.stringify({
            otp,
            mobile: newMobile,
            currentMobile: customer?.mobile,
            mode: "change-mobile",
          }),
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to verify OTP."
        );
      }

      const updatedCustomer = {
        ...customer,
        ...(data.customer || {}),
        mobile: data.customer?.mobile || newMobile,
      };

      localStorage.setItem(
        "customer",
        JSON.stringify(updatedCustomer)
      );

      if (data.token) {
        localStorage.setItem(
          "customerToken",
          data.token
        );
      }

      onCustomerUpdate?.(updatedCustomer);

      setSuccess("Mobile number updated successfully!");

      setTimeout(() => {
        setShowChangeMobile(false);
        setStep(1);
        setNewMobile("");
        setOtp("");
        setError("");
        setSuccess("");
      }, 1000);

    } catch (err) {
      setError(
        err.message || "Mobile number update failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "Date unavailable"
      : parsed.toLocaleDateString("en-IN");
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="md"
      className="customer-profile-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {showChangeMobile
            ? "Change Mobile Number"
            : "My Profile"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {!showChangeMobile ? (
          <>
            {/* CUSTOMER DETAILS */}
            <div className="customer-profile-header">
              <div className="customer-avatar">
                {String(customer?.name || "C").charAt(0).toUpperCase()}
              </div>

              <div>
                <h5>
                  {String(customer?.name || "Customer")}
                </h5>

                <p>
                  <FaWhatsapp />
                  +91 {customer?.mobile || "Not available"}
                </p>
              </div>
            </div>

            {/* CUSTOMER INFORMATION */}
            <div className="profile-info-card">

              <div className="profile-info-row">
                <span>
                  <FiUser /> Customer Name
                </span>

                <strong>
                  {customer?.name || "-"}
                </strong>
              </div>

              <div className="profile-info-row">
                <span>
                  <FiPhone /> Mobile Number
                </span>

                <strong>
                  +91 {customer?.mobile || "-"}
                </strong>
              </div>

              <button
                type="button"
                className="change-mobile-action"
                onClick={() => {
                  setShowChangeMobile(true);
                  setError("");
                  setSuccess("");
                }}
              >
                <FiEdit2 />
                Change Mobile Number
              </button>

            </div>

            {/* ORDER SUMMARY */}
            <div className="customer-orders-heading">
              <h5>
                <FiShoppingBag />
                My Orders
              </h5>

              <span>{orders.length} Orders</span>
            </div>

            <div className="customer-order-list">

              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <div
                    className="customer-order-card"
                    key={order.id || order.orderId || index}
                  >
                    <div className="customer-order-top">
                      <strong>
                        Order #{order.orderId || order.id || index + 1}
                      </strong>

                      <span className="customer-order-status">
                        {order.status || "Placed"}
                      </span>
                    </div>

                    <div className="customer-order-bottom">
                      <span>
                        {formatDate(order.createdAt || order.date)}
                      </span>

                      <strong>
                        ₹{Number(order.total || order.amount || 0).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-customer-orders">
                  <FiShoppingBag />
                  <p>No orders found.</p>
                  <small>Your orders will appear here.</small>
                </div>
              )}

            </div>

            {/* LOGOUT */}
            <button
              type="button"
              className="customer-logout-btn"
              onClick={onLogout}
            >
              <FiLogOut />
              Logout
            </button>
          </>
        ) : (
          <>
            {/* CHANGE MOBILE */}
            <div className="change-mobile-content">

              <div className="profile-change-icon">
                <FaWhatsapp />
              </div>

              <h5>Update WhatsApp Number</h5>

              <p>
                Current number: +91 {customer?.mobile}
              </p>

              {step === 1 ? (
                <Form onSubmit={handleSendOTP}>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      New WhatsApp Mobile Number
                    </Form.Label>

                    <div className="profile-mobile-input">
                      <span>+91</span>

                      <Form.Control
                        type="tel"
                        placeholder="Enter new mobile number"
                        value={newMobile}
                        maxLength={10}
                        inputMode="numeric"
                        onChange={(e) =>
                          setNewMobile(
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10)
                          )
                        }
                      />
                    </div>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="profile-submit-btn w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <FaWhatsapp className="me-2" />
                        Get OTP
                      </>
                    )}
                  </Button>

                </Form>
              ) : (
                <Form onSubmit={handleVerifyOTP}>

                  <Form.Group className="mb-3">
                    <Form.Label>Enter 6-digit OTP</Form.Label>

                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter OTP"
                      value={otp}
                      maxLength={6}
                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="profile-submit-btn w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Update Number"
                    )}
                  </Button>

                </Form>
              )}

              {error && (
                <div className="login-error mt-3">
                  {error}
                </div>
              )}

              {success && (
                <div className="login-success mt-3">
                  {success}
                </div>
              )}

              <button
                type="button"
                className="change-mobile-back"
                onClick={() => {
                  setShowChangeMobile(false);
                  setStep(1);
                  setError("");
                  setSuccess("");
                }}
                disabled={loading}
              >
                <FiArrowLeft />
                Back to Profile
              </button>

            </div>
          </>
        )}

      </Modal.Body>
    </Modal>
  );
}
