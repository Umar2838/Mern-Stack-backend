import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/Error.js";
import { Skill } from "../models/skillSchema.js";
import {v2 as cloudinary} from "cloudinary";

export const addNewSkill = catchAsyncErrors(async(req,res,next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Icon/Svg is Required! ",400))
 }

 const {svg} = req.files
 const {title,proficiency} = req.body

 

 const cloudinaryResponse = await cloudinary.uploader.upload(
     svg.tempFilePath,
     {folder:"SKILL_SVG"}
 )
 if(!cloudinaryResponse || cloudinaryResponse.error) {
     console.error("Cloudinary Error",cloudinaryResponse.error || "Unknown Cloudinary Error")
 }

const newSkill = await Skill.create({title,proficiency,svg:{
    public_id:cloudinaryResponse.public_id,
    url:cloudinaryResponse.secure_url,
},});
res.status(200).json({
success: true,
message: 'Skill Added successfully',
newSkill
})

})


export const deleteSkill = catchAsyncErrors(async(req,res,next)=>{

    const {id} = req.params;
    const skill = await Skill.findById(id);
    if(!skill){
        return next(new ErrorHandler("Skill not Found",400))
    }
    await skill.deleteOne();
    res.status(200).json({
        success: true,
        message: "Skill deleted successfully"
    })
    
})


export const updateSkill = catchAsyncErrors(async(req,res,next)=>{

    const {id} = req.params;
    let skill = await Skill.findById(id);
    if(!skill){
        return next(new ErrorHandler("Skill not Found",400))
    }
    const {proficiency} = req.body;
    skill = await Skill.findByIdAndUpdate(id,{proficiency},{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success: true,
        message: "Skill Updated successfully",
        skill
    })
    
})



export const getAllSkill = catchAsyncErrors(async(req,res,next)=>{

    const skills = await Skill.find();
    res.status(200).json({
        success:true,
        message: "SKills found successfully",
        skills
    })
    
})