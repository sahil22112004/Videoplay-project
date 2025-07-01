import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoCard from "../videos/AllVideoCard.jsx";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.API_URL;

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/vedio/homeVideo`, {
          withCredentials: true,
        });
        setVideos(res.data.data || []);
      } catch (error) {
        toast.error("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="px-4 py-6">
      {loading ? (
        <div className="text-center text-lg font-semibold text-gray-600">
          Loading videos...
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center text-lg font-semibold text-gray-600">
          No videos found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
