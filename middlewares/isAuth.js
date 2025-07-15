import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// التأكد من تسجيل الدخول
const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ message: "Please Login" });
    }

    const token = authHeader.split(" ")[1]; // remove "Bearer "

    const decodedData = jwt.verify(token, process.env.Jwt_Sec);
    req.user = await User.findById(decodedData._id);

    if (!req.user) {
      return res.status(403).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Login First", error: error.message });
  }
};


// التأكد من أن المستخدم أدمن
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins are allowed" });
  }
  next();
};

// يمكن استخدام isAdmin كـ authorizeAdmin
const authorizeAdmin = isAdmin;

// ✅ التصدير النهائي
export {
  isAuth as isAuthenticated,
  isAdmin,
  authorizeAdmin,
};
