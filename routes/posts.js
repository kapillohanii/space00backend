const router = require('express').Router();
const moment = require('moment-timezone');
let Post = require('../models/post.model');

router.route('/').get((req, res) => {
  Post.find()
    .sort({ createdAt: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const username = req.body.username;
  const title = req.body.title;
  const content = req.body.content;
  const date = moment.tz(req.body.date, 'Asia/Kolkata').format('MMMM Do YYYY, h:mm a');

  const newPost = new Post({
    username,
    title,
    content,
    date,
  });
  newPost.save()
    .then(() => res.json('Post published!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:postId').get((req, res) => {
  const postId = req.params.postId;
  Post.find({_id:postId})
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json('Error: ' + err));
});
router.route('/:postId').delete(async (req, res) => {
  try {
    const postId = req.params.postId;
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json('Post not found');
    }
    return res.json('Post deleted successfully');
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json('Error deleting post');
  }
});

router.route('/profile/:username').get((req, res) => {
  const username = req.params.username;
  Post.find({ username: username })
    .sort({ createdAt: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
