const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')
//User model
const User = require('../modules/User');
const { ensureAuthenticated } = require('../config/auth');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const async = require('async')
const crypto = require('crypto')



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
            vil: req.user.visitors
        })
    } else {
        res.redirect('/plans')
    }
})

//@ User Profile Page
router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user })
})

//@User Billing Page
router.get('/billing', ensureAuthenticated, (req, res) => {
    res.render('billing', { user: req.user })
})

//@Trial Page -- Subscription
router.get('/trial', ensureAuthenticated, (req, res) => {
    if (req.user.subscribed == 'false' || req.user.subscribed == null) {
        res.render('sub', { user: req.user })
    } else { 
        res.redirect('/u/setup')
    }
})

//@Aouth Route
router.get('/aouth', ensureAuthenticated, (req, res) => {
    res.render('aouth', {
        user: req.user
    })
})

//@Create New Location
router.get('/new-location', ensureAuthenticated, (req, res) => {
    res.render('setup', {
        user: req.user,
        greet: 'Hi'
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
    res.render('slot', {
        user: req.user,
        slots: req.user.slot
    })
})

//@ See Location Settings
router.get('/location/:_id', ensureAuthenticated, (req, res) => {
    res.render('singlelocation', {
        user: req.user,
        verify: req.params._id,
        locationList: req.user.location,
        teams: req.user.team
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
    if (req.user.onepass != "null") {
        res.render('location', {
            user: req.user,
            locationList: req.user.location
        })
    } else {
        res.redirect('/u/aouth')
    }
})

//@Team Page
router.get('/team', ensureAuthenticated, (req, res) => {
    res.render('team', {
        user: req.user,
        teams: req.user.team,
        data: req.user.location,
    })
})

//@Analysis Page
router.get('/analytics', ensureAuthenticated, (req, res) => {
    res.render('stat', {
        user: req.user,
        points: req.user.location,
        visitors: req.user.visitors,
        team: req.user.team,
        cd: new Date().getDate()
    })
})

//@Login Page & Registration Page
router.get('/login', (req, res) => res.render('login'))
router.get('/register', (req, res) => {
    res.render('register', {
        plan: 'Starter',
        plancode: 'plan_HDYy3VlOapvguc'
    })
})


//@Register Handle
router.post('/register', (req, res) => {
    
    const { first, last, onepass, username, plan, plancode, subscribed, email, password, password2, locisadded} = req.body
    
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
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at less 6 characters' })
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
            onepass
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
                        onepass
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
                        password2,
                        onepass
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
                                    req.flash('success_msg', 'You are now registered and can login');
                                    res.redirect('/u/login')
                                })
                            .catch(err => console.log(err))
                        }));
                }
            });
    }
});



//@Update Access Code
router.post('/aouth', ensureAuthenticated, (req, res) => {
    User.findByIdAndUpdate(req.user._id,{ 'onepass': req.body.onepass }, {useFindAndModify: false}, (err, docs) => {
        if (err) {return} 
    })
    res.redirect('/u/profile')
  })

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
                from: 'anthonylannn@gmail.com',
                subject: 'Password Recovery',
                text: 'Hey there',
                html: `You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process. http://${req.headers.host}/u/reset/${token} If you did not request this, please ignore this email and your password will remain unchanged.`,
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
        console.log(user);
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