import express from "express";
import dotenv from "dotenv"
import cors from "cors" // For connecting frontend to backend use this package
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload"; // for getting files from frontend
import dbConnection from "./database/dbconnection.js";
import { errorMiddleware } from "./middlewares/Error.js";
import messageRouter from "./router/messageRoutes.js"
import userRouter from "./router/UserRoute.js"
import timelineRouter from "./router/timelineRoute.js"
import softwareApplicationRoute from "./router/softwareApplicationRoute.js"
import skillRoute from "./router/skillRoute.js"
import projectRoute from "./router/projectRoute.js"

const app = express()
dotenv.config({path:"./config/config.env"})

// for connecting frontend to backend
app.use(cors({
    origin:[process.env.PORTFOLIO_URL,process.env.DASHBOARD_URL],
    methods:["GET","POST","DELETE","PUT"],
    credentials:true,
})

);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// for getting files from frontend

app.use(
    fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
})
);

app.use("/api/v1/message",messageRouter)
app.use("/api/v1/user",userRouter)
app.use("/api/v1/timeline",timelineRouter)
app.use("/api/v1/software",softwareApplicationRoute)
app.use("/api/v1/skill",skillRoute)
app.use("/api/v1/project",projectRoute)




dbConnection();

// Error handler middleware
app.use(errorMiddleware)

export default app