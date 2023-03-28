'use strict';

var express = require('express');
var Plant = require('./plant.model')
var User = require('../user/user.model')
var config = require('../../config/environment');
var email = require('../../email/email.service');
var crypto = require('../../crypto/crypto.service');
var upload = require('../../upload')

var router = express.Router();
var gm = require('gm').subClass({imageMagick: true});

//
//
//get all plants
//
//
router.get('/', function(req, res) {
  Plant.find({
    type: {
      $nin: ['Response','Movement']
    },
    status: {
      $nin: ['deleted', 'closed', 'pending']
    }

  }, null, {
    sort: {
      createdAt: -1
    }
  }).select('-responses.contact_info').populate('responses.response').populate('owner', '_id name').exec(function(err, data) {
    if (err) {
      res.send({error: true, message: err});
      return;
    } else {

      return User.populate(data, {
        path: 'responses.response.owner',
        select: '_id name',
        // <== We are populating phones so we need to use the correct model, not User
      }, function(err, docs) {
        if (err) {
          res.send({error: true, message: err});
          return;
        }
        res.send(docs);
      });
    }

  })
});
//
//
// find plants by user
//
//
router.get('/user/:id', function(req, res) {
  Plant.find({
    owner: req.params.id,
    type: {
      $nin: ['Response','Movement']
    },
    status: {
      $nin: ['deleted', 'closed']
    }
  }, null, {
    sort: {
      createdAt: -1
    }
  }).select('-responses.contact_info').populate('responses.response').populate('owner', '_id name').exec(function(err, data) {
    if (err) {
      res.send({error: true, message: err});
      return;
    } else {

      User.populate(data, {
        path: 'responses.response.owner',
        select: '_id name',
        // <== We are populating phones so we need to use the correct model, not User
      }, function(err, docs) {
        if (err) {
          res.send({error: true, message: err});
          return;
        }
        res.send(docs);
      });
    }

  })
});
//
//
// create a plant
//
//
router.post('/', function(req, res) {

  Plant.create(req.body, function(err, dt) {
    //console.log(req.body);
    //console.log(dt);
    if (err) {
      res.status(500).send({error: true, message: err});

    } else {

      Plant.findOne({_id: dt._id}).populate('owner', '_id name').exec(function(err, data) {
        if (err) {
          res.status(500).send({error: true, message: err});
          return;
        }
        if (req.body.instant) {
          var ins_data = data;
          ins_data.verification_link = config.url + 'api/plant/verify_instant_post/' + crypto.encryptText(data._id.toString());
          ins_data.offer_text = ((ins_data.type == 'Request') ? 'requested ' : 'offered ') + ins_data.quantity + ' '+ ins_data.name + ((ins_data.quantity>1)? ' plants':' plant');
          console.log(ins_data);
          email.send('instant_post_verification', ins_data, {
            from: config.email_from,
            to: ins_data.owner_email,
            subject: 'Instant post verification'
          }).then(function(body) {
            console.log('instant post verification mail sent');
          }).catch(function(err) {
            console.log('mail failed');
            console.log(err);
          })
        }
        res.send(data);
      })
    }
  })
});

//////
//
// create a movement
//
//////

function getMeta(path) {
  return new Promise(function(resolve, reject) {
    gm(config.data_dir+'images/'+path).size(function(err, size) {
      if (!err) {
        console.log(size.height);
        resolve({
          url: 'upload/images/'+path,
          meta: {
            height: size.height,
            width: size.width
          }
        });
      } else {
        reject(err);
      }
    })
  });
}

router.post('/movement',upload.img_upload.array('file'),function(req, res) {
  // set body
  if (!req.body.plant) {
    return res.send('err')

  }

  console.log(req.body);
  req.body.plant.quantity = 1;
  req.body.plant.type = 'Movement';

  //console.log(req.body.plant.instant);
  // return res.send('F');
  //req.body.instant = true;
  var promises = [];
  if (req.files && req.files.length) {
    for (var i = 0; i < req.files.length; i++) {
      promises.push(getMeta(req.files[i].filename))
    }

    Promise.all(promises).then(function(result) {
      req.body.plant.image = result[0].url;
      //console.log(result);
      //console.log(req.body);

      Plant.create(req.body.plant, function(err, dt) {
        //console.log(req.body);
        //console.log(dt);
        if (err) {
          console.log(err);
          res.status(500).send({error: true, message: err});

        } else {

          Plant.findOne({_id: dt._id}).populate('owner', '_id name').exec(function(err, data) {
            if (err) {
              res.status(500).send({error: true, message: err});
              return;
            }
            if (req.body.plant.instant == 'true') {
              //console.log('eeeeeeeeeeeeeeeeeee');
              console.log(req.body.plant.instant);
              var ins_data = data;
              ins_data.verification_link = config.url + 'api/plant/verify_instant_post/' + crypto.encryptText(data._id.toString());
              ins_data.offer_text = "Planted" + ' ' + ins_data.quantity + ' ' + ins_data.name + ((ins_data.quantity>1)? ' plants':' plant');
              console.log(ins_data);
              email.send('instant_movement_verification', ins_data, {
                from: config.email_from,
                to: ins_data.owner_email,
                subject: 'Thank you for joining us'
              }).then(function(body) {
                console.log('New plant verification mail sent');
              }).catch(function(err) {
                console.log('verification mail failed');
                console.log(err);
              })
            }else {
              User.findOne({_id:req.body.plant.owner},function(err,user) {
                if (!err) {
                  console.log('000000000000');
                  console.log(user);
                  var ins_data = data;
                  ins_data.owner_name = user.name;
                  ins_data.verification_link = config.url + 'api/plant/verify_instant_post/' + crypto.encryptText(data._id.toString());
                  ins_data.offer_text = "Planted" + ' ' + ins_data.quantity + ' ' + ins_data.name + ((ins_data.quantity>1)? ' plants':' plant');
                  console.log(ins_data);
                  email.send('instant_movement_verification', ins_data, {
                    from: config.email_from,
                    to: user.email,
                    subject: 'Thank you for joining us'
                  }).then(function(body) {
                    console.log('New plant verification mail sent');
                  }).catch(function(err) {
                    console.log('verification mail failed');
                    console.log(err);
                  })
                }
              })
            }

            res.send(data);
          })
        }
      })

    }).catch(function(err) {
      console.log(err);
    })
  }


});

//
//
// get movement
//
//
//
router.get('/movements', function(req, res) {
  Plant.find({
    type: {
      $in: ['Movement']
    },
    status: {
      $nin: ['deleted', 'closed', 'pending']
    }

  }, null, {
    sort: {
      createdAt: -1
    }
  }).select('-responses.contact_info').populate('responses.response').populate('owner', '_id name').exec(function(err, data) {
    if (err) {
      res.send({error: true, message: err});
      return;
    } else {

      return User.populate(data, {
        path: 'responses.response.owner',
        select: '_id name',
        // <== We are populating phones so we need to use the correct model, not User
      }, function(err, docs) {
        if (err) {
          res.send({error: true, message: err});
          return;
        }
        res.send(docs);
      });
    }

  })
});



//
//
// create a submition
//
//
router.post('/submition', function(req, res) {

  Plant.create(req.body, function(err, dt) {
    //console.log(req.body);
    //console.log(dt);
    if (err) {
      res.status(500).send({error: true, message: err});

    } else {

      Plant.findOne({_id: dt._id}).populate('owner', '_id name').exec(function(err, data) {
        if (err) {
          res.status(500).send({error: true, message: err});
          return;
        }
        if (req.body.instant) {
          var ins_data = data;
          ins_data.verification_link = config.url + 'api/plant/verify_instant_post/' + crypto.encryptText(data._id.toString());
          ins_data.offer_text = ((ins_data.type == 'Request') ? 'requested ' : 'offered ') + ins_data.quantity + ' '+ ins_data.name + ((ins_data.quantity>1)? ' plants':' plant');
          console.log(ins_data);
          email.send('instant_post_verification', ins_data, {
            from: config.email_from,
            to: ins_data.owner_email,
            subject: 'Instant post verification'
          }).then(function(body) {
            console.log('instant post verification mail sent');
          }).catch(function(err) {
            console.log('mail failed');
            console.log(err);
          })
        }
        res.send(data);
      })
    }
  })
});
//
//
///verify_instant_post
//
//
router.get('/verify_instant_post/:id',function(req,res) {
  Plant.findOneAndUpdate({_id: crypto.decryptText(req.params.id)},{status: 'active'},function(err,results) {
    console.log(results);
    res.redirect("/email-verified");
  })
  // Plant.findOneAndUpdate({_id: crypto.decryptText(req.params.id)}).exec().then(plant => {
  //   plant.status = 'active';
  //   plant.markModified('status');
  //   console.log(plant);
  //   plant.save().then(plant => {
  //     console.log(plant);
  //     res.redirect("/email-verified");
  //   }).then(null, err => {
  //     console.log(err);
  //   })
  // })
});
//
//
//update a plant
//
//
router.put('/:id', function(req, res) {
  console.log(req.body);
  Plant.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {
    upsert: true
  }, function(err, doc) {
    if (err)
      return res.send(500, {error: err});
    Plant.findOne({
      _id: req.params.id
    }, function(err, doc) {
      if (err)
        return res.send(500, {error: err});
      console.log(doc);
      return res.send(doc);
    })

  });

});
//
//
// bid on a plant
//
//
router.post('/response', function(req, res) {
  if (req.body.response) {
    req.body.response.type = "Response";
  } else {
    res.status(400).send({error: true, message: "Empty request body"});
    return;
  }

  console.log("object of post -> " + req.body);

  User.findOne({email: 'guest@guest.com'}).exec(function(err, doc) {
    if (err) {
      res.status(500).send({error: true, message: err});
    }
    //
    //
    // get guest user for
    if (req.body.response.owner === 'guest') {
      req.body.response.owner = doc._id;
    }
    //
    //

    Plant.create(req.body.response, function(err, dt) {
      console.log(req.body);
      console.log(dt);
      if (err) {
        res.status(500).send({error: true, message: err});

      } else {
        console.log("object id of response-> " + dt._id);
        Plant.findOne({
          _id: req.body.id
        }, function(err, doc) {
          console.log(doc);
          doc.responses.push({response: dt._id, contact_info: req.body.response.contact_info});
          doc.save(function(err, updatedDoc) {
            if (err) {
              res.status(500).send(err);
              return;
            }
            Plant.populate(updatedDoc, {
              path: 'responses.response'
            }, function(err, doc) {
              User.populate(doc, [{
                path: 'responses.response.owner',
                select: '_id name',
                // <== We are populating phones so we need to use the correct model, not User
              },{
                path: 'owner',
                select: 'email',
                // <== We are populating phones so we need to use the correct model, not User
              }], function(err, docs) {
                if (err) {
                  res.send({error: true, message: err});
                  return;
                }
                User.populate(dt,{
                  path: 'owner',
                  select: '_id name email',
                },function(err,owner_doc) {
                  if (err) {
                    console.log(err);
                  }

                  owner_doc.contact_info = req.body.response.contact_info;
                  owner_doc.parent = docs;
                  var date = new Date(owner_doc.createdAt);
                  console.log(date.toLocaleString({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
                  owner_doc.date = date.toLocaleString('en-US',{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',hour: 'numeric',minute: 'numeric'});

                  if (docs.instant && (docs.instant !== undefined)) {
                    owner_doc.parent_name = docs.owner_name;
                    owner_doc.to = docs.owner_email;
                  }else {
                    owner_doc.parent_name = docs.owner.name;
                    owner_doc.to = docs.owner.email;
                  }

                  console.log(docs.instant && (docs.instant !== undefined));
                  email.send('response_notification',owner_doc,{
                    from: config.email_from,
                    to: owner_doc.to,
                    subject: req.body.response.quantity +' '+req.body.response.name+' plants from '+req.body.response.address.toString().split(',')[0]
                  }).then(function(res) {
                    console.log(res);
                  }).catch(function(err) {
                    console.log(err);
                  });

                })

                res.send(docs);
              });

              //res.send(doc);
            });


            console.log("SUCCESS");
          });
        });
      }

    })

  })

  //console.log(req.body.response.owner);

});
//
//
// response by id
//
//
router.get('/response/:id', function(req, res) {
  Plant.findOne({'responses._id': req.params.id})
  //.select('responses.contact_info')
    .exec(function(err, data) {
    if (err) {
      res.status(500).send({error: err})
      return;
    }
    var relation = data.responses.id(req.params.id)
    console.log(relation);
    res.status(200).send({contact_info: relation.contact_info});
  })
});
//
//
// search
//
//
router.get('/search/:id', function(req, res) {
  Plant.find({
    $text: {
      $search: req.params.id
    },
    type: {
      $nin: ['Response']
    },
    status: {
      $nin: ['deleted', 'closed']
    }
  }, {
    score: {
      $meta: "textScore"
    }
  }).sort({
    score: {
      $meta: 'textScore'
    }
  }).select('-responses.contact_info').populate('responses.response').populate('owner', '_id name').exec(function(err, data) {
    if (err) {
      res.status(500).send({error: err})
      return;
    }
    User.populate(data, {
      path: 'responses.response.owner',
      select: '_id name',
      // <== We are populating phones so we need to use the correct model, not User
    }, function(err, docs) {
      if (err) {
        res.send({error: true, message: err});
        return;
      }
      console.log(data);
      res.status(200).send(docs);
      //res.send(docs);
    });

  })
});
//
//
// find bids by user
//
//
router.get('/user/bids/:id', function(req, res) {
  Plant.find({
    type: {
      $nin: ['Response']
    }
  }, null, {
    sort: {
      createdAt: -1
    }
  }).select('-responses.contact_info').populate({
    path: 'responses.response',
    match: {
      owner: req.params.id
    }
  })
  //.where('responses.response.owner').equals(req.params.id)
    .populate('owner', '_id name').exec(function(err, data) {
    if (err) {
      res.send({error: true, message: err});
      return;
    } else {
      //console.log(data);
      data = data.filter(function(d) {
        d.responses = d.responses.filter(function(response) {
          //console.log(response);
          return true;

        });
        return d.responses.length > 0;
      });
      //console.log(data);

      User.populate(data, {
        path: 'responses.response.owner',
        select: '_id name',
        // <== We are populating phones so we need to use the correct model, not User
      }, function(err, docs) {
        if (err) {
          res.send({error: true, message: err});
          return;
        }
        res.send(docs);
      });
    }

  })
});
//
//
// delete plant
//
//
router.delete('/:id', function(req, res) {
  console.log('deleting - ' + req.params.id);
  Plant.findOneAndUpdate({
    _id: req.params.id
  }, {
    status: 'deleted'
  }, {
    upsert: true
  }, function(err, doc) {
    if (err)
      return res.send(500, {error: err});
    Plant.findOne({
      _id: req.params.id
    }, function(err, doc) {
      if (err)
        return res.send(500, {error: err});
      console.log(doc);
      return res.send(doc);
    })

  });

});
//
//
// mark a post as closed
//
//
router.post('/close/:id', function(req, res) {
  console.log('closing - ' + req.params.id);
  Plant.findOneAndUpdate({
    _id: req.params.id
  }, {
    status: 'closed'
  }, {
    upsert: true
  }, function(err, doc) {
    if (err)
      return res.send(500, {error: err});
    Plant.findOne({
      _id: req.params.id
    }, function(err, doc) {
      if (err)
        return res.send(500, {error: err});
      console.log(doc);
      return res.send(doc);
    })

  });

});
//
//
// mark post as review
//
//
router.post('/report/:id', function(req, res) {
  console.log('review - ' + req.params.id);
  Plant.findOneAndUpdate({
    _id: req.params.id
  }, {
    status: 'review'
  }, {
    upsert: true
  }, function(err, doc) {
    if (err)
      return res.send(500, {error: err});
    Plant.findOne({
      _id: req.params.id
    }, function(err, doc) {
      if (err)
        return res.send(500, {error: err});
      console.log(doc);
      return res.send(doc);
    })

  });

});

// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;
