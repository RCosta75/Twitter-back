require('dotenv').config();
require('./models/connection');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tweetsRouter = require('./routes/tweets');
var hashtagsRouter = require('./routes/hashtags');
var messagesRouter = require('./routes/messages');

var app = express();
app.use(cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/messages', messagesRouter);
app.use('/users', usersRouter);
app.use('/tweets', tweetsRouter);
app.use('/hashtags', hashtagsRouter);

module.exports = app;
