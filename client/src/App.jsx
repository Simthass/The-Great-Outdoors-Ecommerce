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
import { ToastContainer } from "react-toastify";

// Components
import ScrollToTop from "./components/ScrollToTop";
import TopBar from "./components/topBar";
import Header from "./components/header";
import HomeHero from "./components/homeHero";
import Footer from "./components/footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import { HelmetProvider } from "react-helmet-async";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/shop";
import About from "./pages/aboutUs";
import Contact from "./pages/contactus";
import OrderManagement from "./pages/Admin/OrderManagement";
import Cart from "./pages/cart";
import Register from "./pages/register";
import Login from "./pages/login";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import Profile from "./pages/userProfile";
import Settings from "./pages/userSettings";
import AdminDashboard from "./pages/AdminDashboard";
import Inventory from "./pages/Admin/Inventory";
import NotFoundPage from "./pages/404";
import UserManagement from "./pages/Admin/User";
import UserReportGenerator from "./pages/Admin/ReportGeneration/userReport";
import EmployeeManagement from "./pages/Admin/Employee";
import ReviewsList from "./pages/Admin/ReviewList";
import ReviewEdit from "./pages/Admin/ReviewEdit";
import AdminProduct from "./pages/Admin/AdminProduct";
import ProductDetails from "./pages/ProductDetails";
import SearchResults from "./pages/SearchResults";
import Checkout from "./pages/checkout";
import Orders from "./pages/orders";
import OrderDetails from "./pages/OrderDetails";
import OthersManagement from "./pages/Admin/AdminOthers";
import Events from "./pages/events";
import EventManagement from "./pages/Admin/EventManagement";
import EventDetail from "./pages/EventDetail";
import ProductReports from "./pages/Admin/ReportGeneration/ProductReports";

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
    <HelmetProvider>
      <Provider store={store}>
        <Router>
          <Layout>
            <ScrollToTop /> {/* 👈 Moved inside Layout */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/aboutUs" element={<About />} />
              <Route path="/contactus" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgotPassword" element={<ForgotPassword />} />
              <Route
                path="/resetPassword/:resettoken"
                element={<ResetPassword />}
              />
              <Route path="/userProfile" element={<Profile />} />
              <Route path="/userSettings" element={<Settings />} />
              <Route
                path="/Admin/OrderManagement"
                element={<OrderManagement />}
              />
              <Route path="/AdminDashboard" element={<AdminDashboard />} />
              <Route path="/Admin/Inventory" element={<Inventory />} />
              <Route path="/Admin/User" element={<UserManagement />} />
              <Route
                path="/Admin/ReportGeneration/userReport"
                element={<UserReportGenerator />}
              />
              <Route path="/Admin/Employee" element={<EmployeeManagement />} />
              <Route path="/Admin/ReviewList" element={<ReviewsList />} />
              <Route path="/Admin/ReviewEdit/:id" element={<ReviewEdit />} />
              <Route path="/Admin/AdminProduct" element={<AdminProduct />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/Admin/AdminOthers" element={<OthersManagement />} />
              <Route
                path="/Admin/EventManagement"
                element={<EventManagement />}
              />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route
                path="/Admin/ReportGeneration/ProductReports"
                element={<ProductReports />}
              />

              <Route path="/events" element={<Events />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </Layout>
        </Router>
      </Provider>
    </HelmetProvider>
  );
};

export default App;
