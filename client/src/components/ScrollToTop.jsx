// src/components/ScrollToTop.js (Enhanced Version)
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Check if the browser supports smooth scrolling
    const supportsSmoothScroll =
      "scrollBehavior" in document.documentElement.style;

    if (supportsSmoothScroll) {
      // Use native smooth scrolling
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    } else {
      // Fallback for browsers that don't support smooth scrolling
      // Use a custom smooth scroll implementation
      const scrollToTop = () => {
        const currentPosition = window.pageYOffset;
        if (currentPosition > 0) {
          window.requestAnimationFrame(scrollToTop);
          window.scrollTo(0, currentPosition - currentPosition / 8);
        }
      };
      scrollToTop();
    }
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
