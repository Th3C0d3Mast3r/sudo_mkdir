import mongoose from "mongoose"

const userSchema= new mongoose.Schema({
    username:{
        type: String,
        require: true,
        unique: true
    },
    password:{
        type: "String",
        require: true,
    },
    photo: {
        type: "String",
    },
    email: {
        type: "String",
        require: true,
        uninque: true
    }
})

const User= mongoose.model("User", userSchema);

export default User;