import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share, Download, MoreHorizontal, Bell, Search, Copy } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";
import RelatedVideo from './relatedVideo.jsx'; 
import Comment from './comments.jsx'; 
import { useRef } from 'react';


const WatchPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showShareBox, setShowShareBox] = useState(false);
  const shareRef = useRef(null);
  const videoUrl = `${window.location.origin}/watch/${videoId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(videoUrl);
    toast.success("Link copied to clipboard");
  };


  // Get user data from Redux
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);

  // Fetch video data when component mounts
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`/api/vedio/openvideo/${videoId}`, {
          withCredentials: true,
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        const { video, liked, disliked, isSubscribed } = response.data.data;
        setVideo(video);
        setUserLiked(liked);
        setUserDisliked(disliked);
        setIsSubscribed(isSubscribed);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching video:', error);
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId, token]);

  // Handle like button click
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Login to like this video");
      return;
    }
    
    if (userLiked) return;

    try {
      // Update UI immediately
      setUserLiked(true);
      setUserDisliked(false);
      setVideo(prev => ({
        ...prev,
        likes: prev.likes + 1,
        dislike: userDisliked ? prev.dislike - 1 : prev.dislike
      }));

      // Send request to server
      await axios.put(`/api/vedio/like/${videoId}`, {}, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      console.error('Error liking video:', error);
      toast.error('Failed to like video');
    }
  };

  // Handle dislike button click
  const handleDislike = async () => {
    if (!isAuthenticated) {
      toast.error("Login to dislike this video");
      return;
    }
    
    if (userDisliked) return;

    try {
      // Update UI immediately
      setUserDisliked(true);
      setUserLiked(false);
      setVideo(prev => ({
        ...prev,
        dislike: prev.dislike + 1,
        likes: userLiked ? prev.likes - 1 : prev.likes
      }));

      // Send request to server
      await axios.put(`/api/vedio/dislike/${videoId}`, {}, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      console.error('Error disliking video:', error);
      toast.error('Failed to dislike video');
    }
  };

  // Handle subscribe/unsubscribe
  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to subscribe");
      return;
    }

    try {
      if (isSubscribed) {
        // Unsubscribe
        setIsSubscribed(false);
        setVideo(prev => ({
          ...prev,
          userId: {
            ...prev.userId,
            subscribers: prev.userId.subscribers - 1
          }
        }));

        await axios.put(`/api/user/unsubscribe/${video.userId._id}`, {}, {
          withCredentials: true,
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        toast.success("Unsubscribed successfully");
      } else {
        // Subscribe
        setIsSubscribed(true);
        setVideo(prev => ({
          ...prev,
          userId: {
            ...prev.userId,
            subscribers: prev.userId.subscribers + 1
          }
        }));

        await axios.put(`/api/user/subscribe/${video.userId._id}`, {}, {
          withCredentials: true,
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        toast.success("Subscribed successfully");
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update subscription');
      }
    }
  };

  // Format numbers (1000 -> 1K, 1000000 -> 1M)
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Show error if no video found
  if (!video) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Video not found</h2>
          <button 
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b">
        <div 
          onClick={() => navigate("/home")} 
          className="flex items-center space-x-4 cursor-pointer hover:opacity-90"
        >
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-bold">VideoPlay</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="flex items-center">
            <div className="flex-1 flex">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500"
              />
              <button className="px-6 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="w-24"></div>
      </header>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto pl-15 pr-8  py-6">
        <div className="flex gap-8 ml-6">
          {/* Left Side - Video Player and Info */}
          <div className="flex-1 max-w-4xl">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video
                controls
                className="w-full h-full"
                src={video.video}
                poster={video.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Title */}
            <h1 className="text-2xl font-semibold mb-4">{video.title}</h1>

            {/* Video Actions */}
            <div className="flex items-center justify-between mb-6">
              {/* Channel Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={video.userId?.avatar}
                  alt={video.userId?.userName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-lg">{video.userId?.userName}</h3>
                  <p className="text-sm text-gray-600">
                    {formatNumber(video.userId?.subscribers)} subscribers
                  </p>
                </div>

                {/* Subscribe Button */}
                {video.userId?._id !== user?._id && (
                  <button
                    onClick={handleSubscribe}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-full font-medium ml-4 ${
                      isSubscribed
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Like/Dislike */}
                <div className="flex items-center bg-gray-100 rounded-full">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-l-full hover:bg-gray-200 ${
                      userLiked ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span>{formatNumber(video.likes)}</span>
                  </button>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <button
                    onClick={handleDislike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-r-full hover:bg-gray-200 ${
                      userDisliked ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    <span>{formatNumber(video.dislike)}</span>
                  </button>
                </div>

                {/* Share Button */}
                <div>
                  <button
                    onClick={() => setShowShareBox(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    <Share className="w-5 h-5" />
                    <span>Share</span>
                  </button>

                  {showShareBox && (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                        <button
                          onClick={() => setShowShareBox(false)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 cursor-pointer"
                        >
                          ✕
                        </button>

                        <h2 className="text-lg font-semibold mb-4 text-center">Share this video</h2>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                          <div className="flex items-center bg-gray-100 px-3 py-2 rounded">
                            <input
                              type="text"
                              value={videoUrl}
                              readOnly
                              className="flex-1 bg-transparent outline-none text-sm"
                            />
                            <button
                              onClick={handleCopy}
                              className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">QR Code (Coming Soon)</label>
                          <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm italic">
                            QR code placeholder
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>


                {/* More Options */}
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Description */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              {/* Views, Date, Category */}
              <div className="flex items-center space-x-4 text-sm font-medium mb-3">
                <span>{formatNumber(video.views)} views</span>
                <span>{formatDate(video.createdAt)}</span>
                {video.category && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {video.category}
                  </span>
                )}
              </div>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {video.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description Text */}
              <p className={`text-sm leading-relaxed ${showFullDescription ? '' : 'line-clamp-3'}`}>
                {video.description || 'No description available'}
              </p>

              {/* Show More/Less Button */}
              {video.description && video.description.length > 100 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800 mt-2"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <Comment 
                videoId={videoId}
                isAuthenticated={isAuthenticated}
                token={token}
                user={user}
              />
            </div>
          </div>

          {/* Right Side - Related Videos */}
          <div className="w-100 mr-4">
            <RelatedVideo 
              currentVideoId={videoId}
              video={video}
            />
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default WatchPage;