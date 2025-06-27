import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();


const {Schema} = mongoose

const userSchema = new Schema({
    userName:{
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    fullName:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    avatar:{
        type: String,
        required: true
    },
    coverImage:{
        type: String
    },
    subscribers:{
        type: Number,
        default: 0
    },
    subscribedChannels:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    subscribedBy:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    watchHistory:[
        {
        type: Schema.Types.ObjectId,
        ref:"vedios"
        },
    ],
    refreshToken: {
        type: String,
    }

},{
    timestamps: true
})

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};


  export const User = mongoose.model("User", userSchema);
      
  