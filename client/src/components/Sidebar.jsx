import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Package,
  Star,
  FileText,
  ShoppingBag,
  UserCog,
  PackagePlus,
  ShoppingCart,
  User,
} from "lucide-react";

const Sidebar = ({ currentPage, onPageChange, userProfile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [imageLoading, setImageLoading] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    {
      icon: Home,
      label: "Dashboard",
      key: "dashboard",
      active: currentPage === "dashboard",
    },
    {
      icon: Users,
      label: "User Management",
      key: "users",
      active: currentPage === "users",
    },
    {
      icon: UserCog,
      label: "Employee Management",
      key: "employees",
      active: currentPage === "employees",
    },
    {
      icon: Package,
      label: "Inventory Management",
      key: "inventory",
      active: currentPage === "inventory",
    },
    {
      icon: ShoppingCart,
      label: "Order Management",
      key: "orders",
      active: currentPage === "orders",
    },
    {
      icon: Star,
      label: "Review Management",
      key: "reviews",
      active: currentPage === "reviews",
    },
    {
      icon: PackagePlus,
      label: "Product Management",
      key: "Products",
      active: currentPage === "Products",
    },
    {
      icon: FileText,
      label: "Reports",
      key: "reports",
      active: currentPage === "reports",
    },
  ];

  // Fetch profile image similar to Header component
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (userProfile) {
        try {
          setImageLoading(true);
          const token = localStorage.getItem("token");
          const response = await fetch("/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.profileImage) {
              // Construct the full image URL same as Header
              const imageUrl = data.data.profileImage.startsWith("http")
                ? data.data.profileImage
                : `http://localhost:5000${data.data.profileImage}`;
              setProfileImage(imageUrl);
            } else {
              setProfileImage("/default-profile.jpg");
            }
          } else {
            setProfileImage("/default-profile.jpg");
          }
        } catch (error) {
          console.error("Error fetching profile image:", error);
          setProfileImage("/default-profile.jpg");
        } finally {
          setImageLoading(false);
        }
      } else {
        setProfileImage("/default-profile.jpg");
      }
    };

    fetchProfileImage();
  }, [userProfile]);

  const handleNavClick = (key) => {
    if (key === "dashboard") {
      navigate("/AdminDashboard");
    } else if (key === "users") {
      navigate("/Admin/User");
    } else if (key === "employees") {
      navigate("/Admin/Employee");
    } else if (key === "inventory") {
      navigate("/Admin/Inventory");
    } else if (key === "orders") {
      navigate("/Admin/Orders");
    } else if (key === "reviews") {
      navigate("/Admin/ReviewList");
    } else if (key === "Products") {
      navigate("/Admin/AdminProduct");
    } else if (key === "reports") {
      navigate("/Admin/ReportGeneration/productReport");
    }
  };

  // Function to get user initials as fallback
  const getUserInitials = () => {
    if (!userProfile) return "A";
    const firstName = userProfile.firstName || "";
    const lastName = userProfile.lastName || "";
    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "A";
    return initials;
  };

  // Handle image error by falling back to initials
  const handleImageError = (e) => {
    console.log("Profile image failed to load, falling back to initials");
    e.target.style.display = "none";
    e.target.nextElementSibling.style.display = "flex";
  };

  return (
    <aside
      className={`bg-green-600 text-white h-screen sticky top-0
                  flex flex-col justify-between
                  transition-[width] duration-300 ease-in-out rounded-br-lg rounded-tr-lg
                  ${isExpanded ? "w-65" : "w-20"}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Top */}
      <div>
        {/* Logo */}
        <div
          className={`
    h-12 rounded-lg flex items-center justify-center mt-6 mb-8 mx-auto
    transition-all duration-300 ease-in-out border-2
    ${isExpanded ? "w-40 px-4" : "w-12"}
  `}
        >
          <img
            src="/TGO-Logo.png"
            alt="Company Logo"
            className={`
      object-contain
      ${isExpanded ? "h-8 w-auto" : "h-6 w-auto"}
      transition-all duration-300 ease-in-out
    `}
          />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-3 px-2">
          {navigationItems.map((item, i) => {
            const Icon = item.icon;
            const active = item.active;
            return (
              <button
                key={i}
                onClick={() => {
                  if (item.path) {
                    window.location.href = item.path;
                  } else {
                    handleNavClick(item.key);
                  }
                }}
                className={`group rounded-lg h-12 
                            flex items-center transition-all duration-200 cursor-pointer
                            ${
                              active
                                ? "bg-green-500"
                                : "bg-green-700 hover:bg-green-500"
                            }
                            ${
                              isExpanded
                                ? "justify-start w-full px-3 gap-3"
                                : "justify-center w-12 mx-auto"
                            }`}
                title={item.label}
              >
                <Icon className="w-6 h-6 shrink-0" />
                {isExpanded && (
                  <span className="font-medium whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile */}
      <div className="mb-6 flex flex-col items-center">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white">
          {imageLoading ? (
            <div className="bg-gray-300 animate-pulse rounded-full w-full h-full flex items-center justify-center">
              <User size={16} className="text-gray-500" />
            </div>
          ) : (
            <>
              <img
                src={profileImage}
                alt="Admin Profile"
                className="w-full h-full object-cover cursor-pointer rounded-full"
                onError={handleImageError}
                style={{ display: "block" }}
              />
              <div
                className="bg-green-800 rounded-full w-full h-full flex items-center justify-center text-white font-semibold text-xs cursor-pointer absolute top-0 left-0"
                style={{ display: "none" }}
              >
                {getUserInitials()}
              </div>
            </>
          )}
        </div>
        {isExpanded && (
          <div className="mt-2 text-center">
            <p className="text-xs font-medium">
              {userProfile?.firstName} {userProfile?.lastName}
            </p>
            <p className="text-xs text-green-200">{userProfile?.role}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
