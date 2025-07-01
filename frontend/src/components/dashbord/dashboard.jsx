import React, { useState,useEffect } from "react";
import defaultAvatar from "../../assets/default.jpg";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { logout } from "../../store/auth/authslice";
import { useLocation } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
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

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`${BASE_URL}/videos/search?q=${encodeURIComponent(query)}`, {
        withCredentials: true,
      });
      
      setSearchResults(response.data.results || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const [searchTimeout, setSearchTimeout] = useState(null);
  
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      handleSearch(query);
    }, 500);
    
    setSearchTimeout(newTimeout);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    handleSearch(searchQuery);
  };

  const handleSearchResultClick = (result) => {
    setShowSearchResults(false);
    setSearchQuery("");
    console.log("Selected video:", result);
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLogoutConfirm(true);
  };

  const handleLogoutCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLogoutConfirm(false);
  };

  const handleLogoutConfirm = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoggingOut(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/user/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(logout());
      navigate("/");
      
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logout());
      navigate("/");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
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
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={handleLogoutCancel}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <span className="text-red-600 text-xl">🚪</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to logout? You will need to login again to access your account.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleLogoutCancel}
                  disabled={isLoggingOut}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px] flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                      Logout
                    </>
                  ) : (
                    'Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

          <div className="flex-1 max-w-xl mx-2 sm:mx-4 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder="Search videos..."
                  className="w-full px-3 sm:px-4 py-2 pl-3 sm:pl-4 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </form>

            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-80 sm:max-h-96 overflow-y-auto z-40">
                {searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <div
                      key={result.id || index}
                      onClick={() => handleSearchResultClick(result)}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <img
                        src={result.thumbnail || "/placeholder-video.jpg"}
                        alt={result.title}
                        className="w-16 h-10 sm:w-20 sm:h-12 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm line-clamp-2 text-gray-900">{result.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{result.channel} • {result.views} views</p>
                      </div>
                    </div>
                  ))
                ) : searchQuery.trim() && !isSearching ? (
                  <div className="p-3 sm:p-4 text-center text-gray-500 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                ) : null}
              </div>
            )}
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
              onClick={handleLogoutClick}
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

      <div
        className={`flex-1 bg-gray-100 pt-16 transition-all duration-300 ${
          sidebarExpanded ? "lg:ml-64" : "lg:ml-16"
        } ml-0`}
        onClick={() => {
          setShowSearchResults(false);
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