// This Middleware is used to catch error and try to resolve it if it is not resolving then it it runs further function it cannot do crash your code

export const catchAsyncErrors = (theFunction)=>{
    return (req,res,next)=>{
        Promise.resolve(theFunction(req,res,next)).catch(next)
    }
}