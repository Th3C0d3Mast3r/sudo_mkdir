import mongoose, { mongo } from "mongoose";

const AnsSchema= mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
    },
    Photo:{
        type: String,
    },
    question:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Questions",
        require: true
    },
    answer:{
        type: Blob,
        require: true
    },
    upvotes:
    {
        type: Number,
        default: 0
    },
    downvotes:
    {
        type: Number,
        default: 0
    }
})

const Answers= new mongoose.model("Answers", AnsSchema);

export default Answers;