const express = require("express");
const app = express();
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");

require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Database connection established successfully!");
  });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    cookie: { maxAge: 60000 },
    secret: "woot",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

// API endpoints
const studentsApi = require("./routes/students");
const { exists } = require("./models/Student");

app.get("/", (req, res) => res.redirect("/v1"));
app.get("/v1/", (req, res) => res.send("Welcome to Unlock API (v1)."));
app.use("/v1/students/", studentsApi);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res
    .status(404)
    .json({ success: false, error: `No route found for ${req.url}` });
});

// error handler
app.use(function (err, req, res, next) {
  // response and log errors
  console.log(err);
  res.status(err.status || 500);
  res.json({ success: false, error: "Somthing is wrong!" });
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "production";
app
  .listen(PORT, () =>
    console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode ...`)
  )
  .on("error", function (e) {
    const message =
      e.code == "EADDRINUSE"
        ? `port ${e.port} is already in use!`
        : `Server closed unexpected!`;
    console.log(message);
    throw message;
  });

// Handle UnhandeledExceptions
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
});
module.exports = app;
