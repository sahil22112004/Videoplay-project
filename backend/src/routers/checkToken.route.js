import { Router } from "express";
import {checkToken} from "../controllers/checkauth.js"


const router = Router();

router.route("/check").get(checkToken)

export default router;