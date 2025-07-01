import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import errorHandler from "./src/middelware/errorHandler.js";



const app = express()

const allowedOrigins = process.env.CORS_ORIGIN.split(",");

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieparser( ))


import userRouter from "./src/routers/user.routes.js"
import vedioRouter from "./src/routers/vedio.routes.js"
import commentRouter from "./src/routers/comment.routes.js"
import checkTokenRute from "./src/routers/checkToken.route.js"


app.use("/user",userRouter)
app.use("/vedio",vedioRouter)
app.use("/comment",commentRouter)
app.use("/checkToken",checkTokenRute)



app.use(errorHandler); 

export{app}
