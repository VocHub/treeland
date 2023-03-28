'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var email = require('../../email/email.service');
var crypto = require('../../crypto/crypto.service');
var jwt = require('jsonwebtoken');

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}
module.exports = {
  /**
   * Get list of users
   * restriction: 'admin'
   */
  index: function(req, res) {
    return User.find({}, '-salt -password').exec().then(users => {
      res.status(200).json(users);
    }).catch(handleError(res));
  },

  /**
   * Creates a new user
   */
  create: function(req, res, next) {

    console.log(req.body);
    var newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.role = 'user';
    newUser.save().then(function(user) {
      email.sendVerification({verification_code: user.verification_code, to: user.email});
      var token = jwt.sign({
        _id: user._id
      }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({token});
    }).catch(validationError(res));
  },
  verify: function(req, res, next) {
    return User.findOne({verification_code: req.params.id}).exec().then(user => {
      user.verified = true;
      user.save().then(user => {
        res.redirect("/email-verified");
        //donation-guide email
        email.send('donation-guide', {}, {
          from: config.email_from,
          to: user.email,
          subject: 'Quick guide'
        }).then(function(body) {
          console.log('Quick guide mail sent');
        }).catch(function(err) {
          console.log('Quick guide mail failed');
          console.log(err);
        })
      }).then(null, err => {
        next(err)
      })
    })

  },
  discard: function(req, res, next) {
    return User.findOne({verification_code: req.params.id}).exec().then(user => {
      console.log(user);
      console.log(user.verified);

      if (user.verified === 'false') {
        user.active = false;
        user.save().then(user => {
          res.redirect("/email-discarded");
        }).catch(console.log(err))
      } else {
        //res.redirect("/");
      }

    })
  },
  /**
   * Password reset link request
   */
  reset_password_request: function(req, res, next) {
    return User.findOne({email: req.params.id}).exec().then(user => {
      if (user) {
        console.log(user);

        email.sendPasswordResetLink({reset_code: crypto.encryptText(user._id.toString()), to: req.params.id})
        .then(function(info) {
          console.log(info);
          //res.send(info);
          res.status(204).end();
        })
        .catch(function(err) {
          console.log(err);
          //res.send(err);
          res.status(500).end();
        });


      }

    })
  },
  /**
   * Password reset data submition
   */
  reset_password_request_data: function(req, res, next) {
    var newPass = String(req.body.password);
    return User.findOne({_id: crypto.decryptText(req.body.id.toString())}).exec().then(user => {
      if (user) {
        user.password = newPass;
        return user.save().then(() => {
          res.status(204).end();
        }).catch(validationError(res));
        // console.log(user);
        // res.send(user);
        //email.sendPasswordResetLink({reset_code: crypto.encryptText(user._id.toString()), to: req.params.id});
      }

    })
  },
  /**
   * Get a single user
   */
  show: function(req, res, next) {
    var userId = req.params.id;

    return User.findById(userId).exec().then(user => {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    }).catch(err => next(err));
  },

  /**
   * Deletes a user
   * restriction: 'admin'
   */
  destroy: function(req, res) {
    return User.findByIdAndRemove(req.params.id).exec().then(function() {
      res.status(204).end();
    }).catch(handleError(res));
  },

  /**
   * Change a users password
   */
  changePassword: function(req, res, next) {
    var userId = req.user._id;
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    return User.findById(userId).exec().then(user => {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save().then(() => {
          res.status(204).end();
        }).catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
  },

  /**
   * Get my info
   */
  me: function(req, res, next) {
    var userId = req.user._id;

    return User.findOne({
      _id: userId
    }, '-salt -password').exec().then(user => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    }).catch(err => next(err));
  },

  /**
   * Authentication callback
   */
  authCallback: function(req, res, next) {
    res.redirect('/');
  }
}
