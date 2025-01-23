const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    author : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    receive : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    content : String,
    date : String,
    read : Boolean
});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;