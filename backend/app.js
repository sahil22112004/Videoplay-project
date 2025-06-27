import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import errorHandler from "./src/middelware/errorHandler.js";



const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieparser( ))

// importing router

import userRouter from "./src/routers/user.routes.js"
import vedioRouter from "./src/routers/vedio.routes.js"
import commentRouter from "./src/routers/comment.routes.js"


app.use("/user",userRouter)
app.use("/vedio",vedioRouter)
app.use("/comment",commentRouter)



app.use(errorHandler); //  this must be at the END, after routes

export{app}
