import {AsyncHandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const option = {
    httpOnly: true,
    sameSite: "Lax",
    secure: false
}

const generateAccessTokenRefreshToken = async (user_id)=>{
    try {
        const user = await User.findById(user_id)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Error while generating token")
        
    }

}

const registration = AsyncHandler( async (req, res) => {
    const {fullName, userName, email, password} = req.body

    if (
        [fullName, email, userName, password].some((field)=>
        field?.trim()=="")
    ){
        throw new ApiError(400,"All field is required")
    }
    const existedUser = await User.findOne({
        $or:[{userName}, {email}]
    })
    if(existedUser){
        throw new ApiError(409,"user with username or email already existed ")
    }
    console.log(req.files)

    const avatarLocalpath = req.files?.avatar[0]?.path
    console.log(`avatar path : ${avatarLocalpath}`)
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    console.log(`coverImage path : ${coverImageLocalPath}`)


    if (!avatarLocalpath){
        throw new ApiError(400,"avatar file required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath)
    console.log(avatar?.url)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log(coverImage?.url)

    if (!avatar){
            throw new ApiError(400,"avatar upload failed")
        }
    
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createduser){
        throw new ApiError(500, " Something went wrong while registrating the user ")
    }
    return res.status(201).json(
        new ApiResponse(201,createduser,"user registered successfully")
    )
})

const loginuser = AsyncHandler( async(req,res)=>{
    const {email, password} = req.body
    if([email,password].some((feild)=>{
        feild?.trim() == ""})
    ){
        throw new ApiError(400,"email and password are required")
    }
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(401,"user not found")
    }
    const isValidPassword = await user.isPasswordCorrect(password)
    if(!isValidPassword){
        throw new ApiError(401,"invalid password")
    }

    const {accessToken,refreshToken} = await generateAccessTokenRefreshToken(user._id)

    const loggedinuser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    return res
        .status(200)
        .cookie("accessToken", accessToken, option )
        .cookie("refreshToken", refreshToken, option )
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinuser, accessToken, refreshToken
                },
                "Logged in successfully"
    
            )
        )
})

const logoutuser = AsyncHandler(async (req, res) => {
    console.log(`cookies received: ${req.cookies.accessToken}`);  // Corrected cookie logging
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(
            new ApiResponse(200, {}, "Logged Out Successfully")
        );
});

const subscribe = AsyncHandler(async (req, res) =>{
    const userA = await User.findById(req.user._id)
    const userB = await User.findById(req.params.userbId)

    if (userB.subscribedBy.includes(userA._id)){
        return res.status(400).json(
            new ApiResponse(400, {}, "You are already subscribed to this user"))
    }
    userB.subscribers += 1
    userB.subscribedBy.push(userA._id)
    await userB.save()
    userA.subscribedChannels.push(userB._id)
    await userA.save()

    return res.status(200).json(
        new ApiResponse(200, {}, "You have successfully subscribed to this user"))

})

const unsubscribe = AsyncHandler(async (req, res) =>{
    const userA = await User.findById(req.user._id)
    const userB = await User.findById(req.params.userbId)
    if (!userB.subscribedBy.includes(userA._id)){
        return res.status(400).json(
            new ApiResponse(400, {}, "You are not subscribed to this user"))
            }
    
    if(userB.subscribedBy.includes(userA._id)){
        userB.subscribers -= 1
        userB.subscribedBy = userB.subscribedBy.filter(userid => userid.toString() !== userA._id.toString())
        await userB.save()
        userA.subscribedChannels = userA.subscribedChannels.filter(userid => userid.toString() !== userB._id.toString())
        await userA.save()
    }
    return res.status(200).json(
        new ApiResponse(200, {}, "You have successfully unsubscribed from this user")
    )
})

export {registration,
    loginuser,
    logoutuser,
    subscribe,
    unsubscribe

}
