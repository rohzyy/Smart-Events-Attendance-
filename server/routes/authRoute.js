const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    const emailExist = await User.findOne({ email });
    if (emailExist) return res.status(400).send("Email already registered");
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await Otp.findOneAndDelete({ email });
    const newOtp = new Otp({ email, otp });
    await newOtp.save();
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Smart Events Attendance" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'University Registration OTP',
      text: `Your OTP for University email verification is: ${otp}. This code is valid for 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send("OTP sent to your email! Please check your inbox (and spam).");
    
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, admissionNumber, password, role, course, yearOfStudy, cgpa, phone, otp } = req.body;
    
    // Check if user exists
    const emailExist = await User.findOne({ email });
    if (emailExist) return res.status(400).send("Email already exists");
    
    const userRole = role || "student";

    if (userRole === "student") {
      if (!otp) return res.status(400).send("OTP is required to verify student email.");
      
      const validOtp = await Otp.findOne({ email, otp });
      if (!validOtp) return res.status(400).send("Invalid or expired OTP code.");
      
      await Otp.findOneAndDelete({ email });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      name,
      email,
      admissionNumber,
      password: hashedPassword,
      role: userRole,
      course,
      yearOfStudy,
      cgpa,
      phone,
      isEmailVerified: userRole === "student" ? true : false
    });
    
    const savedUser = await user.save();
    res.status(201).send({ user: savedUser._id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, admissionNumber, password } = req.body;
    
    // Can login with either email or admissionNumber
    const query = email ? { email } : { admissionNumber };
    if (!query.email && !query.admissionNumber) {
        return res.status(400).send("Provide email or admission number to login");
    }

    const user = await User.findOne(query);
    if (!user) return res.status(400).send("User not found");
    
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).send("Invalid password");
    
    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name, admissionNumber: user.admissionNumber },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).send({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
