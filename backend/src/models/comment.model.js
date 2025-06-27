import mongoose , { Schema } from "mongoose";


const commentSchema = new Schema(
    {
        userId:{
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        videoId:{
            type: String,
            required: true
        },
        commentText:{
            type: String,
            required: true
        }
    },{
        timestamps: true
    }


)

export const Comment = mongoose.model('Comment', commentSchema);
