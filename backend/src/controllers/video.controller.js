import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from 'cloudinary';
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const uploadVideo = AsyncHandler(async (req, res) => {
    const { title, description, category } = req.body;

    if ([title, description].some((field) => field.trim() == "")) {
        throw new ApiError(400, "title and field is required");
    }

    const videoLocalPath = req.files?.video[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and Thumbnail Both are required");
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const uploadvideo = await Video.create({
        title,
        description,
        userId: req.user._id,
        video: video.url,
        videoId: video.public_id,
        thumbnail: thumbnail.url,
        thumbnailId: thumbnail.public_id,
        category,
        tags: req.body.tags.split(",")
    });

    const uploadedvideo = await Video.findById(uploadvideo._id);

    if (!uploadedvideo) {
        throw new ApiError(404, "Something went wrong while uploading video");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            uploadedvideo,
            "Video Uploaded Successfully"
        )
    );
});

const updateVideo = AsyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const { title, description, category, tags } = req.body;

    if (req.user._id == video.userId) {
        if (Object.keys(req.files).length !== 0) {
            const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
            await cloudinary.uploader.destroy(video.thumbnailId);
            const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
            const updatedvideo = {
                title,
                description,
                category,
                tags: req.body.tags.split(","),
                thumbnail: thumbnail.url,
                thumbnailId: thumbnail.public_id
            };
            const updatedvideodetail = await Video.findByIdAndUpdate(req.params.videoId, updatedvideo, { new: true });
            return res.status(201).json(
                new ApiResponse(
                    201,
                    updatedvideodetail,
                    "Video updated Successfully"
                )
            );
        } else {
            const updatedvideo = {
                title,
                description,
                category,
                tags: req.body.tags.split(","),
            };
            const updatedvideodetail = await Video.findByIdAndUpdate(req.params.videoId, updatedvideo, { new: true });
            return res.status(201).json(
                new ApiResponse(
                    201,
                    updatedvideodetail,
                    "Video updated Successfully"
                )
            );
        }
    } else {
        throw new ApiError(403, "You are not authorized to update this video");
    }
});

const deletevideo = AsyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (req.user._id.equals(video.userId)) {
        await cloudinary.uploader.destroy(video.videoId, { resource_type: "video" });
        await cloudinary.uploader.destroy(video.thumbnailId);
        const deletedvedio = await Video.findByIdAndDelete(req.params.videoId);
        return res.status(200).json(
            new ApiResponse(
                200,
                deletedvedio,
                "Video deleted Successfully"
            )
        );
    } else {
        throw new ApiError(403, "You are not authorized to delete this video");
    }
});

const likevideo = AsyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const user = await User.findById(req.user._id);
    if (video.likedBy.includes(user._id)) {
        return res.status(200).json({ error: 'You have already liked this video' });
    }

    if (video.dislikedBy.includes(user._id)) {
        video.dislike -= 1;
        video.dislikedBy = video.dislikedBy.filter(userId => userId.toString() !== user._id.toString());
    }

    video.likes += 1;
    video.likedBy.push(user._id);
    await video.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            { msg: "liked" }
        )
    );
});

const dislikevideo = AsyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const user = await User.findById(req.user._id);
    if (video.dislikedBy.includes(user._id)) {
        return res.status(200).json({ error: 'You have already disliked this video' });
    }

    if (video.likedBy.includes(user._id)) {
        video.likes -= 1;
        video.likedBy = video.likedBy.filter(userId => userId.toString() !== user._id.toString());
    }

    video.dislike += 1;
    video.dislikedBy.push(user._id);
    await video.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            { msg: "disliked" }
        )
    );
});

const getMyVideo = AsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const videos = await Video.find({ userId: user._id })
        .populate("userId", "userName avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    );
});

const getHomeVideos = AsyncHandler(async (req, res) => {
    const loggedInUserId = req.user?._id;
    let selectedVideos = [];

    if (loggedInUserId) {
        const user = await User.findById(loggedInUserId).select("subscribedChannels");

        const subscribedVideos = await Video.find({
            userId: { $in: user.subscribedChannels }
        })
            .populate("userId", "userName avatar")
            .sort({ createdAt: -1 });

        const otherVideos = await Video.find({
            userId: { $ne: loggedInUserId, $nin: user.subscribedChannels }
        })
            .populate("userId", "userName avatar")
            .sort({ createdAt: -1 });

        let combined = [...subscribedVideos, ...otherVideos];

        if (combined.length >= 30) {
            selectedVideos = combined.slice(0, 30);
        } else {
            const remaining = 30 - combined.length;

            const myVideos = await Video.find({ userId: loggedInUserId })
                .populate("userId", "userName avatar")
                .sort({ createdAt: -1 })
                .limit(remaining);

            selectedVideos = [...combined, ...myVideos];
        }
    } else {
        selectedVideos = await Video.find({})
            .populate("userId", "userName avatar")
            .sort({ createdAt: -1 })
            .limit(30);
    }

    return res.status(200).json(
        new ApiResponse(200, selectedVideos, "Home videos fetched successfully")
    );
});

const openVideo = AsyncHandler(async (req, res) => {
    const videodoc = await Video.findById(req.params.videoId)
        .populate("userId", "userName avatar subscribers subscribedBy");

    if (!videodoc) {
        throw new ApiError(404, "Video not found");
    }
    const video = videodoc.toObject();

    let userId = null;
    let liked = false;
    let disliked = false;
    let isSubscribed = false;
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");


    videodoc.views += 1;
    await videodoc.save();

    if(token){
    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      userId = decodedToken?._id;
  
      liked = userId ? videodoc.likedBy.some(id => id.toString() === userId) : false;
      disliked = userId ? videodoc.dislikedBy.some(id => id.toString() === userId) : false;
      isSubscribed = userId ? videodoc.userId.subscribedBy.some(id => id.toString() === userId) : false;
    } catch (error) {
      console.log(error)
      
    }
  }

    delete video.likedBy;
    delete video.dislikedBy;
    if (video.userId?.subscribedBy) {
        delete video.userId.subscribedBy;
    }

    return res.status(200).json(
        new ApiResponse(200, { video, liked, disliked, isSubscribed }, "Video opened successfully")
    );
});

const getRelatedVideos = AsyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const currentVideo = await Video.findById(videoId);
    if (!currentVideo) {
        return res.status(404).json(new ApiResponse(404, null, "Video not found"));
    }

    const { category, tags } = currentVideo;

    const relatedVideos = await Video.find({
        _id: { $ne: videoId },
        $or: [
            { category: category },
            { tags: { $in: tags } }
        ]
    })
        .populate("userId", "userName avatar")
        .sort({ createdAt: -1 })
        .limit(20);

    if (relatedVideos.length === 0) {
        return res.status(404).json(
            new ApiResponse(404, [], "No related videos found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, relatedVideos, "Related videos fetched successfully")
    );
});

export {
    uploadVideo,
    updateVideo,
    deletevideo,
    likevideo,
    dislikevideo,
    getMyVideo,
    getHomeVideos,
    openVideo,
    getRelatedVideos
};
