const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const { name, email, admissionNumber, password, role } = req.body;
    
    // Check if user exists
    const emailExist = await User.findOne({ email });
    if (emailExist) return res.status(400).send("Email already exists");
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const userRole = role || "student";
    const user = new User({
      name,
      email,
      admissionNumber,
      password: hashedPassword,
      role: userRole
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
