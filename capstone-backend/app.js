"use strict";
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const user = require("./routes/user.js");
const matching = require("./routes/matching.js");
const index = require("./routes/index.js");
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(morgan("tiny"));

const cors = require("cors");
app.use(cors());

app.use("/", index);
app.use("/user", user);
app.use("/matches", matching);

module.exports = app;
