
import { useState } from "react";
import { Form, Button } from "react-bootstrap";

export default function RegisterForm({ onLogin, onRegister }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "mobile"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Object.values(form).some((value) => !value.trim())) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    try {
      if (onRegister) {
        await onRegister(form);
      } else {
        setError("Registration API is not connected yet.");
      }
    } catch (err) {
      setError(err.message || "Registration failed.");
    }
  };

  return (
    <div className="register-form-wrapper">
      <div className="register-icon">
        <i className="bi bi-person-plus"></i>
      </div>

      <h5>Welcome to Parth Krishna Sea Foods</h5>

      <p className="register-description">
        Create your account to enjoy fresh seafood.
      </p>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            name="name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone Number</Form.Label>
          <div className="register-mobile-input">
            <span>+91</span>
            <Form.Control
              name="mobile"
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={form.mobile}
              onChange={handleChange}
              inputMode="numeric"
              autoComplete="tel-national"
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="address"
            placeholder="Enter your complete address"
            value={form.address}
            onChange={handleChange}
            autoComplete="street-address"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            name="username"
            placeholder="Choose a username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            name="password"
            type="password"
            placeholder="Create your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </Form.Group>

        {error && (
          <div className="login-error">{error}</div>
        )}

        <Button
          type="submit"
          className="login-submit-btn w-100"
        >
          Continue
        </Button>
      </Form>

      <div className="register-login-link">
        Already have an account?
        <button type="button" onClick={onLogin}>
          Login
        </button>
      </div>
    </div>
  );
}
