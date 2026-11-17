
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const deliveryAreas = [
  { name: "AIIMS Quarters and Hostels", charge: 15 },
  { name: "6th Battalion", charge: 15 },
  { name: "Kotapeta", charge: 15 },
  { name: "Navuluru", charge: 15 },
  { name: "Erraballem", charge: 15 },
  { name: "Dolas Nagar", charge: 15 },
  { name: "Nulakapeta", charge: 15 },
  { name: "Patha Mangalagiri", charge: 15 },
  { name: "NRI", charge: 15 },
  { name: "Tadepalli", charge: 25 },
  { name: "KL University", charge: 25 },
  { name: "Eppatam", charge: 25 },
  { name: "Rain Tree Park", charge: 25 },
  { name: "Mandhadam", charge: 25 },
];

const initialProducts = [
  { id: 1, name: "Sankara", price: 280, stock: 50, image: "🐟" },
  { id: 2, name: "Ayala (Small Eye)", price: 260, stock: 40, image: "🐟" },
  { id: 3, name: "Nethili", price: 300, stock: 35, image: "🐠" },
  { id: 4, name: "Prawns", price: 360, stock: 30, image: "🦐" },
  { id: 5, name: "Crabs", price: 280, stock: 25, image: "🦀" },
  { id: 6, name: "Squid (Kanawa)", price: 300, stock: 20, image: "🦑" },
  { id: 7, name: "Vanjaram", price: 250, stock: 30, image: "🐟" },
];

const initialOrders = [
  {
    id: 1001,
    customer: "Ramesh Kumar",
    phone: "9876543210",
    address: "Navuluru, Mangalagiri",
    date: "11 Nov 2026, 10:25 AM",
    deliveryCharge: 15,
    status: "new",
    items: [
      { productId: 1, name: "Sankara", qty: 20, cleanedQty: 12, rate: 280 },
      { productId: 4, name: "Prawns", qty: 5, cleanedQty: 0, rate: 360 },
    ],
  },
  {
    id: 1002,
    customer: "Suresh Babu",
    phone: "9123456780",
    address: "AIIMS Quarters and Hostels",
    date: "11 Nov 2026, 11:10 AM",
    deliveryCharge: 15,
    status: "packed",
    items: [
      { productId: 1, name: "Sankara", qty: 10, cleanedQty: 8, rate: 280 },
      { productId: 2, name: "Ayala (Small Eye)", qty: 8, cleanedQty: 3, rate: 260 },
    ],
  },
  {
    id: 1003,
    customer: "Lakshmi Devi",
    phone: "9988776655",
    address: "Kotapeta",
    date: "11 Nov 2026, 12:05 PM",
    deliveryCharge: 15,
    status: "delivered",
    items: [
      { productId: 1, name: "Sankara", qty: 10, cleanedQty: 5, rate: 280 },
      { productId: 3, name: "Nethili", qty: 4, cleanedQty: 2, rate: 300 },
    ],
  },
  {
    id: 1004,
    customer: "Prasad111",
    phone: "9000012345",
    address: "6th Battalion",
    date: "11 Nov 2026, 01:15 PM",
    deliveryCharge: 15,
    status: "payment",
    items: [
      { productId: 2, name: "Ayala (Small Eye)", qty: 6, cleanedQty: 2, rate: 260 },
      { productId: 5, name: "Crabs", qty: 3, cleanedQty: 0, rate: 280 },
    ],
  },
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

// Cleaning charges: ₹12 per 500 g and ₹25 per 1 kg.
function cleaningCharge(quantityKg) {
  const fullKg = Math.floor(quantityKg + 0.00001);
  const remainder = quantityKg - fullKg;
  return fullKg * 25 + (remainder >= 0.49 ? 12 : 0);
}

function getOrderAmounts(order) {
  const items = Array.isArray(order.items) ? order.items : [];

  const itemAmount = items.reduce(
    (sum, item) =>
      sum + Number(item.qty || 0) * Number(item.rate || 0),
    0
  );

  const cleaningAmount = items.reduce(
    (sum, item) =>
      sum + cleaningCharge(Number(item.cleanedQty || 0)),
    0
  );

  const orderType = String(order.orderType || "").trim().toLowerCase();
  const deliveryArea = String(order.deliveryArea || "").trim().toLowerCase();
  const normalizedAddress = String(order.address || "").trim().toLowerCase();
  const isStorePickup =
    orderType.includes("pickup") ||
    deliveryArea === "store pickup" ||
    normalizedAddress === "store pickup";

  const matchedArea = deliveryAreas.find((area) =>
    deliveryArea === area.name.toLowerCase() ||
    normalizedAddress.includes(area.name.toLowerCase())
  );

  const deliveryCharge = isStorePickup
    ? 0
    : matchedArea
      ? matchedArea.charge
      : Number(order.deliveryCharge || 0);

  return {
    itemAmount,
    cleaningAmount,
    deliveryCharge,
    total: itemAmount + cleaningAmount + deliveryCharge,
  };
}

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function Dashboard() {
  const [products, setProducts] = useState(() =>
    readStored("pk-products", initialProducts)
  );

  const [orders, setOrders] = useState(() =>
    readStored("pk-orders", initialOrders)
  );

  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // NEW: Selected delivery area
  const [selectedArea, setSelectedArea] = useState("all");

  // Save products
  useEffect(() => {
    localStorage.setItem("pk-products", JSON.stringify(products));
  }, [products]);

  // Save orders
  useEffect(() => {
    localStorage.setItem("pk-orders", JSON.stringify(orders));
  }, [orders]);

  // NEW: Filter orders by delivery area

  const areaOrders = useMemo(() => {
    if (selectedArea === "all") return orders;

    if (selectedArea === "store-pickup") {
      return orders.filter((order) => {
        const orderType = String(order.orderType || "").trim().toLowerCase();
        const deliveryArea = String(order.deliveryArea || "").trim().toLowerCase();
        const address = String(order.address || "").trim().toLowerCase();

        return (
          orderType.includes("pickup") ||
          deliveryArea === "store pickup" ||
          address === "store pickup"
        );
      });
    }

    const normalizedArea = selectedArea.trim().toLowerCase();

    return orders.filter((order) => {
      const address = String(order.address || "").trim().toLowerCase();
      const deliveryArea = String(order.deliveryArea || "").trim().toLowerCase();
      return address.includes(normalizedArea) || deliveryArea === normalizedArea;
    });
  }, [orders, selectedArea]);

  // Dashboard totals (all orders)
  const totals = useMemo(() => {
    const amount = orders.reduce(
      (sum, order) => sum + getOrderAmounts(order).total,
      0
    );

    return {
      orders: orders.length,
      amount,
      packed: orders.filter((o) => o.status === "packed").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      payment: orders.filter((o) => o.status === "payment").length,
    };
  }, [orders]);

  // Item-wise cleaning report
  const itemWiseReport = useMemo(() => {
    return products.map((product) => {
      const lines = orders.flatMap((order) =>
        order.items.filter(
          (item) => item.productId === product.id
        )
      );

      const totalQty = lines.reduce(
        (sum, item) => sum + Number(item.qty || 0),
        0
      );

      const withCleaning = lines.reduce(
        (sum, item) => sum + Number(item.cleanedQty || 0),
        0
      );

      const withoutCleaning = totalQty - withCleaning;

      return {
        ...product,
        totalQty,
        withCleaning,
        withoutCleaning,
      };
    });
  }, [products, orders]);

  // Update order status
  const updateOrderStatus = (orderId, status) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, status }
          : order
      )
    );
  };

  // Update inventory stock
  const updateStock = (productId, value) => {
    const nextStock = Math.max(0, Number(value) || 0);

    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? { ...product, stock: nextStock }
          : product
      )
    );
  };

  // Search and status filtering
  const filteredOrders = useMemo(() => {
    return areaOrders.filter((order) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        order.customer?.toLowerCase().includes(query) ||
        String(order.phone).includes(query) ||
        String(order.id).includes(query);

      const matchesFilter =
        filter === "all" || order.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [areaOrders, search, filter]);

  const navItems = [
    ["Dashboard", "▦"],
    ["Inventory", "▤"],
    ["All Orders", "🛍"],
    ["Packed Orders", "📦"],
    ["Delivered Orders", "🚚"],
    ["Payments", "₹"],
  ];

  // NEW: All pages respect selected area, search and status
  const pageOrders = useMemo(() => {
    if (activePage === "Packed Orders") {
      return filteredOrders.filter(
        (order) => order.status === "packed"
      );
    }

    if (activePage === "Delivered Orders") {
      return filteredOrders.filter(
        (order) => order.status === "delivered"
      );
    }

    if (activePage === "Payments") {
      return filteredOrders.filter(
        (order) => order.status === "payment"
      );
    }

    return filteredOrders;
  }, [activePage, filteredOrders]);

  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/");
  };

  // NEW: Handle area selection
  const handleAreaChange = (event) => {
    const selectedValue = event.target.value;

    setSelectedArea(selectedValue);
    setActivePage("All Orders");
    setSearch("");
    setFilter("all");
    setSidebarOpen(false);
  };

  return (
    <div className="admin-app">

      {/* SIDEBAR */}
      <aside
        className={`sidebar ${sidebarOpen ? "sidebar-open" : ""
          }`}
      >
        <div className="brand">
          <div className="brand-mark">PK</div>

          <div>
            <strong>Parth Krishna</strong>
            <span>SEA FOODS</span>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="side-label">MAIN MENU</div>

        <nav className="sidebar-nav">
          {navItems.map(([label, icon]) => (
            <button
              key={label}
              className={`nav-link ${activePage === label ? "active" : ""
                }`}
              onClick={() => {
                setActivePage(label);
                setSidebarOpen(false);
                setSearch("");
                setFilter("all");
              }}
            >
              <span className="nav-icon">{icon}</span>

              {label}

              {label === "All Orders" && (
                <span className="nav-count">
                  {areaOrders.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* DELIVERY AREA DROPDOWN */}

        <div className="sidebar-delivery">

          <div className="side-label">
            DELIVERY MANAGEMENT
          </div>

          <label htmlFor="sidebar-delivery-area">
            Select Delivery Area
          </label>

          <div className="delivery-select-wrapper">
            <span className="delivery-location-icon" aria-hidden="true">
              📍
            </span>

            <select
              id="sidebar-delivery-area"
              value={selectedArea}
              onChange={handleAreaChange}
            >
              <option value="all">All Orders</option>
              <option value="store-pickup">Store Pickup</option>

              {deliveryAreas.map((area) => (
                <option key={area.name} value={area.name}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div className="delivery-area-count">
            <span className="delivery-count-dot" />

            {selectedArea === "all"
              ? orders.length
              : areaOrders.length} Orders Found
          </div>

          {selectedArea !== "all" && selectedArea !== "store-pickup" && (
            <div className="selected-delivery-charge">
              Delivery Charge: ₹
              {deliveryAreas.find((area) => area.name === selectedArea)?.charge ?? 0}
            </div>
          )}

          {selectedArea === "store-pickup" && (
            <div className="selected-delivery-charge">
              Store Pickup · No Delivery Charge
            </div>
          )}

          {selectedArea !== "all" && (
            <button
              className="clear-area-filter"
              onClick={() => {
                setSelectedArea("all");
                setActivePage("All Orders");
                setSearch("");
                setFilter("all");
              }}
            >
              ✕ Clear Area Filter
            </button>
          )}

        </div>

      </aside>

      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN AREA */}
      <main className="main-area">

        {/* HEADER */}
        <header className="topbar">
          <div className="topbar-left">

            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <button
              className="home-button"
              onClick={goToHome}
            >
              <svg height="511pt" viewBox="0 1 511 511.999" width="511pt" xmlns="http://www.w3.org/2000/svg" id="fi_1946488"><path d="m498.699219 222.695312c-.015625-.011718-.027344-.027343-.039063-.039062l-208.855468-208.847656c-8.902344-8.90625-20.738282-13.808594-33.328126-13.808594-12.589843 0-24.425781 4.902344-33.332031 13.808594l-208.746093 208.742187c-.070313.070313-.144532.144531-.210938.214844-18.28125 18.386719-18.25 48.21875.089844 66.558594 8.378906 8.382812 19.441406 13.234375 31.273437 13.746093.484375.046876.96875.070313 1.457031.070313h8.320313v153.695313c0 30.417968 24.75 55.164062 55.167969 55.164062h81.710937c8.285157 0 15-6.71875 15-15v-120.5c0-13.878906 11.292969-25.167969 25.171875-25.167969h48.195313c13.878906 0 25.167969 11.289063 25.167969 25.167969v120.5c0 8.28125 6.714843 15 15 15h81.710937c30.421875 0 55.167969-24.746094 55.167969-55.164062v-153.695313h7.71875c12.585937 0 24.421875-4.902344 33.332031-13.8125 18.359375-18.367187 18.367187-48.253906.027344-66.632813zm-21.242188 45.421876c-3.238281 3.238281-7.542969 5.023437-12.117187 5.023437h-22.71875c-8.285156 0-15 6.714844-15 15v168.695313c0 13.875-11.289063 25.164062-25.167969 25.164062h-66.710937v-105.5c0-30.417969-24.746094-55.167969-55.167969-55.167969h-48.195313c-30.421875 0-55.171875 24.75-55.171875 55.167969v105.5h-66.710937c-13.875 0-25.167969-11.289062-25.167969-25.164062v-168.695313c0-8.285156-6.714844-15-15-15h-22.328125c-.234375-.015625-.464844-.027344-.703125-.03125-4.46875-.078125-8.660156-1.851563-11.800781-4.996094-6.679688-6.679687-6.679688-17.550781 0-24.234375.003906 0 .003906-.003906.007812-.007812l.011719-.011719 208.847656-208.839844c3.234375-3.238281 7.535157-5.019531 12.113281-5.019531 4.574219 0 8.875 1.78125 12.113282 5.019531l208.800781 208.796875c.03125.03125.066406.0625.097656.09375 6.644531 6.691406 6.632813 17.539063-.03125 24.207032zm0 0"></path></svg>
            </button>

            <div>
              <h1>{activePage}</h1>
            </div>
          </div>

          <div className="profile">
            <div className="notification">
              ♧<i />
            </div>

            <div className="avatar">A</div>

            <div className="profile-copy">
              <strong>Admin</strong>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="page-content">

          {activePage === "Inventory" ? (
            <InventorySection
              products={products}
              report={itemWiseReport}
              updateStock={updateStock}
            />
          ) : (
            <>
              {/* DASHBOARD OVERVIEW */}
              {activePage === "Dashboard" && (
                <>
                  <section className="welcome-row">
                    <div>
                      <p className="eyebrow">OVERVIEW</p>

                      <h2>Good day, Admin 👋</h2>

                      <p className="muted">
                        Here is what's happening with your
                        seafood business today.
                      </p>
                    </div>

                    <div className="today-chip">
                      📅{" "}
                      {new Date().toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </section>

                  <section className="stats-grid">
                    <StatCard
                      label="Total Orders"
                      value={totals.orders}
                      icon="🛍"
                      tone="blue"
                      note="All customer orders"
                    />

                    <StatCard
                      label="Total Order Amount"
                      value={money(totals.amount)}
                      icon="₹"
                      tone="green"
                      note="Including cleaning & delivery"
                    />

                    <StatCard
                      label="Packed Orders"
                      value={totals.packed}
                      icon="📦"
                      tone="yellow"
                      note="Ready for delivery"
                    />

                    <StatCard
                      label="Delivered Orders"
                      value={totals.delivered}
                      icon="🚚"
                      tone="red"
                      note="Delivered to customers"
                    />
                  </section>

                  <InventorySection
                    products={products}
                    report={itemWiseReport}
                    updateStock={updateStock}
                    compact
                  />

                  <ItemWiseCleaningReport
                    report={itemWiseReport}
                  />
                </>
              )}

              {/* CUSTOMER ORDERS */}
              <section className="orders-section">

                <div className="section-heading">
                  <div>
                    <p className="eyebrow">
                      CUSTOMER MANAGEMENT
                    </p>

                    <h2>
                      {activePage === "Dashboard"
                        ? "Customer Orders"
                        : activePage}
                    </h2>

                    {selectedArea !== "all" && (
                      <p className="selected-area-label">
                        {selectedArea === "store-pickup" ? "🏪 Order Type: " : "📍 Delivery Place: "}
                        <strong>
                          {selectedArea === "store-pickup" ? "Store Pickup" : selectedArea}
                        </strong>
                      </p>
                    )}

                    <p className="muted">
                      View customer details, item quantities
                      and update order progress.
                    </p>
                  </div>

                  <span className="order-total">
                    {pageOrders.length} Orders
                  </span>
                </div>

                {/* SEARCH AND STATUS FILTER */}
                <div className="order-toolbar">

                  <div className="search-box">
                    <span>⌕</span>

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Search customer, phone or order number"
                    />
                  </div>

                  <select
                    value={filter}
                    onChange={(e) =>
                      setFilter(e.target.value)
                    }
                  >
                    <option value="all">All statuses</option>
                    <option value="new">New</option>
                    <option value="packed">Packed</option>
                    <option value="delivered">Delivered</option>
                    <option value="payment">
                      Payment received
                    </option>
                  </select>
                </div>

                {/* ORDER CARDS */}
                <div className="orders-grid">

                  {pageOrders.map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      displayNumber={index + 1}
                      onStatusChange={updateOrderStatus}
                    />
                  ))}

                  {pageOrders.length === 0 && (
                    <div className="empty-state">
                      {selectedArea === "store-pickup"
                        ? "No Store Pickup orders found."
                        : "No orders found for this delivery area. Try another area or clear the filter."}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// STAT CARD
function StatCard({ label, value, icon, tone, note }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>

      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

// INVENTORY SECTION
function InventorySection({
  products,
  report,
  updateStock,
  compact = false,
}) {
  return (
    <section
      className={`inventory-section ${compact ? "compact-section" : ""
        }`}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">STOCK MANAGEMENT</p>

          <h2>Available Seafood Items</h2>

          <p className="muted">
            Remaining stock is calculated from total stock
            minus ordered quantity.
          </p>
        </div>

        <span className="order-total">
          {products.length} Products
        </span>
      </div>

      <div className="inventory-grid">
        {report.map((product) => {
          const remaining = Math.max(
            0,
            product.stock - product.totalQty
          );

          const soldOut = remaining <= 0;

          return (
            <article
              className={`inventory-card ${soldOut ? "out-of-stock" : ""
                }`}
              key={product.id}
            >
              <div className="inventory-image">
                {product.image}
              </div>

              <div className="inventory-info">
                <div className="inventory-title">
                  <h3>{product.name}</h3>

                  <span
                    className={`stock-pill ${soldOut ? "out" : ""
                      }`}
                  >
                    {soldOut
                      ? "Out of stock"
                      : "Available"}
                  </span>
                </div>

                <strong>
                  {money(product.price)}{" "}
                  <small>/ kg</small>
                </strong>

                <div className="stock-numbers">
                  <span>
                    Stock <b>{product.stock} kg</b>
                  </span>

                  <span>
                    Ordered <b>{product.totalQty} kg</b>
                  </span>

                  <span>
                    Balance{" "}
                    <b
                      className={
                        soldOut ? "danger-text" : "green-text"
                      }
                    >
                      {remaining} kg
                    </b>
                  </span>
                </div>

                <label className="stock-edit">
                  Total stock (kg)

                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={product.stock}
                    onChange={(e) =>
                      updateStock(product.id, e.target.value)
                    }
                  />
                </label>

                <button
                  className="stock-order-button"
                  disabled={soldOut}
                >
                  {soldOut
                    ? "Ordering Disabled"
                    : "Available for Orders"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ITEM-WISE CLEANING REPORT
function ItemWiseCleaningReport({ report }) {
  const orderedProducts = report.filter(
    (p) => p.totalQty > 0
  );

  return (
    <section className="cleaning-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            PREPARATION SUMMARY
          </p>

          <h2>Item-wise Cleaning Report</h2>

          <p className="muted">
            Combined quantity from all customer orders,
            grouped by seafood item.
          </p>
        </div>
      </div>

      <div className="cleaning-grid">
        {orderedProducts.map((product) => {
          const cleanPercent = product.totalQty
            ? (product.withCleaning / product.totalQty) * 100
            : 0;

          return (
            <article
              className="cleaning-card"
              key={product.id}
            >
              <div className="cleaning-card-head">
                <h3>{product.name}</h3>
                <b>{product.totalQty} kg total</b>
              </div>

              <div className="cleaning-values">
                <div className="clean-value clean">
                  <span>With Cleaning</span>

                  <strong>
                    {product.withCleaning
                      .toFixed(1)
                      .replace(".0", "")}{" "}
                    kg
                  </strong>
                </div>

                <div className="clean-value unclean">
                  <span>Without Cleaning</span>

                  <strong>
                    {product.withoutCleaning
                      .toFixed(1)
                      .replace(".0", "")}{" "}
                    kg
                  </strong>
                </div>
              </div>

              <div className="progress-track">
                <span
                  style={{ width: `${cleanPercent}%` }}
                />
              </div>

              <div className="progress-labels">
                <span>
                  {cleanPercent.toFixed(0)}% cleaning
                </span>

                <span>
                  {(100 - cleanPercent).toFixed(0)}% without
                </span>
              </div>
            </article>
          );
        })}

        {orderedProducts.length === 0 && (
          <div className="empty-state">
            No ordered items yet.
          </div>
        )}
      </div>
    </section>
  );
}

// ORDER CARD
function OrderCard({ order, displayNumber, onStatusChange }) {
  const amounts = getOrderAmounts(order);

  const statusLabels = {
    new: "New Order",
    packed: "Packed",
    delivered: "Delivered",
    payment: "Payment Received",
  };

  return (
    <article
      className={`order-card status-${order.status}`}
    >
      <div className="order-card-head">
        <div>
          <span className="order-number">
            ORDER #{displayNumber}
          </span>

          <small>{order.date}</small>
        </div>

        <span
          className={`status-badge ${order.status}`}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="customer-block">
        <div className="customer-avatar">
          {String(order.customer || "C").charAt(0).toUpperCase()}
        </div>

        <div className="customer-details">
          <h3>{order.customer || "Customer"}</h3>

          <a href={`tel:${order.phone}`}>
            ☎ {order.phone}
          </a>

          <p>
            {String(order.orderType || "").toLowerCase().includes("pickup") ||
              String(order.deliveryArea || "").toLowerCase() === "store pickup"
              ? "🏪 Store Pickup"
              : `⌖ ${order.address || order.deliveryArea || "Address not provided"}`}
          </p>
        </div>
      </div>

      <div className="order-items">
        <div className="item-table-head">
          <span>Item</span>
          <span>Qty</span>
          <span>Rate</span>
          <span>Amount</span>
        </div>

        {order.items.map((item, index) => (
          <div
            className="order-item-row"
            key={`${item.productId}-${index}`}
          >
            <div>
              <b>{item.name}</b>

              <small>
                Clean {item.cleanedQty} kg · No clean{" "}
                {(item.qty - item.cleanedQty)
                  .toFixed(1)
                  .replace(".0", "")}{" "}
                kg
              </small>
            </div>

            <span>{item.qty} kg</span>

            <span>{money(item.rate)}</span>

            <b>{money(item.qty * item.rate)}</b>
          </div>
        ))}
      </div>

      <div className="bill-summary">
        <div>
          <span>Item amount</span>
          <b>{money(amounts.itemAmount)}</b>
        </div>

        <div>
          <span>Cleaning charges</span>
          <b>{money(amounts.cleaningAmount)}</b>
        </div>

        <div>
          <span>{amounts.deliveryCharge === 0 ? "Pickup / Delivery charges" : "Delivery charges"}</span>
          <b>{money(amounts.deliveryCharge)}</b>
        </div>

        <div className="grand-total">
          <strong>Grand Total</strong>
          <strong>{money(amounts.total)}</strong>
        </div>
      </div>

      <div className="order-actions">
        <button
          className={`action-button packed ${order.status === "packed" ? "selected" : ""
            }`}
          onClick={() =>
            onStatusChange(order.id, "packed")
          }
        >
          📦 Packed
        </button>

        <button
          className={`action-button delivered ${order.status === "delivered" ? "selected" : ""
            }`}
          onClick={() =>
            onStatusChange(order.id, "delivered")
          }
        >
          🚚 Delivered
        </button>

        <button
          className={`action-button payment ${order.status === "payment" ? "selected" : ""
            }`}
          onClick={() =>
            onStatusChange(order.id, "payment")
          }
        >
          ₹ Payment
        </button>
      </div>
    </article>
  );
}
