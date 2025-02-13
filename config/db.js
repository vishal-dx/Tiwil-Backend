const mongoose = require("mongoose")

const connectDb = async() => {
    try{
        await (mongoose.connect(process.env.MONGO_URI))
        console.log("Database connection successfull")
    }catch(error){
        console.log("Database connection Unsuccessfull")
        console.log(error)
    }
}

module.exports = connectDb