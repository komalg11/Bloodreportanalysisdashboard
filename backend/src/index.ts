import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import reportRoutes from "./routes/report.routes";

import { errorHandler } from "./middleware/error.middleware";

dotenv.config({ override: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("Blood Report Analysis API is running...");
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

setInterval(() => {
  console.log("Process is alive.");
}, 5000);
