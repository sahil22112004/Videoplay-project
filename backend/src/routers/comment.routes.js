import { Router } from "express";
import  {verifyJWT}  from '../middelware/auth.middleware.js';
import { newComment,commentList,updateComment,deleteComment } from "../controllers/comment.controller.js";


const router = Router();

router.route("/new-comment/:videoId").post(verifyJWT,newComment)

router.route("/:videoId").get(commentList)

router.route("/:commentId").put(verifyJWT,updateComment)

router.route("/deletecomment/:commentId").delete(verifyJWT,deleteComment)


export default router;