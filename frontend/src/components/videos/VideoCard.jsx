import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

const VideoCard = ({ video, onVideoDeleted }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleClick = () => {
    navigate(`/watch/${video._id}`);
  };



  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
     console.log("Attempting to delete video with ID:", video._id);
  console.log("Current user ID from token:", video.owner?._id || video.owner || video.userId?._id || video.userId); // optional chain fallback
  

    setIsDeleting(true);
    try {
      await axios.delete(`/api/vedio/${video._id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      // Call callback to refresh the videos list
      if (onVideoDeleted) {
        onVideoDeleted(video._id);
      }
      
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  // Handle update video
  const handleUpdate = (e) => {
    e.stopPropagation()
    navigate('/update-video', { state: { video } });
    setShowMenu(false);
  };

  // Toggle menu
  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };
  
  // Helper function to format view count
  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Helper function to truncate title
  const truncateTitle = (title, maxLength = 60) => {
    if (!title) return 'Untitled';
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <div 
    onClick={handleClick}
    className="w-full max-w-sm cursor-pointer group hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
      {/* Thumbnail */}
      <div className="relative w-full h-48 bg-gray-200 rounded-xl overflow-hidden">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title || 'Video thumbnail'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/default-thumbnail.jpg'; // Fallback image
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Duration overlay (if available) */}
        {video.duration && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex mt-3 gap-3 p-2 relative">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={video.owner?.avatar || video.userId?.avatar || '/default-avatar.jpg'}
            alt={video.owner?.userName || video.userId?.userName || 'User'}
            className="w-9 h-9 rounded-full object-cover border border-gray-200"
            onError={(e) => {
              e.target.src = '/default-avatar.jpg'; // Fallback avatar
            }}
          />
        </div>

        {/* Text Info */}
        <div className="flex flex-col overflow-hidden flex-1 min-w-0">
          <h3 
            className="text-sm font-semibold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors"
            title={video.title} // Show full title on hover
          >
            {truncateTitle(video.title)}
          </h3>
          
          <p className="text-xs text-gray-600 truncate mb-1">
            {video.owner?.userName || video.userId?.userName || 'Unknown User'}
          </p>
          
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>

        {/* Three dots menu - positioned at right side of text info */}
        <div className="flex-shrink-0 relative" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className="w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200"
            disabled={isDeleting}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-28 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
              <button
                onClick={handleUpdate}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Update
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;