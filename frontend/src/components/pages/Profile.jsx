import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import VideoCard from "../videos/VideoCard.jsx";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.API_URL;

const Profile = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      getMyVideos();
    }
  }, [token]);

  const getMyVideos = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/vedio/myVideo`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.data) {
        setVideos(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setVideos(response.data);
      } else {
        setVideos([]);
      }
    } catch (err) {
      toast.error("Error fetching videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoDeleted = (videoId) => {
    setVideos((prevVideos) => prevVideos.filter((video) => video._id !== videoId));
  };

  const handleupload = () => {
    navigate("/uploadvideo");
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative w-full h-64 overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center transform scale-105 transition-transform duration-700 hover:scale-110"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(${user?.coverImage || "/default-cover.jpg"})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="relative -mt-20 mx-4 sm:mx-6 lg:mx-8 mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between space-y-6 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <img
                    src={user?.avatar || "/default-avatar.jpg"}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl ring-4 ring-blue-100 object-cover"
                  />
                </div>

                <div className="text-center sm:text-left space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {user?.fullName || "User Name"}
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    @{user?.userName || "username"}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm text-gray-500">
                    <span>Joined at {user?.createdAt?.slice(0, 10) || "Unknown"}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleupload}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span>Upload</span>
                  </span>
                </button>
                <button className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 sm:mx-6 lg:mx-8 mb-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{videos.length}</div>
              <div className="text-sm text-gray-600">Videos</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user?.subscribers || 0}</div>
              <div className="text-sm text-gray-600">Subscribers</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {videos.reduce((total, video) => total + (video.views || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Views</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 sm:mx-6 lg:mx-8 pb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Videos</h2>
              <button
                onClick={getMyVideos}
                className="px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading videos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.length > 0 ? (
                  videos.map((video) => (
                    <VideoCard key={video._id} video={video} onVideoDeleted={handleVideoDeleted} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500 text-lg">No videos uploaded yet.</p>
                    <button
                      onClick={handleupload}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upload Your First Video
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Profile;
