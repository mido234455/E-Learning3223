import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail, { sendForgotMail } from "../middlewares/sendMail.js";
import TryCatch from "../middlewares/TryCatch.js";

// ✅ تسجيل مستخدم جديد
export const register = TryCatch(async (req, res) => {
  const { email, name, password } = req.body;

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ _id: newUser._id }, process.env.Jwt_Sec, {
    expiresIn: "15d",
  });

  return res.status(201).json({
    message: "Account created successfully",
    token,
    user: newUser,
  });
});


// ✅ تفعيل المستخدم باستخدام OTP
export const verifyUser = TryCatch(async (req, res) => {
  const { otp, activationToken } = req.body;

  let verify;
  try {
    verify = jwt.verify(activationToken, process.env.Activation_Secret);
  } catch (error) {
    return res.status(400).json({ message: "OTP expired or invalid token" });
  }

  if (parseInt(verify.otp) !== parseInt(otp)) {
    return res.status(400).json({ message: "Wrong OTP" });
  }

  const { name, email, password } = verify.user;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password });

  // تسجيل دخول مباشر بعد التفعيل (اختياري)
  const token = jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
    expiresIn: "15d",
  });

  return res.json({
    message: "User registered successfully",
    token,
    user,
  });
});

// ✅ تسجيل الدخول
export const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "No user with this email" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

  const token = jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
    expiresIn: "15d",
  });

  return res.json({
    message: `Welcome back ${user.name}`,
    token,
    user,
  });
});

// ✅ بيانات المستخدم المسجل
export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  return res.json({ user });
});

// ✅ طلب استرجاع كلمة السر
export const forgotPassword = TryCatch(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "No user with this email" });

  const token = jwt.sign({ email }, process.env.Forgot_Secret, {
    expiresIn: "5m",
  });

  const data = { email, token };
  await sendForgotMail("E-learning Password Reset", data);

  user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
  await user.save();

  return res.json({
    message: "Reset password link sent to your email",
  });
});

// ✅ تنفيذ إعادة تعيين كلمة السر
export const resetPassword = TryCatch(async (req, res) => {
  const decoded = jwt.verify(req.query.token, process.env.Forgot_Secret);

  const user = await User.findOne({ email: decoded.email });
  if (!user)
    return res.status(404).json({ message: "No user with this email" });

  if (!user.resetPasswordExpire || user.resetPasswordExpire < Date.now())
    return res.status(400).json({ message: "Token expired" });

  const newPassword = await bcrypt.hash(req.body.password, 10);
  user.password = newPassword;
  user.resetPasswordExpire = null;

  await user.save();

  return res.json({ message: "Password reset successful" });
});
