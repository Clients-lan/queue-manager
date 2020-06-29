// requires
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const socketio = require('socket.io')
const http = require('http')
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const app = express();
const server = http.createServer(app)
const io = socketio(server)
//Passport config
require('./config/passport')(passport);

//User model
const User = require('./modules/User');
const { ensureAuthenticated } = require('./config/auth');


//@Run When clients connects
io.on('connection', socket => {
  socket.on('emiting', (data) => {
    socket.emit('emiting', data)
    socket.broadcast.emit('emiting', data)
  })
})

//@EJS Template Engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

//@Middelware & Static Folder
app.use(express.static(`${__dirname}/public`));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({}));


//Express Session Middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));

// Passport middle ware
app.use(passport.initialize());
app.use(passport.session())

//Connect flash
app.use(flash());

//Global Variables
app.use((req, res, next) => {
  res.locals.error_msg = req.flash('error_msg');
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error = req.flash('error');
  next();
})


//@Routes
app.use('/', require('./routes/index'));
app.use('/u', require('./routes/user'));


//@App name
const appName = 'Flexy Queue'

//@Connect To Database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://flexyqdbadmin:AeY3Ft!G$N@ds213255.mlab.com:13255/heroku_f7k8rfn3', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log(`${appName} Mongoose Connected...`))
.catch(err => console.log(err))




//@SMS NEXMO
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: '229aae5a',
  apiSecret: process.env.NEX_KEY,
});


//@Query Visitors and check
app.post('/query-visitors', (req, res) => {
  User.findOne({ email: req.body.email, 'location._id': req.body.locid }, (err, data) => {
    if (!err) {
      data.location.forEach(real => {
        if (real._id == req.body.locid) {
          res.send({location: real, data: data})
        }
      })
    }
  })
})


//@Update Visitor
app.post('/serve-visitor', (req, res) => {
  const { vsid, phone, email } = req.body;
  User.findOneAndUpdate({ email: email, "visitors._id": vsid },
    { $set: { "visitors.$.status": "Serving" } }).exec((err, docs) => {
      if (!err) {
        const from = '15065031886'
        const to = phone
        const text = 'A text message sent using the Nexmo SMS API'

        nexmo.message.sendSms(from, to, text, (err, responseData) => {
            if (err) {
                console.log(err);
            } else {
                if(responseData.messages[0]['status'] === "0") {
                    console.log("Message sent successfully.");
                } else {
                    console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                }
            }
        })
        res.status(200)
        res.send()
     }
  })
})


//@Text user // Using custom form/msg
app.post('/text-user', (req, res) => {
  const { phone, text } = req.body;
  const from = '15065031886';
  //@Send SMS
   nexmo.message.sendSms(from, phone, text, {type: 'unicode'}, (err, responseData) => {
      if (err) {
        console.log(err);
        return
      } else {
          if(responseData.messages[0]['status'] === "0") {
            console.log('Message sent successfully. ');
            res.status(201)
          } else {
              console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
        }
      }
  })
  res.send()
})


//@Call in User for the Appointment they booked
app.post('/call-appt', ensureAuthenticated, (req, res) => {
  const { phone, name, id } = req.body;
  const from = '15065031886';
  const text = `Hello ${name}, you're next! Please proceed into the location.`
  //@Send SMS
   nexmo.message.sendSms(from, phone, text, {type: 'unicode'}, (err, responseData) => {
     if (err) {
       console.log(err);
       return
      } else {
          if(responseData.messages[0]['status'] === "0") {
            console.log('Message sent successfully. ');
           //@Change Status
           User.findOneAndUpdate({ email: req.user.email }, { $set: { "book.$[elem].status": 'called' } }, { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(id) }], new: true }).exec((err, docs) => {
            if (err) { console.log(err);
             }
          })
            req.flash('success_msg', 'Slot saved!');
          } else {
            console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
             //@Change Status
            User.findOneAndUpdate({ email: req.user.email }, { $set: { "book.$[elem].status": 'failed' } }, { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(id) }], new: true }).exec((err, docs) => {
              if (err) { console.log(err); }
            })
        }
      }
   })
  res.redirect('/u/appointment')
})


//@Check for user appointment
app.post('/check-appt-client', (req, res) => {
  const { emailid, phone, email } = req.body;
  User.findOne({ email: emailid, 'book.phone': phone, 'book.email': email }).then(user => {
    if (user) {
      res.render('confirm', {
        msg: 'Location owner has been alerted' 
      })
      user.book.forEach(bo => {
        if (bo.phone === phone && bo.email === email) {
          User.findOneAndUpdate({ email: emailid }, { $set: { "book.$[elem].status": 'online' } }, { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(bo._id) }], new: true }).exec((err, docs) => {
            if (err) { return }
          })
          const from = '15065031886'; 
          const text = `Hello, ${bo.name} who has an appointment has checked in. Please login to FlexyQ and invite them in`;
          //@Send SMS
           nexmo.message.sendSms(from, phone, text, {type: 'unicode'}, (err, responseData) => {
             if (err) {
               console.log(err);
               return
              } else {
                  if(responseData.messages[0]['status'] === "0") {
                    console.log('Message sent successfully. ');
                   //@Change Status
                   User.findOneAndUpdate({ email: emailid }, { $set: { "book.$[elem].status": 'called' } }, { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(id) }], new: true }).exec((err, docs) => {
                    if (err) { return }
                  })
                  } else {
                      console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                }
              }
           })
        }
      })
    } else {
      res.render('confirm', {
        msg: 'Opps! The number and/or email you inserted does not match what you booked the appointment with'
      })
    }
  })
})







const PORT = process.env.PORT || 9002;
// listener
server.listen(PORT, function () {
    console.log(`listening on ${PORT}`);
});