const mongoose=require("mongoose")

function connectToDB() {
    return mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("✅ MongoDB Connected Successfully");
        })
        .catch((error) => {
            console.error("❌ Error in DB connection:", error.message);
            process.exit(1);
        });
}


module.exports=connectToDB