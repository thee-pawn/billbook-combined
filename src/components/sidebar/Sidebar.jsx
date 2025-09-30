import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HomeIcon, SettingsIcon, UserIcon, UserCog, ReceiptIndianRupee, Layers, Users, 
  Boxes, CalendarHeart, IndianRupeeIcon, MessageSquareCode, CircleUser, ChartLine, LinkIcon, Calendar1, 
  HeadsetIcon
} from "lucide-react";
import logoIcon from "../../assets/images/bb_icon.png";
import logoImage from "../../assets/images/BillBookP.png";
import "./../../css/Sidebar.css";
import LogoIcon from "./LogoIcon";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navigationItems = [
    { name: "Home", icon: <HomeIcon className="sidebar-icon" /> },
    { name: "Invoices", icon: <ReceiptIndianRupee className="sidebar-icon" /> },
    { name: "Customers", icon: <Users className="sidebar-icon" /> },
    { name: "Services", icon: <Layers className="sidebar-icon" /> },
    { name: "Products", icon: <Boxes className="sidebar-icon" /> },
    { name: "Staff", icon: <UserCog className="sidebar-icon" />},
    { name: "Memberships", icon: <CalendarHeart className="sidebar-icon" />},
    { name: "Expenses", icon: <IndianRupeeIcon className="sidebar-icon" />},
    { name: "Reviews", icon: <MessageSquareCode className="sidebar-icon" /> },
    { name: "Analytics", icon: <ChartLine className="sidebar-icon" />},
    { name: "Profile", icon: <SettingsIcon className="sidebar-icon" /> },
    { name: "Integrations", icon: <LinkIcon className="sidebar-icon" /> },
    { name: "Support", icon: <HeadsetIcon className="sidebar-icon" /> }
    

  ];

  const CircleIcon = ({ text, className = "" }) => {
    return (
      <div className={`flex items-center justify-center rounded-full bg-white text-teal-500 ${className}`} style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="font-bold text-lg">{text}</span>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return (
    <div
      className={`sidebar ${isExpanded ? "expanded" : "collapsed"} flex flex-col`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-item-logo flex items-center justify-center">
        {!isExpanded && <img src={logoIcon} alt="Logo" className="sidebar-logo" />}
        {isExpanded &&  <span class="font-serif text-3xl font-bold text-white">BillBook+</span>}
      </div>
      {
      navigationItems.map((item, index) => (
        <Link to={item.name.toLowerCase()} className="sidebar-item">
        {/* <div key={index} > */}
          {item.icon}
          {isExpanded && <span className="sidebar-item-name">{item.name}</span>}
        {/* </div> */}
        </Link>

      ))}
      </div>
  );
};

export default Sidebar;