
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";

import { FiArrowLeft } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

// Safely read API response
const getResponseData = async (response) => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export default function LoginModal({
  show,
  onHide,
  onLoginSuccess,
}) {
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  const [otp, setOtp] = useState([
    "", "", "", "", "", ""
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const otpRefs = useRef([]);
  // Focus first OTP box
  useEffect(() => {
    if (show && step === 2) {
      const timer = setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [show, step]);

  // Reset modal
  const resetModal = () => {
    setStep(1);
    setName("");
    setMobile("");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccess("");
    setLoading(false);
  };

  // Close modal
  const handleClose = () => {
    if (loading) return;

    resetModal();
    onHide?.();
  };

  // SEND OTP
  const handleGetOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // DEMO LOGIN - Skip actual OTP API in development
    if (import.meta.env.DEV) {
      setOtp(["", "", "", "", "", ""]);
      setStep(2);
      setSuccess("Enter any 6-digit number to continue.");
      return;
    }

    // Production: Send actual OTP
    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/send-whatsapp-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            mobile,
            mode: "login",
          }),
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      setOtp(["", "", "", "", "", ""]);
      setStep(2);
      setSuccess("OTP sent successfully to your WhatsApp number.");

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  // OTP INPUT CHANGE
  const handleOTPChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOTP = [...otp];
    updatedOTP[index] = value;

    setOtp(updatedOTP);
    setError("");

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // BACKSPACE AND ARROW HANDLING
  const handleOTPKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // PASTE OTP
  const handleOTPPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    e.preventDefault();

    const updatedOTP = ["", "", "", "", "", ""];

    pasted.split("").forEach((digit, index) => {
      updatedOTP[index] = digit;
    });

    setOtp(updatedOTP);
    setError("");

    const nextIndex = Math.min(pasted.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  // VERIFY OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const enteredOTP = otp.join("");

    if (enteredOTP.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    // DEMO LOGIN - Accept any 6 digits in development
    if (import.meta.env.DEV) {
      const customer = {
        name: name.trim(),
        mobile: mobile,
      };

      localStorage.setItem(
        "customer",
        JSON.stringify(customer)
      );

      onLoginSuccess?.(customer);

      resetModal();
      onHide?.();

      return;
    }

    // Production: Actual OTP verification
    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/verify-whatsapp-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            mobile,
            otp: enteredOTP,
            mode: "login",
          }),
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP.");
      }

      if (data.token) {
        localStorage.setItem("customerToken", data.token);
      }

      const customer = data.customer || {
        name: name.trim(),
        mobile,
      };

      localStorage.setItem(
        "customer",
        JSON.stringify(customer)
      );

      onLoginSuccess?.(customer);

      resetModal();
      onHide?.();

    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };
  // RESEND OTP
  const handleResendOTP = async () => {
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/send-whatsapp-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            mobile,
            mode: "login",
          }),
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to resend OTP."
        );
      }

      setOtp(["", "", "", "", "", ""]);

      setSuccess(
        "A new OTP has been sent to your WhatsApp."
      );

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);

    } catch (err) {
      setError(
        err.message || "Unable to resend OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  // CHANGE MOBILE NUMBER
  const handleChangeMobile = () => {
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccess("");
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={!loading}
      className="seafood-login-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {step === 1
            ? "Login to Your Account"
            : "Verify Your Number"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* STEP 1: LOGIN */}
        {step === 1 ? (
          <div className="login-step-one">

            <div className="login-icon">
              <FaWhatsapp />
            </div>

            <h5>
              Welcome to Parth Krishna Sea Foods
            </h5>

            <p className="login-description">
              Enter your name and WhatsApp mobile number
              to continue.
            </p>

            <Form onSubmit={handleGetOTP}>

              {/* NAME */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Your Name
                </Form.Label>

                <div className="auth-mobile-input">
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>
              </Form.Group>

              {/* MOBILE NUMBER */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Phone Number
                </Form.Label>

                <div className="login-mobile-input">
                  <span>+91</span>

                  <Form.Control
                    type="tel"
                    placeholder="Enter your 10-digit phone number"
                    value={mobile}
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    onChange={(e) =>
                      setMobile(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                  />
                </div>
              </Form.Group>

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="login-submit-btn w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      size="sm"
                      className="me-2"
                    />
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
          </div>

        ) : (

          /* STEP 2: OTP VERIFICATION */
          <div className="login-step-two">

            <div className="login-icon">
              <FaWhatsapp />
            </div>

            <h5>
              Enter Verification Code
            </h5>

            <p className="login-description">
              We have sent a 6-digit OTP to your WhatsApp number.
            </p>

            <div className="login-otp-mobile">
              +91 {mobile}
            </div>

            <Form onSubmit={handleVerifyOTP}>

              {/* SIX OTP BOXES */}
              <div className="otp-input-wrapper">

                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleOTPChange(
                        e.target.value,
                        index
                      )
                    }
                    onKeyDown={(e) =>
                      handleOTPKeyDown(e, index)
                    }
                    onPaste={handleOTPPaste}
                    className="otp-input"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}

              </div>

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="login-success">
                  {success}
                </div>
              )}

              {/* RESEND OTP */}
              <div className="otp-resend">
                Didn't receive OTP?

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>

              {/* LOGIN BUTTON */}
              <Button
                type="submit"
                className="login-submit-btn w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      size="sm"
                      className="me-2"
                    />
                    Verifying...
                  </>
                ) : (
                  <>
                    Login
                    <MdVerified className="ms-2" />
                  </>
                )}
              </Button>

              {/* CHANGE MOBILE */}
              <button
                type="button"
                className="change-mobile-btn"
                onClick={handleChangeMobile}
                disabled={loading}
              >
                <FiArrowLeft />
                Change Details
              </button>

            </Form>
          </div>
        )}

      </Modal.Body>
    </Modal>
  );
}
