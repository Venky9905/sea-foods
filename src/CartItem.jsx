import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import {
  FiHeart,
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiArrowRight,
} from "react-icons/fi";
import { useShop } from "./useShop";

// ---------------- CATEGORY DATA ----------------
const categoryData = [
  {
    name: "All Sea Items",
    image: "../images/all-items.png",
    slug: "all",
    subtitle:
      "Explore our complete collection of fresh and dried seafood.",
  },
  {
    name: "Sea Fish",
    image: "../images/filter1.png",
    slug: "sea-fish",
    subtitle:
      "Freshly caught sea fish, carefully selected for your table.",
  },
  {
    name: "Prawns",
    image: "../images/filter2.png",
    slug: "prawns",
    subtitle:
      "Fresh, juicy prawns perfect for delicious seafood meals.",
  },
  {
    name: "Crabs",
    image: "../images/filter3.png",
    slug: "crabs",
    subtitle:
      "Fresh sea crabs packed with authentic coastal flavour.",
  },
  {
    name: "Squid",
    image: "../images/filter4.png",
    slug: "squid",
    subtitle:
      "Tender squid, perfect for your favourite seafood recipes.",
  },
  {
    name: "Dry Fish",
    image: "../images/filter5.png",
    slug: "dry-fish",
    subtitle:
      "Traditional dried fish with rich coastal flavour.",
  },
  {
    name: "Dry Prawns",
    image: "../images/filter6.png",
    slug: "dry-prawns",
    subtitle:
      "Flavourful dried prawns for authentic home cooking.",
  },
];

// ---------------- PRODUCT DATA ----------------
const products = [
  {
    id: 1,
    name: "Sankara",
    category: "sea-fish",
    subtitle: "Fresh & Cleaned",
    price: 280,
    rating: 4.8,
    reviews: 120,
    badge: "Best Seller",
    badgeColor: "orange",
    image: "../images/cart-fish1.jpg",
    cleaningAvailable: true,
  },
  {
    id: 2,
    name: "Ayala (Small Eye)",
    category: "sea-fish",
    subtitle: "Fresh & Juicy",
    price: 260,
    rating: 4.7,
    reviews: 98,
    badge: "Fresh Catch",
    badgeColor: "green",
    image: "../images/cart-fish2.jpg",
    cleaningAvailable: true,
  },
  {
    id: 3,
    name: "Nethili",
    category: "sea-fish",
    subtitle: "Fresh & Tender",
    price: 300,
    oldPrice: 380,
    rating: 4.6,
    reviews: 75,
    badge: "Fresh Catch",
    badgeColor: "green",
    image: "../images/cart-fish3.jpg",
    cleaningAvailable: false,
  },
  {
    id: 4,
    name: "Para Fish",
    category: "sea-fish",
    subtitle: "Fresh Sea Fish",
    price: 280,
    rating: 4.5,
    reviews: 64,
    badge: "Popular",
    badgeColor: "green",
    image: "../images/cart-fish4.jpg",
    cleaningAvailable: true,
  },
  {
    id: 5,
    name: "Nam Para",
    category: "sea-fish",
    subtitle: "Fresh Sea Fish",
    price: 180,
    rating: 4.9,
    reviews: 105,
    badge: "Best Seller",
    badgeColor: "orange",
    image: "../images/cart-fish5.jpg",
    cleaningAvailable: true,
  },
  {
    id: 6,
    name: "Squid (Kanawa)",
    category: "squid",
    subtitle: "Fresh & Tender",
    price: 300,
    rating: 4.7,
    reviews: 52,
    badge: "Fresh Catch",
    badgeColor: "green",
    image: "../images/cart-fish6.jpg",
    cleaningAvailable: false,
  },
  {
    id: 7,
    name: "Sea Prawns",
    category: "prawns",
    subtitle: "Fresh Catch",
    price: 360,
    rating: 4.8,
    reviews: 42,
    badge: "Popular",
    badgeColor: "green",
    image: "../images/cart-fish7.jpg",
    cleaningAvailable: true,
  },
  {
    id: 8,
    name: "Crabs",
    category: "crabs",
    subtitle: "Fresh Sea Crabs",
    price: 280,
    rating: 4.8,
    reviews: 87,
    badge: "Best Seller",
    badgeColor: "orange",
    image: "../images/cart-fish8.jpg",
    cleaningAvailable: true,
  },
  {
    id: 9,
    name: "Vanjaram",
    category: "sea-fish",
    subtitle: "Daily Fresh Catch",
    price: 250,
    rating: 4.6,
    reviews: 48,
    badge: "Value Pack",
    badgeColor: "green",
    image: "../images/cart-fish9.jpg",
    cleaningAvailable: true,
  },
  {
    id: 10,
    name: "Black Pomfret",
    category: "sea-fish",
    subtitle: "Premium Seafood",
    price: 700,
    rating: 4.9,
    reviews: 31,
    badge: "Premium",
    badgeColor: "orange",
    image: "../images/cart-fish10.jpg",
    cleaningAvailable: true,
  },
  {
    id: 11,
    name: "Tiger Prawns",
    category: "prawns",
    subtitle: "Fresh & Cleaned",
    price: 400,
    rating: 4.6,
    reviews: 44,
    badge: "Fresh Catch",
    badgeColor: "green",
    image: "../images/cart-fish11.jpg",
    cleaningAvailable: true,
  },
  {
    id: 12,
    name: "Adhava",
    category: "sea-fish",
    subtitle: "Soft & Tender",
    price: 350,
    rating: 4.5,
    reviews: 46,
    badge: "Premium",
    badgeColor: "green",
    image: "../images/cart-fish12.jpg",
    cleaningAvailable: true,
  },
];

export default function CartItem({ onOpenBasket }) {
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [quantities, setQuantities] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // Use the shared cart instead of creating a second cart.
  const { cart, addToCart } = useShop();

  const activeCategory = categoryData.find(
    (category) => category.slug === selectedCategory
  );

  // ---------------- CATEGORY FILTER ----------------
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
        (product) =>
          product.category === selectedCategory
      );

  const visibleProducts = showAll
    ? filteredProducts
    : filteredProducts.slice(0, 9);

  // ---------------- QUANTITY ----------------
  const updateQuantity = (id, change) => {
    setQuantities((previous) => ({
      ...previous,
      [id]: Math.max(
        0.5,
        Math.round(
          ((previous[id] ?? 1) + change) * 10
        ) / 10
      ),
    }));
  };

  // ---------------- FAVORITES ----------------
  const toggleFavorite = (id) => {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  // ---------------- CATEGORY SELECTION ----------------
  const handleCategoryClick = (slug) => {
    setSelectedCategory(slug);
    setShowAll(false);
  };

  // ---------------- CART TOTALS ----------------
  const cartItems = cart ?? [];

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );


  useEffect(() => {
    const selectCategoryFromUrl = () => {
      const hash = window.location.hash;

      if (!hash.startsWith("#categories/")) {
        return;
      }

      const category = hash.substring(
        "#categories/".length
      );

      const validCategories = [
        "sea-fish",
        "prawns",
        "crabs",
        "squid",
        "dry-fish",
        "dry-prawns",
      ];

      if (validCategories.includes(category)) {
        setSelectedCategory(category);
        setShowAll(false);
      }
    };

    selectCategoryFromUrl();

    window.addEventListener(
      "hashchange",
      selectCategoryFromUrl
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        selectCategoryFromUrl
      );
    };
  }, []);

  return (
    <>
      {/* ================= CATEGORIES ================= */}
      <section
        className="shop-category-section"
        id="categories"
      >
        <Container>
          <h2 className="shop-category-title">
            Shop by Category
          </h2>

          <div className="shop-category-list">
            {categoryData.map((category) => (
              <button
                type="button"
                key={category.slug}
                className={`shop-category-item ${selectedCategory === category.slug
                  ? "active"
                  : ""
                  }`}
                onClick={() =>
                  handleCategoryClick(category.slug)
                }
                aria-pressed={
                  selectedCategory === category.slug
                }
              >
                <div className="shop-category-image">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                  />

                  <span className="shop-category-name">
                    {category.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="seafood-section" id="catalog">
        <Container>
          <div className="seafood-heading">
            <div>
              <span className="seafood-eyebrow">
                {selectedCategory === "all"
                  ? "FRESH FROM THE OCEAN"
                  : `SHOP ${activeCategory.name.toUpperCase()}`}
              </span>

              <h2>
                {selectedCategory === "all"
                  ? "Our Fresh Seafood"
                  : activeCategory.name}
              </h2>

              <p>{activeCategory.subtitle}</p>

              <span className="seafood-product-count">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "product"
                  : "products"}{" "}
                available
              </span>
            </div>

            {filteredProducts.length > 9 && (
              <button
                type="button"
                className="see-all-btn"
                onClick={() =>
                  setShowAll((previous) => !previous)
                }
              >
                {showAll ? "Show Less" : "See All"}
                <FiArrowRight />
              </button>
            )}
          </div>

          {visibleProducts.length > 0 ? (
            <div className="seafood-grid">
              {visibleProducts.map((product) => {
                const quantity =
                  quantities[product.id] ?? 1;

                const isFavorite = favorites.includes(
                  product.id
                );

                const isAdded = cartItems.some(
                  (item) => item.id === product.id
                );

                return (
                  <article
                    className="seafood-card"
                    key={product.id}
                  >
                    <div className="seafood-image-wrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="seafood-image"
                        loading="lazy"
                      />

                      <span
                        className={`product-badge ${product.badgeColor}`}
                      >
                        {product.badge}
                      </span>

                      <button
                        type="button"
                        className={`favorite-btn ${isFavorite ? "favorited" : ""
                          }`}
                        onClick={() =>
                          toggleFavorite(product.id)
                        }
                        aria-label={`Toggle ${product.name} favorite`}
                        aria-pressed={isFavorite}
                      >
                        <FiHeart />
                      </button>
                    </div>

                    <div className="seafood-card-body">
                      <h3>{product.name}</h3>

                      <p className="seafood-subtitle">
                        {product.subtitle}
                      </p>

                      <div className="seafood-price">
                        <strong>
                          ₹{product.price}
                        </strong>
                        <span>/ kg</span>

                        {product.oldPrice && (
                          <>
                            <del>
                              ₹{product.oldPrice}
                            </del>

                            <span className="discount-label">
                              {Math.round(
                                ((product.oldPrice -
                                  product.price) /
                                  product.oldPrice) *
                                100
                              )}
                              % OFF
                            </span>
                          </>
                        )}
                      </div>

                      <div className="seafood-rating">
                        <span>★</span>
                        <strong>{product.rating}</strong>
                        <small>({product.reviews})</small>
                      </div>

                      <div className="seafood-card-actions">
                        <div className="quantity-control">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                -0.5
                              )
                            }
                            disabled={quantity <= 0.5}
                            aria-label="Decrease quantity"
                          >
                            <FiMinus />
                          </button>

                          <span>{quantity} kg</span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                0.5
                              )
                            }
                            aria-label="Increase quantity"
                          >
                            <FiPlus />
                          </button>
                        </div>

                        <button
                          type="button"
                          className={`add-cart-btn ${isAdded ? "added" : ""
                            }`}
                          onClick={() => {
                            addToCart(product, quantity);

                            window.dispatchEvent(
                              new Event("open-seafood-basket")
                            );
                          }}
                        >
                          <FiShoppingCart />
                          <span>
                            {isAdded ? "Add More" : "Add to Cart"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="seafood-empty">
              <h3>No products available</h3>

              <p>
                We are adding more{" "}
                {activeCategory.name.toLowerCase()} products
                soon. Please explore our other seafood categories.
              </p>

              <button
                type="button"
                className="see-all-btn"
                onClick={() => handleCategoryClick("all")}
              >
                View All Seafood <FiArrowRight />
              </button>
            </div>
          )}

          {/* Shared basket summary */}
          {cartItems.length > 0 && (
            <div className="seafood-cart-summary">
              <div>
                <strong>
                  {totalQuantity.toLocaleString("en-IN")} kg
                  in your cart
                </strong>

                <p>
                  Subtotal: ₹
                  {subtotal.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </p>

                <small>
                  {cartItems.length} different products
                </small>
              </div>

              <button
                type="button"
                onClick={onOpenBasket}
              >
                View Cart <FiArrowRight />
              </button>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}