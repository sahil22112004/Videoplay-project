import React, { useState, useEffect } from "react";
import defaultAvatar from "../../assets/default.jpg";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { logout } from "../../store/auth/authslice";

const BASE_URL = import.meta.env.API_URL;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLogginout, setIsLogginout] = useState(false);

  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("/home")) {
      setActiveTab("home");
    } else if (location.pathname.includes("/watchList")) {
      setActiveTab("watchlist");
    } else if (location.pathname.includes("/history")) {
      setActiveTab("history");
    } else if (location.pathname.includes("/profile")) {
      setActiveTab("profile");
    }
  }, [location.pathname]);

  const handleMenuItemClick = (key, path) => {
    setActiveTab(key);
    navigate(path);
  };

  const handleLogout = async (e) => {
    setIsLogginout(true);
    e.preventDefault();
    e.stopPropagation();

    try {
      await axios.post(`${BASE_URL}/api/user/logout`, {}, { withCredentials: true });
      setIsLogginout(false);
      setShowLogoutConfirm(false);
      dispatch(logout());
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      setIsLogginout(false);
      dispatch(logout());
      toast.error("Logout failed on server, but cleared local session.");
      navigate("/");
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const menuItemsLoggedIn = [
    { key: "home", label: "Home", icon: "🏠", path: "/home" },
    { key: "watchlist", label: "Watchlist", icon: "🕒", path: "/watchList" },
    { key: "history", label: "History", icon: "📜", path: "/history" },
    { key: "profile", label: "Profile", icon: "👤", path: "/profile" },
  ];

  return (
    <div className="h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 bg-gray-50 z-30 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div
              onClick={() => navigate("/home")}
              className="flex items-center space-x-4 cursor-pointer hover:opacity-90"
            >
              <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-0" />
              <span className="text-xl font-bold ml-0">VideoPlay</span>
            </div>
          </div>
          <div className="w-8"></div>
        </div>
      </div>

      {sidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarExpanded(false)}
        ></div>
      )}

      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-50 z-20 transition-all duration-300 flex flex-col justify-between ${
          sidebarExpanded ? "w-64" : "w-16"
        } ${sidebarExpanded ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {isAuthenticated ? (
          <div
            className={`transition-all duration-300 overflow-hidden ${
              sidebarExpanded ? "opacity-100 max-h-40 p-4" : "opacity-0 max-h-0"
            }`}
          >
            <div className="text-center">
              <img
                src={user.avatar || defaultAvatar}
                alt="avatar"
                className="w-12 h-12 rounded-full mx-auto"
              />
              <h2 className="text-md font-semibold mt-2 truncate">
                {user.fullName}
              </h2>
              <p className="text-sm text-gray-500 truncate">@{user.userName}</p>
            </div>
          </div>
        ) : (
          <div
            className={`transition-all duration-300 overflow-hidden ${
              sidebarExpanded ? "opacity-100 max-h-40 p-4" : "opacity-0 max-h-0"
            }`}
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
                🔒
              </div>
              <h2 className="text-md font-semibold mt-2">Not Logged In</h2>
              <p
                className="text-sm text-blue-500 underline mt-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/login");
                }}
              >
                Log In
              </p>
            </div>
          </div>
        )}

        <div className="flex-grow px-2">
          <div className="flex flex-col gap-2 pt-4">
            {menuItemsLoggedIn.slice(0, 3).map((item) => (
              <div
                key={item.key}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuItemClick(item.key, item.path);
                }}
                className={`flex items-center ${
                  sidebarExpanded ? "justify-start" : "justify-center"
                } gap-3 cursor-pointer px-3 py-2 rounded-md transition-all ${
                  activeTab === item.key
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarExpanded && <span>{item.label}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="p-2 border-t">
          {isAuthenticated && menuItemsLoggedIn.slice(3).map((item) => (
            <div
              key={item.key}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuItemClick(item.key, item.path);
              }}
              className={`flex items-center ${
                sidebarExpanded ? "justify-start" : "justify-center"
              } gap-3 cursor-pointer px-3 py-2 rounded-md transition-all ${
                activeTab === item.key
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-gray-200"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarExpanded && <span>{item.label}</span>}
            </div>
          ))}

          {isAuthenticated ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowLogoutConfirm(true);
              }}
              className={`flex items-center ${
                sidebarExpanded ? "justify-start" : "justify-center"
              } gap-3 cursor-pointer px-3 py-2 rounded-md transition-all hover:bg-red-100 text-red-600 mt-2`}
            >
              <span className="text-xl">🚪</span>
              {sidebarExpanded && <span>Logout</span>}
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/login");
                }}
                className={`flex items-center ${
                  sidebarExpanded ? "justify-start" : "justify-center"
                } gap-3 cursor-pointer px-3 py-2 rounded-md transition-all hover:bg-blue-100 text-blue-600`}
              >
                <span className="text-xl">🔐</span>
                {sidebarExpanded && <span>Login</span>}
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/signup");
                }}
                className={`flex items-center ${
                  sidebarExpanded ? "justify-start" : "justify-center"
                } gap-3 cursor-pointer px-3 py-2 rounded-md transition-all hover:bg-green-100 text-green-600`}
              >
                <span className="text-xl">📝</span>
                {sidebarExpanded && <span>Sign Up</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            {isLogginout ? (
              <p>Logging out <i className="fa-solid fa-spinner fa-spin-pulse"></i></p>
            ) : (
              <div>
                <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
                <p className="text-sm text-gray-600 mb-6">Are you sure you want to logout?</p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`flex-1 bg-gray-100 pt-16 transition-all duration-300 ${
          sidebarExpanded ? "lg:ml-64" : "lg:ml-16"
        } ml-0`}
        onClick={() => {
          if (window.innerWidth < 1024) {
            setSidebarExpanded(false);
          }
        }}
      >
        <div className="h-full overflow-x-hidden overflow-y-auto overscroll-none">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 capitalize">{activeTab}</h1>
            <div className="min-h-[calc(100vh-8rem)]">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
