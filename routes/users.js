var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

const User = require('../models/users')

const { checkBody } = require('../modules/checkbody');

/* GET Users listing */
router.get('/get/:username', (req, res) =>{
  User.findOne({username : req.params.username})
  .populate("following")
  .populate("followers")
  .populate({
    path: 'liked',
    populate: {
      path: 'author', // Populate le champ 'author' dans le modèle 'liked'
      model: 'users', // Précise le modèle pour éviter des erreurs
    },
  })
  .populate({
    path: 'liked',
    populate: {
      path: 'likes', 
      model: 'users', 
    },
  })
  .populate({
    path: 'liked',
    populate: {
      path: 'retweet', 
      model: 'users', 
    },
  })
  .populate({
    path: 'retweets',
    populate: {
      path: 'author', // Populate le champ 'author' dans le modèle 'liked'
      model: 'users', // Précise le modèle pour éviter des erreurs
    },
  })
  .populate({
    path: 'retweets',
    populate: {
      path: 'likes', 
      model: 'users', 
    },
  })
  .populate({
    path: 'retweets',
    populate: {
      path: 'retweet', 
      model: 'users', 
    },
  })
  .populate({
    path: 'tweets',
    populate: {
      path: 'author', 
      model: 'users', 
    },
  })
  .populate({
    path: 'tweets',
    populate: {
      path: 'likes',
      model: 'users',
    },
  })
  .populate({
    path: 'tweets',
    populate: {
      path: 'retweet',
      model: 'users', 
    },
  })
  .populate({
    path: 'comment',
    populate: {
      path: 'retweet',
      model: 'users', 
    },
  })
  .populate({
    path: 'comment',
    populate: {
      path: 'likes',
      model: 'users', 
    },
  })
  .populate({
    path: 'comment',
    populate: {
      path: 'comments',
      model: 'tweets', 
    },
  })
  .populate({
    path: 'comment',
    populate: {
      path: 'author',
      model: 'users', 
    },
  })
  .populate({
    path: 'comment',
    populate: {
      path: 'replyTo',
      model: 'tweets', 
    },
  })
  .populate({
    path: 'comment',
    populate: {
      path: 'replyTo',
      populate : {
        path: 'author',
          model: 'users', 
        },
    },
  }).populate({
    path: 'comment',
    populate: {
      path: 'replyTo',
      populate : {
        path: 'likes',
          model: 'users', 
        },
    },
  }).populate({
    path: 'comment',
    populate: {
      path: 'replyTo',
      populate : {
        path: 'retweet',
          model: 'users', 
        },
    },
  })
  .then((data) =>{
    res.json({result: true, user: data})
  })
});

// GET user avec search
router.get('/getSearch/:search', (req, res) =>{

  const searchTerm = req.params.search
  const rp = new RegExp(`^${searchTerm}`, 'i' );

  User.find({username : {$regex : rp}})
  .populate("following")
  .populate("followers")
  .populate({
    path: 'liked',
    populate: {
      path: 'author', // Populate le champ 'author' dans le modèle 'liked'
      model: 'users', // Précise le modèle pour éviter des erreurs
    },
  })
  .populate({
    path: 'liked',
    populate: {
      path: 'likes', 
      model: 'users', 
    },
  })
  .populate({
    path: 'liked',
    populate: {
      path: 'retweet', 
      model: 'users', 
    },
  })
  .populate({
    path: 'tweets',
    populate: {
      path: 'author', 
      model: 'users', 
    },
  })
  .populate({
    path: 'tweets',
    populate: {
      path: 'likes',
      model: 'users',
    },
  })
  .populate({
    path: 'tweets',
    populate: {
      path: 'retweet',
      model: 'users', 
    },
  })
  .then((data) =>{
    res.json({result: true, user: data})
  })
});

// Get dm by user pour afficher la liste des conversations
router.get('/getdm/:idUser', (req,res) => {
  User.findOne({_id : req.params.idUser})
  .populate('dm')
  .then((data)=>{
    res.json({result : true , dm : data.dm})
  })
})

// GET LIKE BY USER 
router.get('/getlike/:username', (req, res) =>{
  User.findOne({username : req.params.username})
  .populate({
    path: 'tweets',
    populate: {
      path: 'author', // Populate le champ 'author' dans le modèle 'tweet'
      model: 'users', // Précise le modèle pour éviter des erreurs
    },
  })
  .then((data) =>{
    res.json({result: true, user: data})
  })
});

//POST SIGN UP
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['firstname','username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  };

  // Check if the user has not already been registered
  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        bookmarks : [],
        retweets : [],
        liked : [],
        profil : null,
        token: uid2(32),
      });
      newUser.save().then(newUser => {
        res.json({ result: true, newUser: newUser });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

//POST SIGN IN
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token, firstname: data.firstname , profil: data.profil, id : data._id});
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});


// route pour afficher les bookmarks de user.[bookmarks]
router.get("/bookmarked/:token" , (req,res) => {
    User.findOne({token : req.params.token})
    // populateception
    .populate({
      path: 'bookmarks',
      populate: {
        path: 'author', // Populate le champ 'author' dans le modèle 'tweet'
        model: 'users', // Précise le modèle pour éviter des erreurs
      },
    })
    .populate({
      path:"bookmarks",
      populate : {
        path : 'likes',
        model: 'users'
      }
    })
    .populate({
      path:"bookmarks",
      populate : {
        path : 'retweet',
        model: 'users'
      }
    })
      .then((data) => {
        if(data?.bookmarks){
        res.json({result : true , bookmarked : data?.bookmarks})
        } else {
          res.json({result : false , error : "no bookmarks found"})
        }
    })
})


// clear bookmarks
router.delete("/clear", (req,res) => {
  User.updateOne(
    {token : req.body.token},
    {bookmarks : []}
  )
  .then(() => {
    res.json({result : true , info : "bookmarks deleted"})
  })
})

// route follow et unfollow 
router.put('/follow', (req,res) => {
  User.findOne({_id : req.body.currentId})
  .then((user)=> {
    if(!user.following.includes(req.body.watchId)){
      User.updateOne(
        {_id : req.body.watchId},
        {$push : {followers : user._id}}
      )
      .then(() => {
        User.updateOne(
          {_id : req.body.currentId},
          {$push : {following : req.body.watchId}}
        )
        .then(() => {
          res.json({result : true , info : ' folow complete '})
        })
      })
    } else {
      User.updateOne(
        {_id : req.body.watchId},
        {$pull : {followers : user._id}}
      )
      .then(() => {
        User.updateOne(
          {_id : req.body.currentId},
          {$pull : {following : req.body.watchId}}
        )
        .then(() => {
          res.json({result : true , info : ' unfolow complete '})
        })
      })
    }
  })
})


// route pour changer bio
router.put('/bio', (req,res) => {
  User.updateOne(
    {token : req.body.token},
    {bio : req.body.bio}
  )
  .then(() => {
    res.json({result : true , info : 'bio updated'})
  })
})

// route pour changer firstname
router.put('/firstname', (req,res) => {
  User.updateOne(
    {token : req.body.token},
    {firstname : req.body.firstname}
  )
  .then(() => {
    res.json({result : true , info : 'firstname updated'})
  })
})

module.exports = router;
