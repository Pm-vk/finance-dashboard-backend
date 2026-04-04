const mongoose=require("mongoose")

const transactionSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Account is required"],
        index:true,
        immutable:true
    
    },
    amount:{
        type:Number,
        required:[true,"Amount is required"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"Transaction is required"],
        index:true,
        immutable:true
    },
    type: {
        type: String,
        enum:{
            values:["DEBIT","CREDIT"],
            message:"Type must be DEBIT or CREDIT"
        },
        required:[true,"Type is required"],
        immutable:true
    }
    
})
function preventTransctionModification(){
    throw new Error("Transaction cannot be modified")
}
transactionSchema.pre("findOneAndUpdate",preventTransctionModification)
transactionSchema.pre("updateOne",preventTransctionModification)
transactionSchema.pre("deleteOne",preventTransctionModification)
transactionSchema.pre("remove",preventTransctionModification)
transactionSchema.pre("deleteMany",preventTransctionModification)
transactionSchema.pre("updateMany",preventTransctionModification)
transactionSchema.pre("findOneAndDelete",preventTransctionModification)
transactionSchema.pre("findOneAndReplace",preventTransctionModification)



const transactionModel=mongoose.model("Transaction",transactionSchema)
module.exports=transactionModel
