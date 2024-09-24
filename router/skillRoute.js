import express from "express"
import { isAuthenticated } from "../middlewares/auth.js"
import {addNewSkill,deleteSkill,getAllSkill,updateSkill} from "../controller/skillController.js"

const router = express.Router()

router.post("/addskill",isAuthenticated,addNewSkill)
router.delete("/deleteskill/:id",isAuthenticated,deleteSkill)
router.get("/getallskill",getAllSkill)
router.put("/updateskill/:id",updateSkill)

export default router;