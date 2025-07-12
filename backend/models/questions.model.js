import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tags",
    },
  ],
  photo: {
    type: String,
  },
  numberOfAnswer: {
    type: Number,
    default: 0,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  correctAnsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Answers",
  },
});

const Questions = mongoose.model("Questions", questionSchema);

export default Questions;
