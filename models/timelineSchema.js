import mongoose from "mongoose";
const timelineSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Timeline title is Required"]
    },
    description:{
        type:String,
    },
    timeline:{
from:{
    type:String,
    required:[true,"Starting date is required is Required"]
},
to:String
    }
})

export const Timeline = mongoose.model("Timeline",timelineSchema)
