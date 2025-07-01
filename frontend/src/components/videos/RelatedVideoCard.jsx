import { useNavigate } from "react-router-dom";

const RelatedVideoCard = ({ video }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/watch/${video._id}`)}
      className="flex gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 group"
    >
      <div className="relative flex-shrink-0">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-40 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
        />
        {video.duration && (
          <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
            {video.duration}
          </span>
        )}
      </div>

      <div className="flex flex-col justify-start min-w-0 flex-1">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-5 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {video.title}
        </h3>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            {video.userId?.userName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-5">
            {video.views} views
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelatedVideoCard;