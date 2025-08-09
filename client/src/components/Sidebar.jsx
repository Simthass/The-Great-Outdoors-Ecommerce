// Sidebar.jsx
import React from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Package,
  MapPin,
  HelpCircle,
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const sidebarItems = [
    { icon: User, label: "Profile" },
    { icon: Bell, label: "Notification" },
    { icon: Shield, label: "Security" },
    { icon: Palette, label: "Appearance" },
    { icon: Package, label: "My Orders" },
    { icon: MapPin, label: "Addresses" },
    { icon: HelpCircle, label: "Help" },
  ];

  return (
    <div className="w-80 bg-[#8DC53E] p-6">
      <div className="space-y-2">
        {sidebarItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeTab === item.label
                  ? "bg-white bg-opacity-20 text-white font-medium"
                  : "text-white text-opacity-90 hover:bg-white hover:bg-opacity-10"
              }`}
            >
              <IconComponent size={20} />
              <span className="text-base">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
