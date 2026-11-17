
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import { FiShoppingBag, FiUser } from "react-icons/fi";
import { MdDashboardCustomize } from "react-icons/md";

import { useShop } from "./useShop";
import BasketDrawer from "./BasketDrawer";
import LoginModal from "./LoginModal";
import ProfileModal from "./ProfileModal";

// Read customer from localStorage
const getSavedCustomer = () => {
  try {
    const saved = localStorage.getItem("customer");
    if (!saved) return null;

    const parsed = JSON.parse(saved);

    return parsed && typeof parsed === "object"
      ? parsed
      : null;
  } catch (error) {
    console.error("Customer storage error:", error);
    return null;
  }
};

export default function Header() {
  const [expanded, setExpanded] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);

  // Separate modal visibility
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [authMode, setAuthMode] = useState("register");

  // Customer state
  const [customer, setCustomer] = useState(getSavedCustomer);

  const { itemCount } = useShop();
  const location = useLocation();

  const links = [
    { label: "Home", to: "/" },
    { label: "Catalog", to: "/#categories" },
    { label: "Shop", to: "/#catalog" },
    { label: "Contact Us", to: "/#contact" },
  ];

  // Homepage section navigation
  useEffect(() => {
    if (!location.hash) return;

    const sectionId = decodeURIComponent(
      location.hash.substring(1)
    );

    const timer = setTimeout(() => {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  // Basket event
  useEffect(() => {
    const openBasket = () => setBasketOpen(true);

    window.addEventListener(
      "open-seafood-basket",
      openBasket
    );

    return () => {
      window.removeEventListener(
        "open-seafood-basket",
        openBasket
      );
    };
  }, []);

  // Sync customer from other tabs
  useEffect(() => {
    const syncCustomer = () => {
      setCustomer(getSavedCustomer());
    };

    window.addEventListener("storage", syncCustomer);

    return () => {
      window.removeEventListener("storage", syncCustomer);
    };
  }, []);


  // Login popup
  const handleLogin = () => {
    setExpanded(false);
    setProfileOpen(false);
    setAuthMode("login");
    setAuthOpen(true);
  };

  // Profile popup
  const handleProfile = () => {
    setExpanded(false);

    const savedCustomer = getSavedCustomer();

    if (savedCustomer) {
      setCustomer(savedCustomer);
      setAuthOpen(false);
      setProfileOpen(true);
    } else {
      setProfileOpen(false);
      setAuthMode("login");
      setAuthOpen(true);
    }
  };

  const handleAuthSuccess = (customerData) => {
    console.log("Customer received from LoginModal:", customerData);

    // LoginModal passes the customer object directly
    const mobile =
      customerData?.mobile ||
      customerData?.phone ||
      customerData?.mobileNumber ||
      customerData?.whatsappNumber;

    if (!mobile) {
      console.error("Customer mobile number missing:", customerData);
      return;
    }

    const updatedCustomer = {
      ...customerData,
      name: String(
        customerData?.name ||
        customerData?.fullName ||
        customerData?.customerName ||
        "Customer"
      ),
      mobile: String(mobile),
    };

    // Save customer details
    localStorage.setItem(
      "customer",
      JSON.stringify(updatedCustomer)
    );

    setCustomer(updatedCustomer);

    // Close login and profile popups
    setAuthOpen(false);
    setProfileOpen(false);

    console.log("Customer successfully saved:", updatedCustomer);
  };

  // Customer details update
  const handleCustomerUpdate = (updatedCustomer) => {
    if (!updatedCustomer) return;

    localStorage.setItem(
      "customer",
      JSON.stringify(updatedCustomer)
    );

    setCustomer(updatedCustomer);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("customer");
    localStorage.removeItem("customerToken");

    setCustomer(null);
    setProfileOpen(false);
    setAuthOpen(false);
    setAuthMode("register");
  };

  const handleCloseBasket = () => {
    setBasketOpen(false);
  };
  return (
    <>
      <Navbar
        expand="lg"
        expanded={expanded}
        onToggle={setExpanded}
        className="seafood-navbar"
      >
        <Container fluid>

          {/* LOGO */}
          <Navbar.Brand
            as={Link}
            to="/"
            onClick={() => setExpanded(false)}
          >
            <img
              src="../images/logo.png"
              alt="Parth Krishna Sea Foods"
              className="img-fluid brand-logo"
            />
          </Navbar.Brand>

          {/* MOBILE MENU */}
          <Navbar.Toggle
            aria-controls="seafood-navbar-nav"
            aria-label={
              expanded ? "Close navigation" : "Open navigation"
            }
          >
            <span
              className={`custom-menu-icon ${expanded ? "is-open" : ""
                }`}
            >
              {expanded ? (
                <img
                  src="../images/close.svg"
                  className="img-fluid"
                  alt="Close"
                />
              ) : (
                <img
                  src="../images/menu.svg"
                  className="img-fluid"
                  alt="Menu"
                />
              )}
            </span>
          </Navbar.Toggle>

          {/* NAVIGATION */}
          <Navbar.Collapse id="seafood-navbar-nav">
            <Nav className="ms-auto seafood-nav">
              {links.map((link) => (
                <Nav.Link
                  as={Link}
                  to={link.to}
                  key={link.label}
                  onClick={() => setExpanded(false)}
                >
                  {link.label}
                </Nav.Link>
              ))}
            </Nav>
          </Navbar.Collapse>

          {/* HEADER BUTTONS */}
          <div className="header-main-buttons">

            {/* DASHBOARD */}
            <Link
              to="/dashboard"
              className="dashboard-header-btn"
              onClick={() => setExpanded(false)}
            >
              <MdDashboardCustomize />
            </Link>

            {/* REGISTER */}
            {/* SIGN IN / PROFILE */}
            {!customer ? (
              <button
                type="button"
                className="signin-btn"
                onClick={handleLogin}
              >
                Sign in
              </button>
            ) : (
              <button
                type="button"
                className="profile-box"
                onClick={handleProfile}
                aria-label="Open customer profile"
              >
                <FiUser />
              </button>
            )}

            {/* BASKET */}
            <button
              type="button"
              className="header-basket-btn basket-btn"
              onClick={() => {
                setExpanded(false);
                setBasketOpen(true);
              }}
            >
              <FiShoppingBag />
              <span>Basket</span>
              <span className="header-basket-count">
                {itemCount}
              </span>
            </button>

          </div>
        </Container>
      </Navbar>

      {/* LOGIN / REGISTER MODAL */}
      <LoginModal
        show={authOpen && !profileOpen}
        initialMode={authMode}
        onHide={() => setAuthOpen(false)}
        onLoginSuccess={handleAuthSuccess}
        onModeChange={setAuthMode}
      />

      {/* PROFILE MODAL */}
      <ProfileModal
        show={profileOpen && Boolean(customer)}
        customer={customer}
        onHide={() => setProfileOpen(false)}
        onCustomerUpdate={handleCustomerUpdate}
        onLogout={handleLogout}
      />

      {/* BASKET DRAWER */}
      <BasketDrawer
        open={basketOpen}
        onClose={handleCloseBasket}
      />
    </>
  );
}
