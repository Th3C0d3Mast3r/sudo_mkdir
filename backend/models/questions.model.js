import mongoose from "mongoose";

const questionSchema= new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    Title:{
        type: String,
        require: true,
    },
    description:{
        type: Blob,
        require: true,
    },
    Photo:{
        type: String
    },
    NumberOfAnswer:{
        type: Number,
        default: 0
    },
    upvotes:{
        type: Number,
        default: 0
    },
    downvotes:{
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        require: true
    },
    correctAnsId:{
        type: mongoose.Schema.ObjectId.Types,
        ref: "Answers"
    }
})

const Questions= mongoose.model("Questions", questionSchema);

export default Questions;