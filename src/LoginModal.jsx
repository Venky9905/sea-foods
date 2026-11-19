
import { useState } from "react";

import {
  Modal,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";

import {
  FiUser,
  FiLock,
  FiUserPlus,
} from "react-icons/fi";

import { MdVerified } from "react-icons/md";
import DeliveryDetails from "./DeliveryDetails";
import { deliveryAreas } from "./deliveryAreas";
import { isJwtUnexpired } from "./authSession";
import { loginCustomer, registerCustomer } from "./authApi";

// --------------------------------------
// LOGIN MODAL
// --------------------------------------

export default function LoginModal({
  show,
  onHide,
  onLoginSuccess,
  onRegisterSuccess,
}) {
  const [mode, setMode] = useState("login");

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    deliveryArea: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------
  // RESET FORM
  // --------------------------------------

  const resetModal = () => {
    setMode("login");

    setLoginForm({
      username: "",
      password: "",
    });

    setRegisterForm({
      name: "",
      mobile: "",
      email: "",
      address: "",
      deliveryArea: "",
      username: "",
      password: "",
      confirmPassword: "",
    });

    setError("");
    setSuccess("");
    setLoading(false);
  };

  // --------------------------------------
  // CLOSE MODAL
  // --------------------------------------

  const handleClose = () => {
    if (loading) return;

    resetModal();
    onHide?.();
  };

  // --------------------------------------
  // OPEN LOGIN
  // --------------------------------------

  const handleOpenLogin = () => {
    setMode("login");
    setError("");
    setSuccess("");
  };

  // --------------------------------------
  // OPEN REGISTER
  // --------------------------------------

  const handleOpenRegister = () => {
    setMode("register");
    setError("");
    setSuccess("");
  };

  // --------------------------------------
  // LOGIN INPUT CHANGE
  // --------------------------------------

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // --------------------------------------
  // REGISTER INPUT CHANGE
  // --------------------------------------

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    setRegisterForm((prev) => ({
      ...prev,
      [name]:
        name === "mobile"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));

    setError("");
  };

  const handleRegistrationAreaChange = (deliveryArea) => {
    setRegisterForm((prev) => ({
      ...prev,
      deliveryArea,
    }));
    setError("");
  };

  // --------------------------------------
  // LOGIN
  // --------------------------------------

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!loginForm.username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!loginForm.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginCustomer({
        username: loginForm.username.trim(),
        password: loginForm.password,
      });

      if (!isJwtUnexpired(data.token)) {
        throw new Error(
          "Login response did not contain a valid, unexpired JWT."
        );
      }

      const customer = data.customer || data.user;

      if (!customer) {
        throw new Error(
          "Login response did not contain customer details."
        );
      }

      // Store authentication token
      localStorage.setItem(
        "customerToken",
        data.token
      );

      // Store customer details
      localStorage.setItem(
        "customer",
        JSON.stringify(customer)
      );

      onLoginSuccess?.(customer, data.token);

      resetModal();
      onHide?.();

    } catch (err) {
      setError(
        err.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------
  // REGISTER VALIDATION
  // --------------------------------------

  const validateRegistration = () => {
    const {
      name,
      mobile,
      email,
      address,
      deliveryArea,
      username,
      password,
      confirmPassword,
    } = registerForm;

    if (
      !name.trim() ||
      !mobile.trim() ||
      !email.trim() ||
      !address.trim() ||
      !deliveryArea ||
      !username.trim() ||
      !password ||
      !confirmPassword
    ) {
      return "Please fill in all fields.";
    }

    if (!/^[A-Za-z\s.'-]{2,100}$/.test(name.trim())) {
      return "Please enter a valid name.";
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return "Enter a valid 10-digit mobile number.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Enter a valid email address.";
    }

    if (
      username.length < 4 ||
      !/^[a-zA-Z0-9_]+$/.test(username)
    ) {
      return "Username must be at least 4 characters. Only letters, numbers and underscores are allowed.";
    }

    if (password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (password !== confirmPassword) {
      return "Password and Confirm Password do not match.";
    }

    return "";
  };

  // --------------------------------------
  // REGISTER CUSTOMER
  // --------------------------------------

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateRegistration();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const data = await registerCustomer({
        name: registerForm.name.trim(),
        mobile: registerForm.mobile,
        email: registerForm.email.trim(),
        address: registerForm.address.trim(),
        deliveryArea: registerForm.deliveryArea,
        username: registerForm.username.trim(),
        password: registerForm.password,
      });

      onRegisterSuccess?.(data.customer || data);

      // Switch to login after successful registration
      setLoginForm({
        username: registerForm.username,
        password: "",
      });

      setRegisterForm({
        name: "",
        mobile: "",
        email: "",
        address: "",
        deliveryArea: "",
        username: "",
        password: "",
        confirmPassword: "",
      });

      setMode("login");

      setSuccess(
        "Registration successful! Please login."
      );

    } catch (err) {
      setError(
        err.message || "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------
  // MODAL UI
  // --------------------------------------

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={!loading}
      className="seafood-login-modal"
    >

      {/* HEADER */}

      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "login"
            ? "Login to Your Account"
            : "Create Your Account"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* ==================================
            LOGIN PAGE
        ================================== */}

        {mode === "login" ? (

          <div className="login-step-one">

            <div className="login-icon">
              <FiUser />
            </div>

            <h5>
              Welcome to Parth Krishna Sea Foods
            </h5>

            <p className="login-description">
              Login to your account and enjoy fresh seafood.
            </p>

            <Form onSubmit={handleLogin}>

              {/* USERNAME */}

              <Form.Group className="mb-3">

                <Form.Label>
                  Username
                </Form.Label>

                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  autoComplete="username"
                />

              </Form.Group>

              {/* PASSWORD */}

              <Form.Group className="mb-3">

                <Form.Label>
                  Password
                </Form.Label>

                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  autoComplete="current-password"
                />

              </Form.Group>

              {/* ERROR */}

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="login-success">
                  {success}
                </div>
              )}

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
                    Logging in...
                  </>
                ) : (
                  <>
                    <FiLock className="me-2" />
                    Login
                  </>
                )}

              </Button>

            </Form>

            {/* REGISTER LINK */}

            <div className="register-login-link">

              Don't have an account?

              <button
                type="button"
                onClick={handleOpenRegister}
              >
                Register
              </button>

            </div>

          </div>

        ) : (

          /* ==================================
              REGISTRATION PAGE
          ================================== */

          <div className="register-form-wrapper">

            <div className="register-icon">
              <FiUserPlus />
            </div>

            <h5>
              Welcome to Parth Krishna Sea Foods
            </h5>

            <p className="register-description">
              Create your account to enjoy fresh seafood.
            </p>

            <Form onSubmit={handleRegister}>

              {/* NAME */}

              <Form.Group className="mb-3">

                <Form.Label>
                  Full Name
                </Form.Label>

                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  autoComplete="name"
                />

              </Form.Group>

              {/* PHONE NUMBER */}

              <Form.Group className="mb-3">

                <Form.Label>
                  Phone Number
                </Form.Label>

                <div className="register-mobile-input">

                  <span>+91</span>

                  <Form.Control
                    type="tel"
                    name="mobile"
                    placeholder="Enter 10-digit phone number"
                    value={registerForm.mobile}
                    onChange={handleRegisterChange}
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="tel-national"
                  />

                </div>

              </Form.Group>

              {/* EMAIL */}

              <Form.Group className="mb-3">

                <Form.Label>
                  Email Address
                </Form.Label>

                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  autoComplete="email"
                />

              </Form.Group>

              <DeliveryDetails
                areas={deliveryAreas}
                deliveryArea={registerForm.deliveryArea}
                onDeliveryAreaChange={handleRegistrationAreaChange}
                address={registerForm.address}
                onAddressChange={(address) =>
                  setRegisterForm((prev) => ({ ...prev, address }))
                }
                addressLabel="Address *"
                addressPlaceholder="Enter your complete address"
                addressRequired
                showLocation={false}
                areaId="register-delivery-area"
                addressId="register-delivery-address"
              />

              {/* USERNAME */}

              <Form.Group className="mb-3">

                <Form.Label>
                  Username
                </Form.Label>

                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Choose your username"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  autoComplete="username"
                />

              </Form.Group>

              {/* PASSWORD */}

              <Form.Group className="mb-3">

                <Form.Label>
                  Password
                </Form.Label>

                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Create your password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  autoComplete="new-password"
                />

              </Form.Group>

              {/* CONFIRM PASSWORD */}

              <Form.Group className="mb-3">

                <Form.Label>
                  Confirm Password
                </Form.Label>

                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  autoComplete="new-password"
                />

              </Form.Group>

              {/* ERROR */}

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {/* CONTINUE BUTTON */}

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
                    Creating Account...
                  </>
                ) : (
                  <>
                    Continue
                    <MdVerified className="ms-2" />
                  </>
                )}

              </Button>

            </Form>

            {/* LOGIN LINK */}

            <div className="register-login-link">

              Already have an account?

              <button
                type="button"
                onClick={handleOpenLogin}
              >
                Login
              </button>

            </div>

          </div>
        )}

      </Modal.Body>

    </Modal>
  );
}
