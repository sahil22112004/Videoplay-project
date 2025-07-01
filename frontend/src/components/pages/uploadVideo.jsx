import React, { useState, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL;

const UploadVideo = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    thumbnail: null,
    video: null,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const thumbnailRef = useRef(null);
  const videoRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("tags", formData.tags);
    data.append("thumbnail", formData.thumbnail);
    data.append("video", formData.video);

    const token = localStorage.getItem("token");

    try {
      await axios.post(`${BASE_URL}/api/vedio/uploadVideo`, data, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData({
        title: "",
        description: "",
        category: "",
        tags: "",
        thumbnail: null,
        video: null,
      });

      if (thumbnailRef.current) thumbnailRef.current.value = null;
      if (videoRef.current) videoRef.current.value = null;

      toast.success("Video Uploaded Successfully");
      navigate("/profile");
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Upload Your Video
          </h1>
          <p className="text-gray-600">Share your content with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          {/* Left Form Section */}
          <div className="flex-1">
            <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Video Details
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Enter an engaging title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                    placeholder="Describe your video content..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    >
                      <option value="">Select category</option>
                      <option value="education">Education</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="music">Music</option>
                      <option value="sports">Sports</option>
                      <option value="technology">Technology</option>
                      <option value="gaming">Gaming</option>
                      <option value="lifestyle">Lifestyle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Thumbnail Image
                    </label>
                    <input
                      type="file"
                      name="thumbnail"
                      accept="image/*"
                      ref={thumbnailRef}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Video File *
                    </label>
                    <input
                      type="file"
                      name="video"
                      accept="video/*"
                      ref={videoRef}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg ${
                    loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Video
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Preview Section */}
          <div className="flex-1">
            <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 sticky top-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Live Preview
                </h2>
              </div>

              <div className="space-y-6">
                {/* Thumbnail Preview */}
                <div>
                  {formData.thumbnail ? (
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail preview"
                      className="w-full h-48 sm:h-56 object-cover rounded-xl shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-48 sm:h-56 bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="text-gray-500">Thumbnail preview will appear here</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  {formData.title || "Your video title will appear here"}
                </h3>

                <p className="text-gray-600">
                  {formData.description || "Your video description will appear here..."}
                </p>

                <div className="flex flex-wrap gap-2">
                  {formData.category && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 text-xs rounded-full">
                      {formData.category}
                    </span>
                  )}
                  {formData.tags &&
                    formData.tags.split(',').map((tag, index) => (
                      <span key={index} className="bg-gray-200 text-gray-700 px-3 py-1 text-xs rounded-full">
                        #{tag.trim()}
                      </span>
                    ))}
                </div>

                {formData.video && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Video file selected: {formData.video.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UploadVideo;
