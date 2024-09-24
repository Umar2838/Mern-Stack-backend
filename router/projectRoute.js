import express from "express"
import { isAuthenticated } from "../middlewares/auth.js"
import {addNewProject,deleteProject,updateProject,getAllProjects,getSingleProject} from "../controller/projectController.js"

const router = express.Router()

router.post("/addproject",isAuthenticated,addNewProject)
router.delete("/deleteproject/:id",isAuthenticated,deleteProject)
router.get("/getallproject",getAllProjects)
router.put("/updateproject/:id",updateProject)
router.get("/:id",getSingleProject)


export default router;