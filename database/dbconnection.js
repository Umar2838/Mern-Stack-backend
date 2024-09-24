import mongoose from "mongoose";

const dbConnection = ()=>{
 mongoose.connect(process.env.MONGO_URI,{
    dbName: "PORTFOLIO",
 }).then(()=>{
    console.log("conneted with db")
 }).catch((err)=>{
    console.log(`some error occurs ${err}`)
 })


}

export default dbConnection;