import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/Error.js"
import {User} from "../models/userSchema.js"
import {v2 as cloudinary} from "cloudinary"
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto"

export const register = catchAsyncErrors(async (req,res,next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
           return next(new ErrorHandler("Avatar and Resume Required",400))
    }

    const {avatar,resume} = req.files

    const cloudinaryResponseAvatar = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {folder:"AVATAR"}
    )
    if(!cloudinaryResponseAvatar || cloudinaryResponseAvatar.error) {
        console.error("Cloudinary Error",cloudinaryResponseAvatar.error || "Unknown Cloudinary Error")
    }

    const cloudinaryResponseResume = await cloudinary.uploader.upload(
        resume.tempFilePath,
        {folder:"Resume"}
    )
    if(!cloudinaryResponseResume || cloudinaryResponseResume.error) {
        console.error("Cloudinary Error",cloudinaryResponseResume.error || "Unknown Cloudinary Error")
    }


    const {fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    facebookURL,
    linkedInURL,
    twitterURL,
    } = req.body

    const user = await User.create({
        fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    facebookURL,
    linkedInURL,
    twitterURL,
    avatar:{
        public_id:cloudinaryResponseAvatar.public_id,
        url:cloudinaryResponseAvatar.secure_url
    },
    resume:{
        public_id:cloudinaryResponseResume.public_id,
        url:cloudinaryResponseResume.secure_url
    }
    })

generateToken(user,"User Registered",201,res)

});


export const login = catchAsyncErrors(async(req,res,next)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler("Email and Password Are Required!") )
    }
    const user = await User.findOne({email}).select("+password")
    if(!user){
        return next(new ErrorHandler("Invalid Email or Password!") )
    }
    const isPasswordMatched = await user.comparePassword(password)
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password!") )
    }
    generateToken(user,"Logged In",200,res)
})

export const logout = catchAsyncErrors(async(req,res,next)=>{
    res.status(200).cookie("token","",{
        expires:new Date(Date.now()),
        httpOnly:true,
    }).json({ 
        success:true,
        message:"Logged Out"
    })
})

export const getUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user._id)
    res.status(200).json({
        success:true,
        user,
        
    })
})

export const updateProfile = catchAsyncErrors(async(req,res,next)=>{
    const newUserData  = {fullName: req.body.fullName,
        email:req.body.email,
        phone:req.body.phone,
        aboutMe:req.body.aboutMe,
        portfolioURL:req.body.portfolioURL,
        githubURL:req.body.githubURL,
        instagramURL:req.body.instagramURL,
        facebookURL:req.body.facebookURL,
        linkedInURL:req.body.linkedInURL,
        twitterURL:req.body.twitterURL,
    
    }

        if(req.files && req.files.avatar){
            const avatar = req.files.avatar;
            const user = await User.findById(req.user._id);
            const profileImageId = user.avatar.public_id;
            await cloudinary.uploader.destroy(profileImageId);
            const cloudinaryResponse = await cloudinary.uploader.upload(
                avatar.tempFilePath,
                {folder:"AVATAR"}
            )
            newUserData.avatar = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url
            }
        }
        
        if(req.files && req.files.resume){
            const resume = req.files.resume;
            const user = await User.findById(req.user._id);
            const ResumeId = user.resume.public_id;
            await cloudinary.uploader.destroy(ResumeId);
            const cloudinaryResponse = await cloudinary.uploader.upload(
                resume.tempFilePath,
                {folder:"Resume"}
            )
            newUserData.resume = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url
            }
        }

  const user = await User.findByIdAndUpdate(req.user._id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  })
  res.status(200).json({success:true,user, message:"Profile Updated!"})        
})

export const updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const {currentPassword,newPassword,confirmNewPassword} = req.body;
    if(!currentPassword || !newPassword || !confirmNewPassword){
        return next(new ErrorHandler("Please Fill all the fields!"))
    }
    const user = await User.findById(req.user._id).select("+password");
    const isPasswordMatched = await user.comparePassword(currentPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Incorrect Current Password!"))
    }
    if(newPassword !== confirmNewPassword){
        return next(new ErrorHandler("Confirm Password does not matched!"))

    }
    if(newPassword === currentPassword){
        return next(new ErrorHandler("You have entered older password!"))

    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success:true,
        message:"Password Updated"
    })
})

export const getUserForPortfolio = catchAsyncErrors(async(req,res,next)=>{
    const id = "66d7d0f39626226b7459c0bf";
    const user = await User.findById(id);
    res.status(200).json({ success:true, user})
})

export const forgotPassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHandler("User not Found"))
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});
    const resetPasswordURL = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`
    const message = `Your reset Password Token is: \n\n ${resetPasswordURL} \n\n If you've not request for it Please Ignore it.`

    try{
    await sendEmail({

        email: user.email,
        subject: "Personal Portfolio Password Recovery",
        message,
    })
    res.status(200).json({success:true,message:`Email sent to ${user.email} successfully`})
    }catch(error){
user.resetPasswordExpire = undefined;
user.resetPasswordToken = undefined;
await user.save();
return next(new ErrorHandler(error.message,500));
    }
})

export const resetPassword = catchAsyncErrors(async(req,res,next)=>{

    const {token} = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    })
    if(!user){
        return next(new ErrorHandler("Reset Password is Invalid or has been Expired!",400))
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Confirm password does not matched"))
    }

    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken= undefined;
    await user.save();
    generateToken(user,"Reset Password Successfully!",200,res)
    
})
