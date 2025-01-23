var express = require("express");
var router = express.Router();

const Message = require("../models/message");
const User = require("../models/users");


// A FAIRE : 
// 2 ROUTE : 
// UNE POUR RECUPERER DM RECU SELON ID USER
// UNE POUR RECUPERER DM ENVOYER SELON ID USER
// {...} POUR ASSEMBLER LES 2 DEPUIS FRONT

// route pour recuperer une conversation entre 2 users
router.get('/get/:idUser/:idWatch', async (req, res) => {
    try {
      const watchId = req.params.idWatch;
      const userId = req.params.idUser;
      const dm = await Message.find({
        $or: [
          { $and: [{ author: userId }, { receive: watchId }] },
          { $and: [{ author: watchId }, { receive: userId }] }
        ]
      })
      .populate('author')
      .populate('receive')
      const messages = dm.map((e) => {
       return {
            messageId : e._id,
            authorUsername : e.author.username,
            authorId : e.author._id,
            authorFirstname : e.author.firstname,
            receiveId : e.receive._id,
            receiveUsername : e.receive.username,
            receiveFirstname : e.receive.firstname,
            content : e.content,
            date : e.date,
            read : e.read
        }
      }) 
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// route pour notification : passer read de false a true 
router.put("/read", (req,res)=> {
  Message.updateOne({_id : req.body.id},{read : true})
  .then(() => {
    res.json({result : true})
  })
})

// route pour recuperer le dernier dm reçu 
router.get('/getOne/:idUser/:idWatch', async (req, res) => {
  try {
    const watchId = req.params.idWatch;
    const userId = req.params.idUser;
    const dm = await Message.findOne({
      $or: [
        { $and: [{ author: userId }, { receive: watchId }] },
        { $and: [{ author: watchId }, { receive: userId }] }
      ]
    }).sort({ $natural: -1 })
    res.status(200).json(dm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// route pour ajouter un dm
router.post("/add", (req, res) => {
    const newMessage = new Message({
        author : req.body.author,
        receive : req.body.receive,
        content : req.body.content,
        date : new Date().toISOString(),
        read : false
    })
    newMessage.save().then(() => {
      User.findOne({_id : req.body.author})
      .then((user)=>{
        if(user.dm.includes(req.body.receive)){
          res.json({result : true , info : "message sent"})
        } else {
          User.updateOne({_id : req.body.receive}, {$push : {dm : req.body.author}})
          .then(() => {
            return User.updateOne({_id : req.body.author}, {$push : {dm : req.body.receive}});
          })
          .then(() => {
            res.json({result : true , info : "message sent"});
          });
        }
      })
    })})

    


module.exports = router;
