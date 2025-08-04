// src/components/AppLayout.jsx
import { useLocation } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import TopBar from "./topBar";
import HomeHero from "./homeHero";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen font-sans text-gray-800">
      {isHome ? (
        <>
          <TopBar />
          <Header />
          <HomeHero />
        </>
      ) : (
        <Header />
      )}
      <main className="bg-white">{children}</main>
      <Footer />
    </div>
  );
};

export default AppLayout;
