const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  message : String,
  date: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  hashtag: [String],
  likes : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  retweet : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  replyTo : { type: mongoose.Schema.Types.ObjectId, ref: 'tweets' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comments' }],
});

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;