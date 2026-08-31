const dotenv = require("dotenv");
dotenv.config();

port = process.env.PORT;

const express = require("express");
const app = express();

app.use(express.json());

const corsMiddleware = require("./middleware/cors.middleware");
app.use(corsMiddleware);

const { connectDB } = require("./config/DB.config");
connectDB();

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/v1/user", require("./routes/user.route"));
app.use("/api/v1/auth", require("./routes/auth.route"));
app.use("/api/v1/patient", require("./routes/patient.route"));
app.use("/api/v1/appointment", require("./routes/appointment.route"));
app.use("/api/v1/visit", require("./routes/visit.route"));
app.use("/api/v1/invoice", require("./routes/invoice.route"));

const errorHandler = require("./middleware/errorHandler.middleware");
const AppError = require("./utilite/appError.utilite");

app.use((req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

if (process.env.ENVIROMENT !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
