// src/App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";

// Components
import TopBar from "./components/topBar";
import Header from "./components/header";
import HomeHero from "./components/homeHero";
import Footer from "./components/footer";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/shop";
import About from "./pages/aboutUs";
import Contact from "./pages/contactus";
import AdminProduct from "./pages/Admin/AdminProduct";
import Cart from "./pages/cart";
import Register from "./pages/register";
import Login from "./pages/login";

const BackgroundSlider = ({ children }) => {
  const backgroundImages = [
    "/hero-background.png",
    "/hero-background-2.png",
    "/hero-background-3.png",
    "/hero-background-4.png",
    "/hero-background-5.png",
  ];

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [imagesLoaded, setImagesLoaded] = React.useState(false);

  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = backgroundImages.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => reject(src);
          img.src = src;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Some images failed to load:", error);
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  useEffect(() => {
    if (!imagesLoaded || backgroundImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [backgroundImages.length, imagesLoaded]);

  if (!imagesLoaded || backgroundImages.length === 1) {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImages[0]}')`,
        }}
      >
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Add smooth-zoom keyframes */}
      <style>
        {`
          @keyframes smooth-zoom {
            0% { transform: scale(1); }
            100% { transform: scale(1.3); }
          }
        `}
      </style>

      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1000ms] ease-in-out ${
            index === currentImageIndex
              ? "opacity-100 z-20 animate-[smooth-zoom_6s_linear_forwards]"
              : "opacity-0 z-10"
          }`}
          style={{
            backgroundImage: `url('${image}')`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-black/20 z-30" />
      <div className="relative z-40">{children}</div>
    </div>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen font-sans text-gray-800">
      {isHome ? (
        <BackgroundSlider>
          <TopBar />
          <Header />
          <HomeHero />
        </BackgroundSlider>
      ) : (
        <Header />
      )}
      <div className="bg-white">{children}</div>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/aboutUs" element={<About />} />
            <Route path="/contactus" element={<Contact />} />
            <Route path="/Admin/AdminProduct" element={<AdminProduct />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
};

export default App;
