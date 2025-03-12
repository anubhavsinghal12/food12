import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';

// Define the admin credentials (email is used for authorization)
const ADMIN_EMAIL = 'singhalatul849@gmail.com';

// Create JWT token with an optional isAdmin flag
const createToken = (id, isAdmin = false) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET);
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    // Check if the logged in user is admin based on the email
    const isAdmin = (user.email === ADMIN_EMAIL);
    const token = createToken(user._id, isAdmin);

    // Set token in HTTP-only cookie for security
    res.cookie('token', token, { httpOnly: true });

    // If admin, include redirect URL in the response
    if (isAdmin) {
      return res.json({ success: true, token, redirect: '/admin' });
    } else {
      return res.json({ success: true, token });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: 'Error' });
  }
};

// Register user
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: 'User already exists' });
    }

    // Validate email format and password strength
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: 'Please enter a strong password' });
    }

    // Hash the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new user
    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword
    });
    const user = await newUser.save();

    // Create token (admin flag will be set during login, if applicable)
    const token = createToken(user._id);
    res.cookie('token', token, { httpOnly: true });
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: 'Error' });
  }
};

export { loginUser, registerUser };
