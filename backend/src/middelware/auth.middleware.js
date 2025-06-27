import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = AsyncHandler(async (req, _, next) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        console.log("Received Token:", token); // Debugging log

        if (!token) {
            throw new ApiError(401, "Unauthorized access - No token provided");
        }

        // Verify token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new ApiError(401, "Token has expired. Please log in again.");
            }
            throw new ApiError(401, "Invalid access token");
        }

        // Find user in DB
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid access token - User not found");
        }

        req.user = user; // Attach user object to request
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized access");
    }
});
