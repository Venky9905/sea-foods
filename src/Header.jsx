
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import { FiShoppingBag, FiUser } from "react-icons/fi";
import { MdDashboardCustomize } from "react-icons/md";

import { useShop } from "./useShop";
import ProfileModal from "./ProfileModal";
import { useAuth } from "./useAuth";

export default function Header() {
  const [expanded, setExpanded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { itemCount } = useShop();
  const { customer, requestLogin, logout, updateCustomer } = useAuth();
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

  // Login popup
  const handleLogin = () => {
    setExpanded(false);
    setProfileOpen(false);
    requestLogin();
  };

  // Profile popup
  const handleProfile = () => {
    setExpanded(false);

    if (customer) {
      setProfileOpen(true);
    } else {
      setProfileOpen(false);
      requestLogin();
    }
  };

  // Customer details update
  const handleCustomerUpdate = (updatedCustomer) => {
    if (!updatedCustomer) return;
    updateCustomer(updatedCustomer);
  };

  // Logout
  const handleLogout = () => {
    logout();
    setProfileOpen(false);
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
                window.dispatchEvent(new Event("open-seafood-basket"));
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

      {/* PROFILE MODAL */}
      <ProfileModal
        show={profileOpen && Boolean(customer)}
        customer={customer}
        onHide={() => setProfileOpen(false)}
        onCustomerUpdate={handleCustomerUpdate}
        onLogout={handleLogout}
      />

    </>
  );
}
