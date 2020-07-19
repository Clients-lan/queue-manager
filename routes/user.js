const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')
require('dotenv').config();
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const async = require('async')
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');


const { ensureAuthenticated } = require('../config/auth');

//@Modules

const Booking = require('../modules/Booking');
const Team = require('../modules/Team');
const User = require('../modules/User');






//================= QUEUE MANAGEMENT APP ====================



//@On setup - Check if location exist
router.get('/setup', ensureAuthenticated, (req, res) => {
    if (req.user.locisadded == 'false') {
        res.render('setup', {
            user: req.user,
            greet: 'Welcome'
        })
    } else { 
        res.redirect('/u/dashboard')
    }
})

//@Dashboard - Check if user is subscribed
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    if (req.user.subscribed == 'true' || req.user.subscribed == 'active') {
        res.render('admin', {
            user: req.user,
            data: req.user.location,
            vil: req.user.visitors,
            role: req.session.role
        })
    } else {
        res.redirect('/plans')
    }
})

//@ User Profile Page
router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user, role: req.session.role })
})

//@User Billing Page
router.get('/billing', ensureAuthenticated, (req, res) => {
    res.render('billing', { user: req.user, role: req.session.role })
})


//@Team Login Page
router.get('/team-login/:token', (req, res) => {
    User.findOne({ teamToken: req.params.token }).then(user => {
        if (!user) {
            return res.redirect('/')
        } else {
            res.render('./frontend/teamlog', {
                email: user.email,
                password: user.password2
            })
        }
    })
})


//@ Team Login Handler
router.post('/team-login/:token', (req, res, next) => {
  
    const { teamemail, teampassword, email, password } = req.body
    let errors = [];

    
    if (!teamemail || !teampassword) {
        errors.push({msg: 'Fill in all fields'})
    }
    
    if (errors.length > 0) {
        res.render('frontend/teamlog', {
            errors,
            email: email,
            password: password
        })
    } else {
        Team.findOne({ email: teamemail, password: teampassword, token: req.params.token }).then(team => {
            if (!team) {
                errors.push({ msg: 'Incorrect password or email' })
                res.render('frontend/teamlog', {
                    errors,
                    email: email,
                    password: password
                })
            } else {
                req.session.role = team.role
                passport.authenticate('local', {
                    successRedirect: '/u/trial',
                    failureRedirect: '/u/team-login',
                    failureFlash: true
                })(req, res, next);
            } 
        })
    }
  });


//@Trial Page -- Subscription
router.get('/trial', ensureAuthenticated, (req, res) => {
    if (req.user.verified == 'false') {
        res.render('confirm', { msg: 'You account has not been verified', desc: 'A verification code was sent to your email address, check your inbox and follow the guide.' })
    } else if (req.user.subscribed == 'false' || req.user.subscribed == null) {
        res.render('sub', { user: req.user })
    } else { 
        res.redirect('/u/setup')
    }
   
})



//@Create New Location
router.get('/new-location', ensureAuthenticated, (req, res) => {
    res.render('setup', {
        user: req.user,
        greet: 'Hi',
        role: req.session.role
    })
})


//@Appointments
router.get('/appointment', ensureAuthenticated, (req, res) => {
    res.render('booking', {
        user: req.user,
        bookin: req.user.book
    })
})

//@Slots
router.get('/slots', ensureAuthenticated, (req, res) => {
   
    User.findOne({ email: req.user.email }, (err, doc) => {
        res.render('slot', {
            user: req.user,
            slots: doc.slot
        })
    }).sort('-date').exec(function(err, docs) { });
})

//@ See Location Settings
router.get('/location/:_id', ensureAuthenticated, (req, res) => {
    res.render('singlelocation', {
        user: req.user,
        verify: req.params._id,
        locationList: req.user.location,
        teams: req.user.team,
        role: req.session.role
    })
})


//@Service Page
router.get('/service', ensureAuthenticated, (req, res) => {
    res.render('service', {
      user: req.user,
      data: req.user.location,
      visitors: req.user.visitors
    })
  })




  //@Get all locations
router.get('/places', ensureAuthenticated, (req, res) => {
    if (req.user.subscribed != "" || req.user.subscribed != '') {
        res.render('location', {
            user: req.user,
            locationList: req.user.location,
            role: req.session.role
        })
    } else {
        res.redirect('/u/trial')
    }
})

//@Team Page
router.get('/team', ensureAuthenticated, (req, res) => {
    res.render('team', {
        user: req.user,
        teams: req.user.team,
        data: req.user.location,
        role: req.session.role
    })
})

//@Analysis Page
router.get('/analytics', ensureAuthenticated, (req, res) => {
    res.render('stat', {
        user: req.user,
        points: req.user.location,
        visitors: req.user.visitors,
        team: req.user.team,
        cd: new Date().getDate(),
        role: req.session.role
    })
})

//@Login Page & Registration Page
router.get('/login', (req, res) => res.render('login'))
router.get('/register', (req, res) => {
    res.render('register', {
        plan: 'Starter',
        plancode: 'price_1GziLCDs4JGjbQ5T93SHHJKp'
    })
})




//@Register Handle
router.post('/register', (req, res) => {
    
    const { first, last, verified, username, plan, plancode, subscribed, email, password, password2, locisadded, token} = req.body
    

    let errors = [];
    //Check required fields
    if (!first || !last || !email || !password || !password2) {
        errors.push({msg: 'Please fill in all fields'})
    }
    //Check password match
    if (password !== password2) {
        errors.push({msg: 'Passwords does not match'})
    }
    //Password length
    if (password.length < 8) {
        errors.push({ msg: 'Password should be at least 8 characters' })
    }
    if (!token || token == '') {
        errors.push({ msg: 'Hmmm! Are you a bot?' })
    }

    
    let matchNumber = password.match(/\d+/g)
    if (matchNumber == null) {
        errors.push({ msg: 'Password must contain at least 1 numeric value' })
    }

    let format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (!format.test(password)) {
        errors.push({ msg: 'Password must contain at least 1 special character, eg. @, !, etc' })
    }  


    if (errors.length > 0) {
        res.render('register', {
            errors,
            email,
            first,
            last,
            plan,
            plancode,
            password,
            password2,
            verified
        })
    } else {
       //Validate pass
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //User already EXIST
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', {
                        errors,
                        email, 
                        first,
                        last,
                        plan,
                        plancode,
                        password,
                        password2,
                        verified
                    });
                }  else {
                    const newUser = new User({
                        username,
                        email,
                        first,
                        last,
                        password,
                        plan,
                        plancode,
                        subscribed,
                        locisadded,
                        verified,
                        verifyToken: uuidv4(),
                        teamToken: `token${uuidv4()}-${uuidv4()}`
                    });
                    //Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            //Set Password to hashed
                            newUser.password = hash;
                            //Save User
                            newUser.save()
                                .then(user => {
                                    let transporter = nodemailer.createTransport({
                                        host: 'smtp.office365.com', // Office 365 server
                                        port: 587,   // secure SMTP
                                        requireTLS: true,
                                        secure: false,
                                        auth: {
                                            user: 'contactus@flexyq.com',
                                            pass: 'AXszr#$39!@'
                                        },
                                        tls: {ciphers: 'SSLv3'}
                                      });
                                      let mailOptions = {
                                        from: 'contactus@flexyq.com',
                                        to: user.email,
                                        subject: 'Account Verification',
                                        text: 'Welcome to FlexyQ', 
                                        html:  `<h3>Welcome to FlexyQ, ${user.first} ${user.last}! </h3> <p> Click on the button below to activate your FlexyQ account or use this <a href="https://${req.headers.host}/u/verify-account/${user.verifyToken}">link</a> </p> <br><p> <a href="https://${req.headers.host}/u/verify-account/${user.verifyToken}" style="text-decoration: none; padding: 1rem 2rem; border-radius: 5px; background: #1c96aa; color: #fff;">Activate now</a></p> <br> <p>After successful activation, you can log in to your new account.</p>`,
                                      };
                                      transporter.sendMail(mailOptions, (error, info) => {
                                        if (error) { return console.log(error);}
                                        console.log('Message sent: %s', info.messageId);
                                      })
                                    
                                //     const msg = {
                                //         to: user.email,
                                //         from: 'contactus@flexyq.com',
                                //         subject: 'Account Verification',
                                //         text: 'Hello there',
                                //         html: `<h3>Welcome to FlexyQ, ${user.first} ${user.last}! </h3> <p> Click on the button below to activate your FlexyQ account or use this <a href="https://${req.headers.host}/u/verify-account/${user.verifyToken}">link</a> </p> <br><p> <a href="https://${req.headers.host}/u/verify-account/${user.verifyToken}" style="text-decoration: none; padding: 1rem 2rem; border-radius: 5px; background: #1c96aa; color: #fff;">Activate now</a></p> <br> <p>After successful activation, you can log in to your new account.</p>`,
                                //      };
                                //   sgMail.send(msg)
                                    res.render('confirm', {
                                        msg: 'Confirm your account',
                                        desc: 'To make sure that your account is safe there is an additional step needed. Please check your email to confirm your account.'
                                    })
                                })
                            .catch(err => console.log(err))
                        }));
                }
            });
    }
});


//@Verify Account
router.get('/verify-account/:token', function(req, res) {
    User.findOne({ verifyToken: req.params.token}, (err, user) => {
      if (!user) {
        req.flash('error_msg', 'Account verification failed, please try again.');
        return res.redirect('/u/register');
      } else {
        User.findByIdAndUpdate(user._id,{ 'verified': true, 'verifyToken': '' }, {useFindAndModify: false}, (err, result) => {
            if (err) {return } 
        })  
        req.flash('success_msg', 'Account verification was successful, you can login now');
        res.redirect('/u/login');
      }
    });
}); 
   


//@Team Registration
router.get('/team-signup/:token', function(req, res) {
    User.findOne({ teamToken: req.params.token}, (err, user) => {
      if (!user) {
        req.flash('error_msg', 'We are unable to verify your token.');
        return res.redirect('/u/register');
      } else {
          res.render('./frontend/teamreg')
      }
    });
});


//@Regsiter Team Member
router.post('/team-signup/:token', function(req, res) {
   
    const { email, password } = req.body
    let errors = [];
   
    User.findOne({ teamToken: req.params.token }, (err, user) => {
      if (!user) {
        req.flash('error_msg', 'We are unable to verify your token.');
        return res.redirect('/u/register');
      } else {
          let exist,
              role,
              fullname,
              location;

         user.team.forEach(tm => {
             if (tm.workemail == email) {
                 exist = true;
                 role = tm.role
                 fullname = tm.fullname
                 location = tm.location
             }
         })
          if (exist != true) {
              errors.push({msg: 'Invalid email, please provide the email address used in inviting you'})
          }
          if (password.length < 8) {
              errors.push({msg: 'Password must be at least 8 characters'})
          }
          if (errors.length > 0) {
            res.render('./frontend/teamreg', {
                errors
            })
          } else {
              Team.findOne({ email: email, token: user.teamToken }).then(member => {
                  if (member) {
                      errors.push({ msg: 'You are already registered! Please login via your special route' })
                      res.render('./frontend/teamreg', {
                        errors
                    })
                  } else {
                      let newTeam = new Team({
                          email,
                          password,
                          token: user.teamToken,
                          role: role,
                          fullname: fullname,
                          location: location
                      })
                      newTeam.save()
                          .then(team => {
                            const msg = {
                                to: email,
                                from: 'contactus@flexyq.com',
                                subject: 'Your Login Link',
                                text: 'Hi',
                                html: `<h3>Hello ${fullname},</h3>  <p>This is your login link</p>  <p>Login via: https://${req.headers.host}/u/team-login/${team.token}`
                             };
                             sgMail.send(msg)
                             res.render('confirm', {
                                msg: 'You account has been created!',
                                desc: 'Please check your inbox for the special link we just sent you!'
                            })
                      })
                  }
              })
          }
      }
    });
});






//@Update User Settings
router.post('/update-profile', ensureAuthenticated, (req, res) => {
    const { first, last, biz } = req.body;

    User.findByIdAndUpdate(req.user._id, { 'first': first, 'last': last, 'biz': biz }, {useFindAndModify: false}, function(err, result){
        if (err) { return } 
    })
    req.flash('success_msg', 'Your Information(s) has been updated!');
    res.redirect('/u/profile')
})

//@ Login Handler
router.post('/login', (req, res, next) => {
    req.session.role = 'Admin'
    passport.authenticate('local', {
        successRedirect: '/u/trial',
        failureRedirect: '/u/login',
        failureFlash: true
    })(req, res, next);
});


//@Logout Handle
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/u/login');
})

//@ Comfirm Close Account
router.post('/delete-account', ensureAuthenticated, (req, res) => {
    User.findByIdAndRemove(req.user._id, {useFindAndModify: false}, (err, doc) => { if (err) throw err; res.redirect('/'); })
})




//@========== APPOINTEMENT USER REGISTRATION ====== @//
router.post('/register-appt-user', (req, res) => {
    const { fullname, email, phone, password } = req.body

    let errors = [];
    Booking.findOne({ email: email }).then(user => {
        if (user) {
            errors.push({ msg: 'Email already exisit' })
            res.send({msg: errors})
        } else {
            const newUBooking = new Booking({
                fullname,
                email,
                phone,
                password
            })
            newUBooking.save()
                .then(subuser => {
                    res.send({
                        user: subuser
                })
            })
        }
    })

})


router.post('/login-appt-user', (req, res) => {
    const { email, password } = req.body
    let errors = [];

    Booking.findOne({ email: email, password: password }).then(user => {
        if (!user) {
            errors.push({ msg: 'Incorrect password or email' })
            res.send({msg: errors})
        } else {
            res.send({user: user})
        }
        
    })
})
















//@============ FORGET PASSWORD ===============//

//@Forget password 
router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email}, function(err, user) {
          if (!user) {
          req.flash('error_msg', 'No account with that email address exists.');
            return res.redirect('/u/forgot');
          }
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
            const msg = {
                to: user.email,
                from: 'contactus@flexyq.com',
                subject: 'Password Recovery',
                text: 'Hey there',
                html: `You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process. https://${req.headers.host}/u/reset/${token} If you did not request this, please ignore this email and your password will remain unchanged.`,
             };
          sgMail.send(msg)
          req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          res.redirect('/u/forgot');
    }
    ], function(err) {
      console.log('this err' + ' ' + err)
      res.redirect('/');
    });
  });
  

//@Forget route
router.get('/forgot', (req, res) => {
    res.render('forgot', {
        User: req.user
    })
})

//@Reset Get Post
router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error_msg', 'Password reset token is invalid or has expired.');
        return res.redirect('/u/forgot');
      }
      res.render('reset', {
       User: req.user
      });
    });
  });
  
  
  //@Reset Post Route
  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user, next) {
          if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/');
          }
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
            //Hash Password
            bcrypt.genSalt(10, (err, salt) =>
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (err) throw err;
                    //Set Password to hashed
                    user.password = hash;
                    //Save User
                    user.save()
                        .then(user => {
                            req.flash('success_msg', 'Password changed!');
                            res.redirect('/u/login')
                    })
                    .catch(err => console.log(err))
                }));
          });
      },
  
    ], function(err) {
      res.redirect('/u/login');
    });
  });
//@======= END OF FORGET ========




module.exports = router;