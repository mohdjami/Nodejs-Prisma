const express = require("express");
const authRouter = require("./routes/authRouter");
const app = express();
//Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

const port = 3000;

app.use("/api/auth", authRouter);

module.exports = app;
