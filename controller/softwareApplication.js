import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/Error.js";
import { SoftwareApplication } from "../models/softwareApplicationSchema.js";
import {v2 as cloudinary} from "cloudinary";

export const addNewApplication = catchAsyncErrors(async(req,res,next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Icon/Svg is Required! ",400))
 }

 const {svg} = req.files
 const {name} = req.body

 

 const cloudinaryResponse = await cloudinary.uploader.upload(
     svg.tempFilePath,
     {folder:"SOFTWARE_SVG"}
 )
 if(!cloudinaryResponse || cloudinaryResponse.error) {
     console.error("Cloudinary Error",cloudinaryResponse.error || "Unknown Cloudinary Error")
 }

const newApplication = await SoftwareApplication.create({name,svg:{
    public_id:cloudinaryResponse.public_id,
    url:cloudinaryResponse.secure_url,
},});
res.status(200).json({
success: true,
message: 'Software application Added successfully',
newApplication
})

})


export const deleteApplication = catchAsyncErrors(async(req,res,next)=>{

    const {id} = req.params;
    const softwareApplictaion = await SoftwareApplication.findById(id);
    if(!softwareApplictaion){
        return next(new ErrorHandler("Software Applictaion not Found",400))
    }
    await softwareApplictaion.deleteOne();
    res.status(200).json({
        success: true,
        message: "Software Application deleted successfully"
    })
    
})

export const getAllApplication = catchAsyncErrors(async(req,res,next)=>{

    const softwareApplications = await SoftwareApplication.find();
    res.status(200).json({
        success:true,
        message: "Software Applications found successfully",
        softwareApplications
    })
    
})