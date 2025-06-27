import {Router} from 'express';
import {registration,loginuser,logoutuser,subscribe,unsubscribe} from "../controllers/user.controller.js";
import {upload} from "../middelware/multer.middleware.js"
import  {verifyJWT}  from '../middelware/auth.middleware.js';

const router = Router();

router.route("/register").post(
    
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registration
);

router.route("/login").post(loginuser)

router.route("/logout").post(verifyJWT,logoutuser)

router.route("/subscribe/:userbId").put(verifyJWT,subscribe)

router.route("/unsubscribe/:userbId").put(verifyJWT,unsubscribe)


export default router;