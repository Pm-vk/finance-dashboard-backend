const mongoose=require("mongoose")

const accountSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true,"Account must be associated with a user"],
        index:true
        
    },
    status:{
        type:String,
        enum:{
            values:["active","frozen","closed"],
            message:"Status must be active or frozen or closed",
            
        },
        default:"active"
    },
    currency:{
        type:String,
        required:[true,"Currency is required"],
        default:"INR"
    },
    balance:{
        type:Number,
        default:0,
        min:[0,"Balance cannot be negative"]
    },
},{
    timestamps:true
})

accountSchema.index({user:1,status:1})


const accountModel=mongoose.model("Account",accountSchema)

module.exports=accountModel
