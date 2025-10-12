// components/ScrollLink.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const ScrollLink = ({ to, children, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();

    // Navigate to the page first if needed
    navigate(to.split("#")[0]);

    // Then scroll to the element
    const id = to.split("#")[1];
    if (id) {
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 0);
    }
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export default ScrollLink;
