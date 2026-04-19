import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import { ToastContainer } from "react-toastify";
import { HelmetProvider } from "react-helmet-async";

// Components
import ScrollToTop from "./components/ScrollToTop";
import TopBar from "./components/topBar";
import Header from "./components/header";
import HomeHero from "./components/homeHero";
import Footer from "./components/footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AuthInitializer from "./components/AuthInitializer";

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
import ContentManagement from "./pages/Admin/ContentManagement";
import ReviewReport from "./pages/Admin/ReportGeneration/ReviewReport";
import AdminCoupons from "./pages/Admin/AdminCoupons";

const BackgroundSlider = ({ children }) => {
  const backgroundImages = [
    "/hero-background.png",
    "/hero-background-2.png",
    "/hero-background-3.png",
    "/hero-background-4.png",
    "/hero-background-5.png",
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const preloadImages = async () => {
      const promises = backgroundImages.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // continue even if one fails
          img.src = src;
        });
      });
      await Promise.all(promises);
      setImagesLoaded(true);
    };
    preloadImages();
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % backgroundImages.length);
    }, 7000); // Slower interval for a more cinematic feel
    return () => clearInterval(interval);
  }, [imagesLoaded]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Advanced Liquid Morph CSS */}
      <style>
        {`
          .morph-slide {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            transition: opacity 2.5s cubic-bezier(0.4, 0, 0.2, 1), 
                        transform 7s cubic-bezier(0.25, 1, 0.5, 1), 
                        filter 2.5s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            transform: scale(1.15) rotate(1deg);
            filter: blur(20px) saturate(150%) brightness(1.2);
            z-index: 10;
            will-change: transform, opacity, filter;
          }
          
          .morph-slide.active {
            opacity: 1;
            transform: scale(1) rotate(0deg);
            filter: blur(0px) saturate(100%) brightness(1);
            z-index: 20;
          }

          .morph-slide.previous {
            opacity: 0;
            transform: scale(0.95) rotate(-1deg);
            filter: blur(15px) saturate(50%) brightness(0.8);
            z-index: 15;
          }
        `}
      </style>

      {backgroundImages.map((img, index) => {
        let positionClass = "";
        if (index === activeIndex) positionClass = "active";
        else if (
          index ===
          (activeIndex - 1 + backgroundImages.length) % backgroundImages.length
        )
          positionClass = "previous";

        return (
          <div
            key={img}
            className={`morph-slide ${positionClass}`}
            style={{ backgroundImage: `url('${img}')` }}
          />
        );
      })}

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/80 z-30 pointer-events-none mix-blend-multiply" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/60 z-30 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-40 h-full w-full">{children}</div>
    </div>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen font-sans text-gray-800 selection:bg-[#8DC53E] selection:text-white">
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
        <AuthInitializer />
        <Router>
          <Layout>
            <ScrollToTop />
            <Routes>
              {/* Keep all your existing routes exactly as they were */}
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
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />

              <Route
                path="/userProfile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/AdminDashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/OrderManagement"
                element={
                  <AdminRoute>
                    <OrderManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/Inventory"
                element={
                  <AdminRoute>
                    <Inventory />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/User"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/ReportGeneration/userReport"
                element={
                  <AdminRoute>
                    <UserReportGenerator />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/Employee"
                element={
                  <AdminRoute>
                    <EmployeeManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/ReviewList"
                element={
                  <AdminRoute>
                    <ReviewsList />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/ReviewEdit/:id"
                element={
                  <AdminRoute>
                    <ReviewEdit />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/AdminProduct"
                element={
                  <AdminRoute>
                    <AdminProduct />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/AdminOthers"
                element={
                  <AdminRoute>
                    <OthersManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/EventManagement"
                element={
                  <AdminRoute>
                    <EventManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/ReportGeneration/ProductReports"
                element={
                  <AdminRoute>
                    <ProductReports />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/ReportGeneration/reviewReport"
                element={
                  <AdminRoute>
                    <ReviewReport />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/ContentManagement"
                element={
                  <AdminRoute>
                    <ContentManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/Admin/AdminCoupons"
                element={
                  <AdminRoute>
                    <AdminCoupons />
                  </AdminRoute>
                }
              />

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
