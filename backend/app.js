import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import { auth } from "./middleware.js";
import Question from "./models/questions.model.js";
import Answers from "./models/answers.model.js";
import Tags from "./models/tags.model.js";
import Notification from "./models/notification.model.js";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";

dotenv.config();

const app = express();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

connectDB();

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.path);
  next();
});
app.use(clerkMiddleware());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ dest: "uploads/" });

// Helper function to extract mentions from text
const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

// Helper function to create notifications for mentions
const createMentionNotifications = async (
  content,
  senderId,
  questionId = null,
  answerId = null
) => {
  const mentions = extractMentions(content);

  for (const username of mentions) {
    try {
      const mentionedUser = await User.findOne({ username });
      if (
        mentionedUser &&
        mentionedUser._id.toString() !== senderId.toString()
      ) {
        const notification = new Notification({
          user: mentionedUser._id,
          type: "mention",
          content: `You were mentioned in a ${
            questionId ? "question" : "answer"
          }`,
          sender: senderId,
          question: questionId,
          answer: answerId,
        });
        await notification.save();
      }
    } catch (error) {
      console.error(
        `Error creating mention notification for ${username}:`,
        error
      );
    }
  }
};

app.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const filePath = req.file.path;
    // Always use 'image' as resource_type
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: "uploads",
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/me", auth, async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("notifications", auth, async (req, res) => {
  try {
    const { userId } = req;
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      message: "Notifications fetched successfully",
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/questions", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "user",
        select: "username photo email",
      })
      .populate({
        path: "tags",
        select: "name",
      });

    const total = await Question.countDocuments();

    res.status(200).json({
      message: "Questions fetched successfully",
      questions,
      total,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/answers/:qid", async (req, res) => {
  try {
    const { qid } = req.params;
    const question = await Question.findById(qid)
      .populate("user", "username photo email")
      .populate("tags", "name");
    const answers = await Answers.find({ question: qid })
      .sort({
        createdAt: -1,
      })
      .populate("user", "username photo email");

    res.status(200).json({
      message: "Answers fetched successfully",
      answers,
      question,
    });
  } catch (error) {
    console.error("Error fetching answers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/tags", async (req, res) => {
  try {
    const tags = await Tags.find();
    res.status(200).json({
      message: "Tags fetched successfully",
      tags,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/questions/:search", async (req, res) => {
  try {
    const { search } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Create a case-insensitive regex pattern for partial matching
    const searchRegex = new RegExp(search, "i");

    // First, find tags that match the search
    const matchingTags = await Tags.find({ name: { $regex: searchRegex } });
    const matchingTagIds = matchingTags.map((tag) => tag._id);

    // Search in title, description, and tags
    const questions = await Question.find({
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $in: matchingTagIds } },
      ],
    })
      .populate("tags", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("user", "username photo email")
      .populate("tags", "name");
    res.status(200).json({
      message: "Search results fetched successfully",
      questions,
      searchQuery: search,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/question", auth, async (req, res) => {
  try {
    const { title, description, tags, photo } = req.body;
    // Use Clerk userId from middleware
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses[0].emailAddress;

    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    // Process tags - create new tags if they don't exist
    const processedTags = [];
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        try {
          // Check if tag already exists
          let tag = await Tags.findOne({ name: tagName.toLowerCase() });

          // If tag doesn't exist, create it
          if (!tag) {
            tag = new Tags({
              name: tagName.toLowerCase(),
            });
            await tag.save();
          }

          processedTags.push(tag._id);
        } catch (error) {
          console.error(`Error processing tag ${tagName}:`, error);
        }
      }
    }

    // Create new question
    const newQuestion = new Question({
      user: userExists._id,
      title,
      description,
      tags: processedTags,
      photo: photo || null,
    });

    await newQuestion.save();

    // Create notifications for mentions
    await createMentionNotifications(
      newQuestion.description,
      userExists._id,
      newQuestion._id
    );

    res.status(201).json({
      message: "Question created successfully",
      question: {
        id: newQuestion._id,
        title: newQuestion.title,
        description: newQuestion.description,
        tags: newQuestion.tags,
        photo: newQuestion.photo,
        numberOfAnswers: newQuestion.numberOfAnswers,
        upvotes: newQuestion.upvotes,
        downvotes: newQuestion.downvotes,
        createdAt: newQuestion.createdAt,
      },
    });
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/answer/:qid", auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses[0].emailAddress;
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }
    const { qid } = req.params;
    const { answer, photo } = req.body;

    // Validate required fields
    if (!answer) {
      return res.status(400).json({
        message: "Answer content is required",
      });
    }

    // Check if question exists
    const question = await Question.findById(qid);
    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    // Create new answer
    const newAnswer = new Answers({
      user: userExists._id,
      question: qid,
      answer,
      photo: photo || null,
    });

    await newAnswer.save();

    // Update question's answer count
    await Question.findByIdAndUpdate(qid, {
      $inc: { numberOfAnswer: 1 },
    });

    // Create notification for question owner
    if (question.user.toString() !== userId.toString()) {
      const questionOwnerNotification = new Notification({
        user: question.user,
        type: "answer",
        content: `Someone answered your question: "${question.title}"`,
        sender: userExists._id,
        question: qid,
        answer: newAnswer._id,
      });
      await questionOwnerNotification.save();
    }

    // Create notifications for mentions in the answer
    await createMentionNotifications(
      newAnswer.answer,
      userExists._id,
      qid,
      newAnswer._id
    );

    res.status(201).json({
      message: "Answer created successfully",
      answer: {
        _id: newAnswer._id,
        answer: newAnswer.answer,
        photo: newAnswer.photo,
        upvotes: newAnswer.upvotes,
        downvotes: newAnswer.downvotes,
        createdAt: newAnswer.createdAt,
        user: userId,
      },
    });
  } catch (error) {
    console.error("Create answer error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/vote/ques/:qid", auth, async (req, res) => {
  try {
    const { qid } = req.params;
    const { vote } = req.body;

    if (vote === "upvote") {
      const updatedQuestion = await Question.findByIdAndUpdate(
        qid,
        { $inc: { upvotes: 1 } },
        { new: true }
      );
      res.status(200).json({
        message: "Upvote successful",
        upvotes: updatedQuestion.upvotes,
      });
    } else if (vote === "downvote") {
      const updatedQuestion = await Question.findByIdAndUpdate(
        qid,
        { $inc: { downvotes: 1 } },
        { new: true }
      );
      res.status(200).json({
        message: "Downvote successful",
        downvotes: updatedQuestion.downvotes,
      });
    } else {
      res.status(400).json({ message: "Invalid vote type" });
    }
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/vote/ans/:aid", auth, async (req, res) => {
  try {
    const { aid } = req.params;
    const { vote } = req.body;

    if (vote === "upvote") {
      const updatedAnswer = await Answers.findByIdAndUpdate(
        aid,
        { $inc: { upvotes: 1 } },
        { new: true }
      );
      res.status(200).json({
        message: "Upvote successful",
        upvotes: updatedAnswer.upvotes,
      });
    } else if (vote === "downvote") {
      const updatedAnswer = await Answers.findByIdAndUpdate(
        aid,
        { $inc: { downvotes: 1 } },
        { new: true }
      );
      res.status(200).json({
        message: "Downvote successful",
        downvotes: updatedAnswer.downvotes,
      });
    } else {
      res.status(400).json({ message: "Invalid vote type" });
    }
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const utils = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const generateRandomString = (length) => {
  let result = "";
  for (let i = length; i > 0; --i)
    result += utils[Math.floor(Math.random() * utils.length)];
  return result;
};
app.get("/clerk-sync", auth, async (req, res) => {
  try {
    console.log("hello");
    const { userId } = getAuth(req);
    const clerkUser = await clerkClient.users.getUser(userId);
    const { emailAddresses, fullName, imageUrl } = clerkUser;
    // Upsert user in DB
    const email = emailAddresses[0].emailAddress;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username:
          fullName.split(" ").join("").toLowerCase() + generateRandomString(5),
        email,
        photo: imageUrl,
        password: "", // Not needed for Clerk users
      });
      await user.save();
    } else {
      user.photo = imageUrl;
      user.username =
        fullName.split(" ").join("").toLowerCase() +
        "-" +
        generateRandomString(5);
      await user.save();
    }
    res.status(200).json({ message: "User synced", user });
  } catch (error) {
    console.error("Clerk sync error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
