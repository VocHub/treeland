'use strict';
var fs = require('fs');
var dot = require('dot');
var config = require('../config/environment');

var api_key = 'key-***********************';
var domain = 'naturenurture.lk';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var url = config.url;
var mailOptions = {
  from: 'Nature Nurture <automated@naturenurture.lk>'
};

var composeEmail = function(data) {
  return {
    text: "Thank you for signing up with naturenurture.lk. Please verify your email address by clicking the following link " + url + "api/users/verify/" + data.verification_code + ". If you did not signed up with naturenurture.lk please click the following link " + url + "api/users/discard/" + data.verification_code,
    html: "<b>Thank you for signing up with naturenurture.lk</b><br><p>Please verify your email address by clicking the following link<br>" + url + "api/users/verify/" + data.verification_code + "<br><br>If you did not signed up with naturenurture.lk please click the following link<br>" + url + "api/users/discard/" + data.verification_code + "</p><p>Thank you,<br>Nature Nurture team.</p>"
  }
}

var composePasswordResetEmail = function(data) {
  return {
    text: "You may reset your password by clicking on the following link " + url + "reset_password/" + data.reset_code + ". If you did not requested a password reset please ignore this email.",
    html: "<b>You may reset your password by clicking on the following link</b><br>" + url + "reset_password/" + data.reset_code + ".<br><br>If you did not requested a password reset please ignore this email."
  }
}

var compose = function(file, data) {
  return new Promise(function(success, reject) {
    fs.readFile(__dirname + '/templates/' + file, 'utf8', function(err, html) {

      if (err) {
        console.log(err);
        reject(err);
      } else {
        var tempFn = dot.template(html);
        var resultText = tempFn(data);
        success(resultText);
      }
    });
  });

}

module.exports = {

  sendVerification: function(data, cb) {
    console.log(data)
    mailOptions.text = composeEmail(data).text;
    mailOptions.html = composeEmail(data).html;
    mailOptions.subject = 'Verify email';
    mailOptions.to = data.to;
    // send mail with defined transport object
    return new Promise(function(success, reject) {
      mailgun.messages().send(mailOptions, function(error, body) {
        if (error) {
          console.log(error);
          return reject(error);
        }
        console.log(body);
        return success(body)
      });
    })

  },
  sendPasswordResetLink: function(data) {
    console.log(data)
    //mailOptions.text = composePasswordResetEmail(data).text;
    //mailOptions.html = composePasswordResetEmail(data).html;
    mailOptions.subject = 'Reset password';
    mailOptions.to = data.to;
    // send mail with defined transport object
    return new Promise(function(success, reject) {
      compose('email_verification.html', {
        reset_code: url + "reset_password/" + data.reset_code
      }).then(function(html) {
        console.log(html);
        mailOptions.html = html;
        mailgun.messages().send(mailOptions, function(error, body) {
          if (error) {
            console.log(error);
            return reject(error);
          }
          console.log(body);
          return success(body)
        });
      }).catch(function(err) {
        console.log(err);
        return reject(err);
      })
    })
  },
  send: function(template,data,options) {
    return new Promise(function(success, reject) {
      compose(template + '.html', data).then(function(html) {
        console.log(html);
        options.html = html;
        mailgun.messages().send(options, function(error, body) {
          if (error) {
            console.log(error);
            return reject(error);
          }
          console.log(body);
          return success(body)
        });
      }).catch(function(err) {
        console.log(err);
        return reject(err);
      })
    })
  }
}
