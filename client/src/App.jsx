import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import TopBar from "./components/topBar";
import Header from "./components/header";
import HomeHero from "./components/homeHero";
import Footer from "./components/footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/aboutUs";
import Contact from "./pages/contactus";
// import Events from "./pages/Events";
// import Register from "./pages/Register";
// import Cart from "./pages/Cart";

// Wrapper to show TopBar and HomeHero only on the home page
const Layout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen font-sans text-gray-800">
      {/* Top Section - Only on Home */}
      {isHome ? (
        <div
          className="bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/hero-background.png')",
          }}
        >
          <TopBar />
          <Header />
          <HomeHero />
        </div>
      ) : (
        // For other pages, show Header without background
        <Header />
      )}

      {/* Page content */}
      <div className="bg-white">{children}</div>

      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/aboutUs" element={<About />} />
          <Route path="/contactus" element={<Contact />} />
          {/* <Route path="/events" element={<Events />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
