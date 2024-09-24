import mongoose, { model } from "mongoose"

const softwareApplicationSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Software Application name is Required!"]
    },
    svg:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        },
    },    
})

export const SoftwareApplication = mongoose.model("SoftwareApplication",softwareApplicationSchema)