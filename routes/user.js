const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')
//User model
const User = require('../modules/User');
const { ensureAuthenticated } = require('../config/auth');



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
            data: req.user.location
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
router.get('/billing', (req, res) => {
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

//@Create New Location
router.get('/new-location', ensureAuthenticated, (req, res) => {
    res.render('setup', {
        user: req.user,
        greet: 'Hi'
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
      data: req.user.location
    })
  })


  //@Get all locations
router.get('/places', ensureAuthenticated, (req, res) => {
    res.render('location', {
        user: req.user,
        locationList: req.user.location
    })
})

//@Team Page
router.get('/team', ensureAuthenticated, (req, res) => {
    res.render('team', {
        user: req.user,
        teams: req.user.team,
        data: req.user.location
    })
})

//@Analysis Page
router.get('/analysis', ensureAuthenticated, (req, res) => {
    res.render('stat', {
        user: req.user,
        points: req.user.location,
        visitors: req.user.visitors,
        team: req.user.team
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
    
    const { first, last, username, plan, plancode, subscribed, email, password, password2, locisadded} = req.body
    
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
            password2
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
                        password2
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
                        locisadded
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


//@ Update User Profile

//@Update User Settings
router.post('/update-profile', ensureAuthenticated, (req, res) => {
    const { first, last } = req.body;

    User.findByIdAndUpdate(req.user._id, { 'first': first, 'last': last }, {useFindAndModify: false}, function(err, result){
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



module.exports = router;