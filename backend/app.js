import express from "express";

const app = express();

app.use(express.json());

app.get("/me", (req, res) => {});

app.get("/questions", (req, res) => {});

app.get("/answers/:qid", (req, res) => {});

app.get("/tags", (req, res) => {});

app.get("/questions/:tag", (req, res) => {});

app.post("/question", (req, res) => {});

app.post("/answer/:qid", (req, res) => {});

app.post("/vote/:qid", (req, res) => {});

app.post("/vote/:aid", (req, res) => {});

app.post("/auth/signup", (req, res) => {});

app.post("/auth/login", (req, res) => {});

app.post("/auth/logout", (req, res) => {});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
