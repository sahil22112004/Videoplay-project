import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns"; 
import defaultAvatar from "../../assets/default.jpg";

const AllVideoCard = ({ video }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log(video)
    navigate(`/watch/${video._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer w-full hover:shadow-lg transition rounded-md"
    >
      <div className="w-full aspect-video bg-gray-200 overflow-hidden rounded-lg">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex mt-3 gap-3">
        <img
          src={video.userId?.avatar || defaultAvatar}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {video.title}
          </h3>
          <p className="text-sm text-gray-700">
            {video.userId?.userName || "Unknown"}
          </p>
          <p className="text-xs text-gray-500">
            {video.views} views •{" "}
            {formatDistanceToNow(new Date(video.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllVideoCard;
