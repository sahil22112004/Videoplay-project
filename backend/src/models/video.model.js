import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    { 
        title: { 
            type: String,
            required: true
         },
        description: { 
            type: String,
            required: true 
        },
        userId:{
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        video: {
            type: String,
            required: true 
        },
        videoId: {
            type: String,
            required: true 
        },
        thumbnail: {
            type: String,
            required: true 
        },
        thumbnailId: {
            type: String,
            required: true 
        },
        category: {
            type: String,
            required: true 
        },
        tags: [    
        { type: String }
        ],
        likes: {
            type: Number,
            default: 0 
        },
        dislike: {
            type: Number,
            default: 0
        },
        views: {
            type: Number,
            default: 0
        },
        
        likedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        dislikedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        
    },
    {
        timestamps:true

})

videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video",videoSchema)