import { AsyncHandler } from "../utils/asynchandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const checkToken = AsyncHandler(async(req,res)=>{
    const token = req.cookies?.accessToken
    if(token){
        return res.status(200).json(
            new ApiResponse(200,{isAuthenticated:true},"user is authenticated")
        )
    }
    return res.status(200).json(
        new ApiResponse(200,{isAuthenticated:false},"user is not authenticated")
    )
})

export {checkToken}