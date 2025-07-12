import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { auth } from "./middleware.js";
import Question from "./models/question.model.js";
import Answers from "./models/answers.model.js";
import Tags from "./models/tags.model.js";

dotenv.config();

const app = express();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URL, () => {
    console.log("Connected to MongoDB");
  });
};

connectDB();

app.use(express.json());

app.get("/me", auth, async (req, res) => {
  const { userId } = req;

  await User.findById(userId, (err, user) => {
    if (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.status(200).json({
        message: "User fetched successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    }
  });
});

app.get("/questions", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  await Question.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec((err, questions) => {
      if (err) {
        console.error("Error fetching questions:", err);
        res.status(500).json({ message: "Internal server error" });
      } else {
        res.status(200).json({
          message: "Questions fetched successfully",
          questions,
        });
      }
    });
});

app.get("/answers/:qid", async (req, res) => {
  const { qid } = req.params;
  await Answers.find({ qid })
    .sort({ createdAt: -1 })
    .exec((err, answers) => {
      if (err) {
        console.error("Error fetching answers:", err);
        res.status(500).json({ message: "Internal server error" });
      } else {
        res.status(200).json({
          message: "Answers fetched successfully",
          answers,
        });
      }
    });
});

app.get("/tags", async (req, res) => {
  await Tags.find().exec((err, tags) => {
    if (err) {
      console.error("Error fetching tags:", err);
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.status(200).json({
        message: "Tags fetched successfully",
        tags,
      });
    }
  });
});

app.get("/questions/:tag", (req, res) => {});

app.post("/question", auth, (req, res) => {});

app.post("/answer/:qid", auth, (req, res) => {});

app.post("/vote/:qid", auth, (req, res) => {});

app.post("/vote/:aid", auth, (req, res) => {});

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
