const mongoose = require('mongoose');


const hashtagSchema = mongoose.Schema({
  hashtag: String,
  tweet:[{ type: mongoose.Schema.Types.ObjectId, ref: 'tweets' }],
  comments:[{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }]
});

const Hashtag = mongoose.model('hashtags', hashtagSchema);

module.exports = Hashtag;