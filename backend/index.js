import {app} from './app.js';
import dotenv from "dotenv";
import connectdb from "./src/db/connect.js"

dotenv.config();


connectdb();
app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})