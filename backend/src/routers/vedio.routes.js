import { Router } from "express";
import {verifyJWT} from "../middelware/auth.middleware.js";
import { uploadVideo,updateVideo,deletevideo,likevideo,dislikevideo,getMyVideo,getHomeVideos,openVideo } from "../controllers/video.controller.js";

import { upload } from "../middelware/multer.middleware.js";




const router = Router();

router.route("/uploadVideo").post(verifyJWT, 
    upload.fields([
            {
                name:"video",
                maxCount: 1
            },
            {
                name:"thumbnail",
                maxCount: 1
            }
        ]),
    uploadVideo
);

router.route("/:videoId").put(verifyJWT,
    upload.fields([
        { name: "thumbnail", maxCount: 1 }
      ]),
    updateVideo
)

router.route("/:videoId").delete(verifyJWT,deletevideo)

router.route("/like/:videoId").put(verifyJWT,likevideo)

router.route("/dislike/:videoId").put(verifyJWT,dislikevideo)

router.route("/myVideo").get(verifyJWT,getMyVideo)

router.route("/homeVideo").get(getHomeVideos)

router.route("/openvideo/:videoId").get(openVideo)





export default router;