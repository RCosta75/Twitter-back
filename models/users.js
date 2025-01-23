const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstname: String,
  username: String,
  password: String,
  token: String,
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tweets' } || { type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
  retweets : [{ type: mongoose.Schema.Types.ObjectId, ref: 'tweets' } || { type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
  liked : [{ type: mongoose.Schema.Types.ObjectId, ref: 'tweets' } || { type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
  profil : String,
  following : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  followers : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  tweets : [{ type: mongoose.Schema.Types.ObjectId, ref: 'tweets' }],
  comment : [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
  bio : String,
  dm : [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}]
});

const User = mongoose.model('users', userSchema);

module.exports = User;