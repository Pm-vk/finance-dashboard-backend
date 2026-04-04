const mongoose =require("mongoose")
const bcrypt =require("bcryptjs")


const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required"],
        trim:true,
        lowercase:true,
        match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/,"Invalid Email Adress"],
        unique:[true,"Email already in use"]

        
        
    },
    name:{
        type:String,
        required:[true,"Name is required"],
        
    },
    password:{
        type:String,
        required:[true,"Password is required for creating an user"],
        minlegth:[6,"Password must be at least 6 characters long"],
        select:false
    },
    balance:{
        type:Number,
        default:0,
        min:[0,"Balance cannot be negative"]
    },
    role: {
        type: String,
        enum: ["Admin", "Analyst", "Viewer"],
        default: "Viewer"
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
},{
    timestamps:true
})
userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return
    }
    const hash=await bcrypt.hash(this.password,10)
    this.password=hash
    return

})
userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password)
}
const userModel=mongoose.model("User",userSchema)
module.exports=userModel

