const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  message : String,
  date: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  hashtag: [String],
  likes : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  retweet : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
});

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;