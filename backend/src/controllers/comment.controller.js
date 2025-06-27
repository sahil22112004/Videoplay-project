import {AsyncHandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Comment } from "../models/comment.model.js"
import { User } from "../models/user.model.js"

const newComment = AsyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const new_comment = new Comment({
        userId: user._id,
        videoId: req.params.videoId, 
        commentText: req.body.commentText,
    });

    const comment =  await new_comment.save();

    return res.status(201).json(
        new ApiResponse(201,comment, "Commented successfully")
    );
});

const commentList = AsyncHandler(async (req, res) =>{
    const comments = await Comment.find({videoId: req.params.videoId}).populate("userId","userName avatar").sort({ createdAt: -1 })
    return res.status(200).json(
        new ApiResponse(200, {commentList : comments}, "Comments fetched successfully")
    )
})

const updateComment = AsyncHandler(async (req, res) =>{

    const user = await User.findById(req.user.id);
    const comment = await Comment.findById(req.params.commentId);
    console.log(comment)
    if (user._id .toString() !== comment.userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }
    comment.commentText = req.body.commentText;
    const updatedComment = await comment.save();
    return res.status(200).json(
        {updatedComment:updatedComment}
    )
})

const deleteComment = AsyncHandler(async (req, res) =>{
    const user = await User.findById(req.user.id);
    const comment = await Comment.findById(req.params.commentId);
    console.log(comment)
    if (user._id .toString() !== comment.userId.toString()) {
        throw new ApiError(403, "You are not authorized to Delete this comment");
    }
    await Comment.findByIdAndDelete(req.params.commentId)
    return res.status(200).json(
        new ApiResponse(200,  "Comment deleted successfully")
    )
})

export {
    newComment,
    commentList,
    updateComment,
    deleteComment
}