var express = require("express");
var router = express.Router();

const Tweet = require("../models/tweet");
const Comment = require("../models/comment");
const User = require("../models/users");
const Hashtag = require("../models/hashtag");

//  route post (bonne route)
router.post("/post/:token", (req, res) => {
  if (!req.body.message) {
    return res.json({ result: false, error: "Missing fields" });
  }
  const rp = /#(\w+)/g;
  const hash = req.body.message.match(rp);
  // REGEX mots apres #
  User.findOne({ token: req.params.token }).then((data) => {
    const newTweet = new Tweet({
      message: req.body.message,
      date: req.body.date,
      author: data,
      hashtag: hash,
      likes: [],
    });
    console.log(newTweet)
    newTweet.save().then((tweet) => {
      // si il ya a un hashtag
      User.updateOne(
        { token: req.params.token },
        { $push: { tweets: tweet._id } }
      ).then(() => {
        if (rp.test(tweet.message)) {
          let allhashtag = tweet.message.match(rp);
          for (let e of allhashtag) {
            // bonne boucle au bon endroit ?
            Hashtag.findOne({ hashtag: e }).then((data) => {
              if (data) {
                // cherche dans hashtag si  #
                Hashtag.updateOne(
                  { hashtag: e },
                  { $push: { tweet: tweet._id } }
                ).then();
              } else {
                // crée nouveau #
                const newHashtag = new Hashtag({
                  hashtag: e,
                  tweet: tweet,
                });
                newHashtag.save();
              }
            });
          }
          res.json({ result: true, infos: "Tweet with # saved" });
        } else {
          res.json({ result: true, infos: "Hashtags saved" });
        }
      });
    });
  });
});

// route poster commentaire, meme principe que tweet 
router.post("/comment", (req, res) => {
  if (!req.body.message) {
    return res.json({ result: false, error: "Missing fields" });
  }
  const rp = /#(\w+)/g;
  const hash = req.body.message.match(rp);
  // REGEX mots apres #
  User.findOne({ _id: req.body.idUser })
  .then(() => {
    const newComment = new Comment({
      message: req.body.message,
      date: new Date().toISOString(),
      author: req.body.idUser,
      hashtag: hash,
    });
    newComment.save().then((comment) => {
      // si il ya a un hashtag
      User.updateOne(
        { _id: req.body.idUser },
        { $push: { comment: comment._id } }
      ).then(() => {
        if(req.body.idTweet){
          Tweet.updateOne(
            { _id: req.body.idTweet },
            { $push: { comments: comment._id } }
          ).then(() => {
            Comment.updateOne({ _id: comment._id },
              { $push: { replyTo: req.body.idTweet }})
              .then(() => {
                if (rp.test(comment.message)) {
                  let allhashtag = comment.message.match(rp);
                  for (let e of allhashtag) {
                    // bonne boucle au bon endroit ?
                    Hashtag.findOne({ hashtag: e }).then((data) => {
                      if (data) {
                        // cherche dans hashtag si  #
                        Hashtag.updateOne(
                          { hashtag: e },
                          { $push: { comments: comment._id } }
                        ).then()
                      } else {
                        // crée nouveau #
                        const newHashtag = new Hashtag({
                          hashtag: e,
                          comments: comment._id,
                        });
                        newHashtag.save();
                      }
                    });
                  }
                  res.json({ result: true, infos: "Reply with # saved" });
                } else {
                  res.json({ result: true, infos: "Reply saved" });
                }
              })
          });
        } else if (req.body.idComment){
          Comment.updateOne(
            { _id: req.body.idComment },
            { $push: { comments: comment._id } }
          ).then(() => {
            Comment.updateOne({ _id: comment._id },
              { $push: { replyTo: req.body.idComment }})
              .then(() => {
                if (rp.test(comment.message)) {
                  let allhashtag = comment.message.match(rp);
                  for (let e of allhashtag) {
                    // bonne boucle au bon endroit ?
                    Hashtag.findOne({ hashtag: e }).then((data) => {
                      if (data) {
                        // cherche dans hashtag si  #
                        Hashtag.updateOne(
                          { hashtag: e },
                          { $push: { comments: comment._id } }
                        ).then()
                      } else {
                        // crée nouveau #
                        const newHashtag = new Hashtag({
                          hashtag: e,
                          tweet: comment._id,
                        });
                        newHashtag.save();
                      }
                    });
                  }
                  res.json({ result: true, infos: "Reply with # saved" });
                } else {
                  res.json({ result: true, infos: "Reply saved" });
                }
              })
          });
        } else {
          res.json({result : false , infos : "Missing fields"})
        }
      });
    });
  });
});

// cherche tout les tweets qui contiennent req.params.tweet
router.get("/get/:tweet", (req, res) => {
  const searchTerm = req.params.tweet;
  const rp = new RegExp(searchTerm, "i");
  Tweet.find({ message: { $regex: rp } })
    .populate("author")
    .populate("likes")
    .populate("retweet")
    .then((data) => {
      res.json({ result: true, data });
    });
});

// Messages listing affiche auteur et tweet (gerer date)
router.get("/get", (req, res) => {
  Tweet.find()
    .populate("author")
    .populate("likes")
    .populate("retweet")
    .populate({
      path: 'comments',
      populate: {
        path: 'author', // Populate le champ 'author' dans le modèle 'liked'
        model: 'users', // Précise le modèle pour éviter des erreurs
      },
    })
    .sort({ date: -1 })
    .then((data) => {
      res.json({ result: true, data });
    });
});

router.get("/getone/:idTweet", (req, res) => {
  Tweet.findById(req.params.idTweet)
    .populate("author")
    .populate("likes")
    .populate("retweet")
    .populate({
      path: 'comments',
      populate: {
        path: 'author', // Populate le champ 'author' dans le modèle 'liked'
        model: 'users', // Précise le modèle pour éviter des erreurs
      },
    })
    .populate({
      path: 'comments',
      populate: {
        path: 'comments', // Populate le champ 'author' dans le modèle 'liked'
        model: 'comment', // Précise le modèle pour éviter des erreurs
      },
    })
    .populate({
      path: 'comments',
      populate: {
        path: 'likes', // Populate le champ 'author' dans le modèle 'liked'
        model: 'users', // Précise le modèle pour éviter des erreurs
      },
    })
    .populate({
      path: 'comments',
      populate: {
        path: 'retweet', // Populate le champ 'author' dans le modèle 'liked'
        model: 'users', // Précise le modèle pour éviter des erreurs
      },
    })
    .then((data) => {
      res.json({ result: true, data });
    });
});

// ROUTE delete cherche tweet et le supp par son ID + hashtag.tweet[id]
router.delete("/deleter", (req, res) => {
  // INCROYABLE cherche et supp
  if(req.body.idTweet){
    Tweet.findByIdAndDelete(req.body.idTweet).then((data) => {
      if (!data) {
        return res.json({ result: false, error: "Tweet not found" });
      }
      User.updateOne(
        { _id: data.author._id },
        { $pull: { tweets: req.body.idTweet } }
      ).then(() => {
        // supp le retweet dans user.retweet
        User.updateMany(
          { retweets: req.body.idTweet},
          { $pull: { retweets: req.body.idTweet}}
        ).then(() => {
          User.updateMany({ liked: req.body.idTweet }, { $pull: { liked: req.body.idTweet } })
            .then(() => {
              User.updateMany(
                { bookmarks: req.body.idTweet },
                { $pull: { bookmarks: req.body.idTweet } }
              ).then(() => {
                // si supp
                // cherche # et retire clé etrangere tweet
                Hashtag.updateMany(
                  { tweet: req.body.idTweet },
                  { $pull: { tweet: req.body.idTweet } }
                ).then(()=> {
                  Comment.updateMany(
                  { replyTo: req.body.idTweet },
                  { $pull: { replyTo: req.body.idTweet } }
                  )
                })
                  .then(() => {
                    res.json({
                      result: true,
                      message: "Tweet and associated hashtags updated",
                    });
                  })
                  .catch((err) =>
                    res.json({ result: false, error: err.message })
                  );
              });
            })
            .catch((err) => res.json({ result: false, error: err.message }));
        });
      });
    });
  } else {
    Comment.findByIdAndDelete(req.body.idComment).then((data) => {
      if (!data) {
        return res.json({ result: false, error: "Tweet not found" });
      }
      User.updateOne(
        { _id: data.author._id },
        { $pull: { comment: req.body.idComment } }
      ).then(() => {
        // supp le retweet dans user.retweet
        User.updateMany(
          { retweets: req.body.idComment},
          { $pull: { retweets: req.body.idComment}}
        ).then(() => {
          User.updateMany({ liked: req.body.idComment }, { $pull: { liked: req.body.idComment } })
            .then(() => {
              User.updateMany(
                { bookmarks: req.body.idComment },
                { $pull: { bookmarks: req.body.idComment } }
              ).then(() => {
                // si supp
                // cherche # et retire clé etrangere tweet
                Hashtag.updateMany(
                  { comments: req.body.idComment },
                  { $pull: { comments: req.body.idComment } }
                ).then(() => {
                  Tweet.updateOne(
                    { comments: req.body.idComment }, 
                    { $pull: { comments: req.body.idComment } } 
                  ).then(() => {
                  res.json({
                    result: true,
                    message: "Comment and associated hashtags updated",
                  });
                })
                .catch((err) =>
                    res.json({ result: false, error: err.message })
                  );
              });
            })
            .catch((err) => res.json({ result: false, error: err.message }));
        });
      });
    });
  } 
)}});

// route like verifie si [likes] dans Tweet et retire/ajoute ARREVOIR A LAIDE
router.put("/update", (req, res) => {
if(req.body.idTweet){
  Tweet.findOne({ _id: req.body.idTweet }).then((data) => {
    // si user.token dans [retweet] le retire
    if (data.likes.includes(req.body.idUser)) {
      Tweet.updateOne(
        { _id: req.body.idTweet },
        { $pull: { likes: req.body.idUser } }
      ).then(() => {
        User.updateOne(
          { _id: req.body.idUser },
          { $pull: { liked: req.body.idTweet } }
        ).then(() => {
          res.json({ result: true, msg: "retweet supp" });
        });
      });
    } else {
      // si user.token pas dans [retweet] l'ajoute
      Tweet.updateOne(
        { _id: req.body.idTweet },
        { $push: { likes: req.body.idUser } }
      ).then(() => {
        User.updateOne(
          { _id: req.body.idUser },
          { $push: { liked: req.body.idTweet } }
        ).then(() => {
          res.json({ result: true, msg: "retweet added" });
        });
      });
    }
  });
} else {
  Comment.findOne({ _id: req.body.idComment }).then((data) => {
    // si user.token dans [retweet] le retire
    if (data.likes.includes(req.body.idUser)) {
      Comment.updateOne(
        { _id: req.body.idComment },
        { $pull: { likes: req.body.idUser } }
      ).then(() => {
        User.updateOne(
          { _id: req.body.idUser },
          { $pull: { liked: req.body.idComment } }
        ).then(() => {
          res.json({ result: true, msg: "retweet supp" });
        });
      });
    } else {
      // si user.token pas dans [retweet] l'ajoute
      Comment.updateOne(
        { _id: req.body.idComment },
        { $push: { likes: req.body.idUser } }
      ).then(() => {
        User.updateOne(
          { _id: req.body.idUser },
          { $push: { liked: req.body.idComment } }
        ).then(() => {
          res.json({ result: true, msg: "retweet added" });
        });
      });
    }
  });
}
});

// route pour les retweet ( peut etre a changer ) meme principe que route like A CHANGER POUR ID AU LIEU DE TOKEN
router.put("/retweet", (req, res) => {
  if(req.body.idTweet){
    Tweet.findOne({ _id: req.body.idTweet }).then((data) => {
      // si user.token dans [retweet] le retire
      if (data.retweet.includes(req.body.idUser)) {
        Tweet.updateOne(
          { _id: req.body.idTweet },
          { $pull: { retweet: req.body.idUser } }
        ).then(() => {
          User.updateOne(
            { _id: req.body.idUser },
            { $pull: { retweets: req.body.idTweet } }
          ).then(() => {
            res.json({ result: true, msg: "retweet supp" });
          });
        });
      } else {
        // si user.token pas dans [retweet] l'ajoute
        Tweet.updateOne(
          { _id: req.body.idTweet },
          { $push: { retweet: req.body.idUser } }
        ).then(() => {
          User.updateOne(
            { _id: req.body.idUser },
            { $push: { retweets: req.body.idTweet } }
          ).then(() => {
            res.json({ result: true, msg: "retweet added" });
          });
        });
      }
    });
  } else {
    Comment.findOne({ _id: req.body.idComment }).then((data) => {
      // si user.token dans [retweet] le retire
      if (data.retweet.includes(req.body.idUser)) {
        Comment.updateOne(
          { _id: req.body.idComment },
          { $pull: { retweet: req.body.idUser } }
        ).then(() => {
          User.updateOne(
            { _id: req.body.idUser },
            { $pull: { retweets: req.body.idComment } }
          ).then(() => {
            res.json({ result: true, msg: "retweet supp" });
          });
        });
      } else {
        // si user.token pas dans [retweet] l'ajoute
        Comment.updateOne(
          { _id: req.body.idComment },
          { $push: { retweet: req.body.idUser } }
        ).then(() => {
          User.updateOne(
            { _id: req.body.idUser },
            { $push: { retweets: req.body.idComment } }
          ).then(() => {
            res.json({ result: true, msg: "retweet added" });
          });
        });
      }
    });
  }
});

// route pour les bookmarks meme principe que route like A CHANGER POUR ID AU
router.put("/bookmarks", (req, res) => {
  if(req.body.idTweet){
    Tweet.findOne({ _id: req.body.idTweet }).then((data) => {
      // si user.token dans [bookmarks] le retire
      if (data.bookmarks.includes(req.body.idUser)) {
        Tweet.updateOne(
          { _id: req.body.idTweet },
          { $pull: { bookmarks: req.body.idUser } }
        ).then(() => {
          User.updateOne(
            { _id: req.body.idUser },
            { $pull: { bookmarks: req.body.idTweet } }
          ).then(() => {
            res.json({ result: true, msg: "retweet supp" });
          });
        });
      } else {
        // si user.token pas dans [bookmarks] l'ajoute
        Tweet.updateOne(
          { _id: req.body.idTweet },
          { $push: { bookmarks: req.body.idUser } }
        ).then(() => {
          User.updateOne(
            { _id: req.body.idUser },
            { $push: { bookmarks: req.body.idTweet } }
          ).then(() => {
            res.json({ result: true, msg: "retweet added" });
          });
        });
      }
    });
  } else {
    Comment.findOne({ _id: req.body.idComment }).then((data) => {
      // si user.token dans [bookmarks] le retire
      if (data.bookmarks.includes(req.body.idUser)) {
        Comment.updateOne(
          { _id: req.body.idComment },
          { $pull: { bookmarks: req.body.idUser } }
        ).then(() => {
          User.updateOne(
            { _id: req.body.idUser },
            { $pull: { bookmarks: req.body.idComment } }
          ).then(() => {
            res.json({ result: true, msg: "retweet supp" });
          });
        });
      } else {
        // si user.token pas dans [bookmarks] l'ajoute
        Comment.updateOne(
          { _id: req.body.idComment },
          { $push: { bookmarks: req.body.idUser } }
        ).then(() => {
          User.updateOne(
            { _id: req.body.idUser },
            { $push: { bookmarks: req.body.idComment } }
          ).then(() => {
            res.json({ result: true, msg: "retweet added" });
          });
        });
      }
    });
  }
});

module.exports = router;
