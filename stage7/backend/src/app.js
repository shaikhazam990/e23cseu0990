const express = require("express");
const cors = require("cors");
const config = require("./config/config");

const requestLogger = require("./middlewares/logger.middleware");
const attachRequestMeta = require("./middlewares/request.middleware");
const errorHandler = require("./middlewares/error.middleware");

const notificationRoutes = require("./routes/notification.routes");
const priorityRoutes = require("./routes/priority.routes");

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
    methods: ["GET", "PATCH"],
  })
);

app.use(express.json());
app.use(requestLogger);
app.use(attachRequestMeta);

app.use("/api/notifications", notificationRoutes);
app.use("/api/priority", priorityRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
