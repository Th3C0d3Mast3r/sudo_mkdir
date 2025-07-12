import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { auth } from "./middleware.js";
import Question from "./models/questions.model.js";
import Answers from "./models/answers.model.js";
import Tags from "./models/tags.model.js";
import Notification from "./models/notification.model.js";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import fs from "fs";

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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ dest: "./uploads/" });

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

app.post("/upload", upload.single("media"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const resourceType = req.file.mimetype.startsWith("video")
      ? "video"
      : "image";

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType,
      folder: "uploads",
    });

    fs.unlinkSync(filePath); // delete local temp file
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
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
      .limit(limit);

    res.status(200).json({
      message: "Questions fetched successfully",
      questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/answers/:qid", async (req, res) => {
  try {
    const { qid } = req.params;
    const answers = await Answers.find({ question: qid }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Answers fetched successfully",
      answers,
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
      .limit(parseInt(limit));

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
    const { userId } = req;

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
      user: userId,
      title,
      description,
      tags: processedTags,
      photo: photo || null,
    });

    await newQuestion.save();

    // Create notifications for mentions
    await createMentionNotifications(
      newQuestion.description,
      userId,
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
    const { userId } = req;
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
      user: userId,
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
        sender: userId,
        question: qid,
        answer: newAnswer._id,
      });
      await questionOwnerNotification.save();
    }

    // Create notifications for mentions in the answer
    await createMentionNotifications(
      newAnswer.answer,
      userId,
      qid,
      newAnswer._id
    );

    res.status(201).json({
      message: "Answer created successfully",
      answer: {
        id: newAnswer._id,
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

app.post("/vote/:qid", auth, async (req, res) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
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

app.post("/vote/:aid", auth, async (req, res) => {
  try {
    const { userId } = req;
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

app.post("/auth/signup", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username and password" });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
