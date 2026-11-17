import { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import {
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
const seafoodData = [
  {
    name: "Sankara",
    title: "Fresh Sankara Fish",
    subtitle: "FRESH FROM THE OCEAN",
    description:
      "Enjoy fresh Sankara fish, carefully selected for quality and flavour, perfect for delicious curries and traditional seafood meals.",
    button: "Shop Sankara Now",
    color: "#075A3B",
    background: "#F2F0DC",
    image: "../images/fish1.png",
  },
  {
    name: "Paralu",
    title: "Fresh Paralu Fish",
    subtitle: "TASTE THE FRESHNESS",
    description:
      "Discover fresh Paralu fish, ideal for crispy fish fry, spicy curries and authentic coastal-style dishes.",
    button: "Shop Paralu Now",
    color: "#BD481B",
    background: "#FFF0DF",
    image: "../images/fish2.png",
  },
  {
    name: "Nethili",
    title: "Fresh Nethili Fish",
    subtitle: "SMALL FISH, BIG FLAVOUR",
    description:
      "Bring home fresh Nethili fish, perfect for crispy fries, spicy masala and traditional seafood recipes.",
    button: "Shop Nethili Now",
    color: "#BB321E",
    background: "#FFECE3",
    image: "../images/fish3.png",
  },
  {
    name: "Squid",
    title: "Fresh Squid",
    subtitle: "DISCOVER OCEAN DELIGHTS",
    description:
      "Enjoy fresh squid with a tender texture, ideal for spicy squid fry, stir-fries and delicious seafood dishes.",
    button: "Shop Squid Now",
    color: "#51408B",
    background: "#EAF3F4",
    image: "../images/fish4.png",
  },
  {
    name: "Tiger Prawns",
    title: "Fresh Tiger Prawns",
    subtitle: "JUICY, TENDER & DELICIOUS",
    description:
      "Discover premium tiger prawns, carefully selected for freshness and perfect for prawn curry, fry and grills.",
    button: "Shop Tiger Prawns",
    color: "#BD481B",
    background: "#FFF0DF",
    image: "../images/fish5.png",
  },
  {
    name: "Pandugappa",
    title: "Fresh Pandugappa Fish",
    subtitle: "A COASTAL FAVOURITE",
    description:
      "Enjoy fresh Pandugappa fish, a popular choice for flavourful curries, pan-fried dishes and traditional coastal meals.",
    button: "Shop Pandugappa",
    color: "#075A3B",
    background: "#F2F0DC",
    image: "../images/fish7.png",
  },
  {
    name: "White Pomfret",
    title: "Fresh White Pomfret",
    subtitle: "DELICATE & DELICIOUS",
    description:
      "Choose fresh White Pomfret for its delicate flavour, perfect for shallow frying, grilling and special seafood meals.",
    button: "Shop White Pomfret",
    color: "#51408B",
    background: "#EAF3F4",
    image: "../images/fish6.png",
  },
  {
    name: "Sea Crabs",
    title: "Fresh Sea Crabs",
    subtitle: "A TRUE SEAFOOD DELICACY",
    description:
      "Explore fresh sea crabs, ideal for spicy crab masala, traditional crab curry and authentic coastal recipes.",
    button: "Shop Sea Crabs",
    color: "#BB321E",
    background: "#FFECE3",
    image: "../images/fish8.png",
  },
  {
    name: "Vanjaram",
    title: "Fresh Vanjaram Fish",
    subtitle: "PREMIUM SEA FISH",
    description:
      "Bring home fresh Vanjaram fish, loved for its firm texture and perfect for fish fry, grills and flavourful curries.",
    button: "Shop Vanjaram",
    color: "#075A3B",
    background: "#F2F0DC",
    image: "../images/fish9.png",
  },
  {
    name: "Black Pomfret",
    title: "Fresh Black Pomfret",
    subtitle: "RICH TASTE, FRESH QUALITY",
    description:
      "Discover fresh Black Pomfret, a delicious seafood choice for spicy curries, pan-fried recipes and family meals.",
    button: "Shop Black Pomfret",
    color: "#51408B",
    background: "#EAF3F4",
    image: "../images/fish10.png",
  },
];

export default function Banner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = seafoodData[activeIndex];

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % seafoodData.length);
  };

  const prevSlide = () => {
    setActiveIndex(
      (prev) => (prev - 1 + seafoodData.length) % seafoodData.length
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % seafoodData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="seafood-banner"
      style={{
        "--banner-color": active.color,
        "--banner-bg": active.background,
      }}
    >
      <Container fluid className="banner-container">
        <div className="align-items-center banner-main-row">
          {/* LEFT CONTENT */}
          <div className="seabanner-left">
            <div className="banner-content" key={`text-${activeIndex}`}>
              <div className="banner-subtitle">
                <span />
                {active.subtitle}
              </div>

              <h1 className="banner-title">
                {active.title.split(" ").map((word, index, words) => (
                  <span
                    key={`${word}-${index}`}
                    className={
                      index === words.length - 1
                        ? "banner-title-highlight"
                        : ""
                    }
                  >
                    {word}{" "}
                  </span>
                ))}
              </h1>

              <p className="banner-description">
                {active.description}
              </p>
              {/*
              <Button
                className="banner-shop-btn"
                onClick={() => {
                  window.location.href =
                    `/products?category=${encodeURIComponent(active.name)}`;
                }}
              >
                {active.button}
                <FiArrowRightCircle />
              </Button> */}

              <div className="banner-benefits">
                <span>✓ Quality Selection</span>
                <span>✓ Fresh Delivery</span>
              </div>
            </div>
          </div>

          {/* CURVE AND IMAGE MOVE TOGETHER */}
          <div className="seabanner-right">
            <div className="banner-curve-track">
              <div className="banner-curve-shape" />
            </div>
            <div
              className="banner-visual-stage"
              key={`visual-${activeIndex}`}
            >
              {/* White curved ribbon */}


              {/* Main seafood image */}
              <div className="banner-image-circle">
                <img
                  src={active.image}
                  alt={active.title}
                  fetchPriority="high"
                />
              </div>

              {/* Image caption */}
              <div className="banner-image-caption">
                <small>FRESH PICK</small>
                <strong>{active.name}</strong>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* BOTTOM CATEGORY NAVIGATION */}
      <div className="banner-category-navigation">
        <Button
          className="banner-arrow"
          aria-label="Previous seafood"
          onClick={prevSlide}
        >
          <FiArrowLeft />
        </Button>

        <div className="banner-categories">
          {seafoodData.map((item, index) => (
            <button
              type="button"
              key={item.name}
              className={`banner-category ${activeIndex === index ? "active" : ""
                }`}
              onClick={() => setActiveIndex(index)}
              aria-pressed={activeIndex === index}
            >
              <img src={item.image} alt="" loading="lazy" />
              <span>{item.name}</span>

              {activeIndex === index && (
                <span className="banner-category-active">
                  <FiArrowRight />
                </span>
              )}
            </button>
          ))}
        </div>

        <Button
          className="banner-arrow"
          aria-label="Next seafood"
          onClick={nextSlide}
        >
          <FiArrowRight />
        </Button>
      </div>

      {/* SLIDE INDICATORS */}
      <div className="banner-indicators">
        {seafoodData.map((item, index) => (
          <button
            type="button"
            key={item.name}
            aria-label={`Show ${item.name}`}
            className={activeIndex === index ? "active" : ""}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}