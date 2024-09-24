import express from "express"
import { isAuthenticated } from "../middlewares/auth.js"
import {addNewApplication,deleteApplication,getAllApplication} from "../controller/softwareApplication.js"

const router = express.Router()

router.post("/addapplication",isAuthenticated,addNewApplication)
router.delete("/deleteapplication/:id",isAuthenticated,deleteApplication)
router.get("/getallapplication",getAllApplication)

export default router;