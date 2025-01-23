var express = require("express");
var router = express.Router();

const Hashtag = require("../models/hashtag");


// route get 1  #
router.get("/get/:hashtag", (req, res) => {
  Hashtag.findOne({hashtag : req.params.hashtag})
    .populate({
      path:"tweet",
      populate : {
        path : 'author',
        model: 'users'
      }
    })
    .populate({
      path:"tweet",
      populate : {
        path : 'likes',
        model: 'users'
      }
    })
    .populate({
      path:"tweet",
      populate : {
        path : 'retweet',
        model: 'users'
      }
    })
    .populate({
      path:"comments",
      populate : {
        path : 'retweet',
        model: 'users'
      }
    })
    .populate({
      path:"comments",
      populate : {
        path : 'likes',
        model: 'users'
      }
    })
    .populate({
      path:"comments",
      populate : {
        path : 'author',
        model: 'users'
      }
    })
    .then((data) => {
      data?.comments.sort(((a, b) => b.date - a.date))
      data?.tweet.sort((a, b) => b.date - a.date)
      res.json({ result: true, hashtag : data });
    });
});

// route display all #
router.get("/display", (req, res) => {
  Hashtag.find()
    .populate("tweet")
    .populate("comments")
    .then((data) => {
      res.json({ result: true, hashtag: data });
    });
});


module.exports = router;
