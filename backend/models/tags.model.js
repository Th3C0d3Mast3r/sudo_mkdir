import mongoose from "mongoose";

const tagsSchema= new mongoose.model({
    name:
    {
        type:String,
        require: true,
        unique: true
    }
})

const Tags=new mongoose.model("Tags", tagsSchema);

export default Tags;