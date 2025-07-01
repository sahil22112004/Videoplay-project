import { useEffect, useState } from "react";
import axios from "axios";
import RelatedVideoCard from "../videos/RelatedVideoCard.jsx";

const RelatedVideo = ({ currentVideoId }) => {
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`/api/vedio/relatedvideo/${currentVideoId}`);
        setRelatedVideos(data.data);
      } catch (err) {
        setRelatedVideos([]);
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (currentVideoId) {
      fetchRelated();
    }
  }, [currentVideoId]);

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Related Videos
        </h2>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {loading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex gap-3 p-3 animate-pulse">
                <div className="w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5Z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Unable to load related videos
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {error}
            </p>
          </div>
        ) : relatedVideos.length === 0 ? (
          // Empty state
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No related videos found
            </p>
          </div>
        ) : (
          // Videos list
          relatedVideos.map((video) => (
            <RelatedVideoCard key={video._id} video={video} />
          ))
        )}
      </div>
    </div>
  );
};

export default RelatedVideo;