// requires
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const env = require('dotenv').config({ path: './.env' });
const socketio = require('socket.io')
const http = require('http')

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
 // console.log('New Connection...');
  

  socket.emit('message', 'Welcome')
  //@Broadcast
  socket.broadcast.emit('message', 'A user was add')

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left the chat')
  })
  socket.emit('added', isadded => {
    console.log(isadded);
  })

  //io.emit()

  //@Lister for Queue Joined
  socket.on('userAdded', (added) => {
    io.emit('added', added)
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


//@Connect To Database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://allioxsh:AL2020@ds143614.mlab.com:43614/allio', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Mongoose Connected...'))
.catch(err => console.log(err))





//@SMS NEXMO
const Nexmo = require('nexmo');
const { log } = require('console');
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
          console.log('Queried!');
          
          res.send({location: real, data: data})
        }
      })
    }
  })
})


// app.get('/send', (req, res) => {

// const from = 'NexmO'
// const to = '393510378070'
// const text = 'A text message sent using the Nexmo SMS API'

// nexmo.message.sendSms(from, to, text, (err, responseData) => {
//     if (err) {
//         console.log(err);
//     } else {
//         if(responseData.messages[0]['status'] === "0") {
//             console.log("Message sent successfully.");
//         } else {
//             console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
//         }
//     }
// })
//   res.send()
// })

//@Update Visitor
app.post('/serve-visitor', (req, res) => {
  const { locationId, visitorId, visitorLabel } = req.body;
  User.findOneAndUpdate({ email: visitorLabel, "visitors._id": visitorId },
    { $set: { "visitors.$.status": "Serving" } }).exec((err, docs) => {
      if (err) {
        console.log(err);
      } else {
        docs.visitors.forEach((doc) => {
          if (doc.line == locationId && doc._id == visitorId) {
            docs.location.forEach(smsText => {
              if (smsText._id == locationId) {
            
                const to = doc.phone;
                const from = `Flex-Q from ${smsText.name}`;
                const text = `Hello ${doc.firstname}, ${smsText.sms}`//smsText.sms;
                //@Send SMS
                 nexmo.message.sendSms(from, to, text, {type: 'unicode'}, (err, responseData) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if(responseData.messages[0]['status'] === "0") {
                            console.log('Message sent successfully. ');
                        } else {
                            console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                      }
                    }
                })
              }
            })
            res.send({ data: doc })
          }
        })
     }
  })
})

//@Update Visitor to Served
app.post('/finish-visitor', (req, res) => {
  const { id, label, timeused } = req.body;
  User.findOneAndUpdate({ email: label, "visitors._id": id },
    { $set: { "visitors.$.status": "Served", "visitors.$.timeused": timeused } }).exec((err, docs) => {
      if (!err) {
         res.send()
      } 
  })
})


app.post('/text-user', (req, res) => {
  const { phone, text } = req.body;

  const from = `Flex-Q`;
  //@Send SMS
   nexmo.message.sendSms(from, phone, text, {type: 'unicode'}, (err, responseData) => {
      if (err) {
          console.log(err);
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



const PORT = process.env.PORT || 9002;
// listener
server.listen(PORT, function () {
    console.log(`listening on ${PORT}`);
});