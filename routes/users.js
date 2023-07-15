const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let User = require('../models/user.model');

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});
router.route('/search').get((req, res) => {
  const searchTerm = req.query.term;// Retrieve the search term from the query parameters
  // Use a regular expression to perform a case-insensitive search for users with a username matching the search term
  User.find({ username: { $regex: searchTerm, $options: 'i' } })
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});
router.route('/add').post(async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isLoggedIn: true,
    });
    
    await newUser.save();

    res.json('User added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.route('/login').post(async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json('Invalid username or password');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json('Invalid username or password');
    }
    user.isLoggedIn = true;
    await user.save();
    // Generate JWT token for authentication
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);

    res.header('auth-token', token).json('Logged in!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.route('/logout').post(async (req, res) => {
  const username = req.body.username;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json('User not found');
    }

    user.isLoggedIn = false;
    await user.save();

    res.json('Logged out!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
