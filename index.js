import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./database/db.js";

// استدعاء ملفات الراوتات
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import examRoutes from "./routes/examRoutes.js";
import studentProgressRoutes from "./routes/progress.js";
 // ✅ مهم جدًا


dotenv.config();

const app = express();

// 📦 إعدادات عامة
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // عدلها حسب بيئة التشغيل
  credentials: true
}));

// 🖼️ عرض ملفات الرفع
app.use("/uploads", express.static("uploads"));

// ✅ راوت اختبار سريع للتأكد من تشغيل السيرفر
app.get("/", (req, res) => {
  res.send("✅ Server is working");
});

// 📦 تسجيل الراوتات
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/progress", studentProgressRoutes);



// ✅ تشغيل السيرفر
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  connectDb();
});
