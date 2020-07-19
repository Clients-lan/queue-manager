const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const moment = require('moment')
const cron = require('node-cron')
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const User = require('../modules/User');
const Booking = require('../modules/Booking');
const Team = require('../modules/Team');

const { ensureAuthenticated } = require('../config/auth');



//@ Get Home - Inside App
router.get('/admin', ensureAuthenticated, (req, res) => {
   res.render('admin')
})


//@Location / Visit
router.get('/queue/:vpurl', (req, res) => {
  User.findOne({ 'location.vpurl': req.params.vpurl }, (err, data) => {
    res.render('visit', {
      data: data,
      url: req.params.vpurl
    })
 })
})


//@Confirm Route
router.get('/confirm', (req, res) => {
  res.render('confirm', {
    msg: '',
    desc: ''
  })
})


//@Static Pages
//Privacy Policy
router.get('/privacy-policy', (req, res) => {
  res.render('./frontend/static', {
    title: 'Privacy policy',
    forp: 'privacy'
  })
})

//Cookie
router.get('/cookie-policy', (req, res) => {
  res.render('./frontend/static', {
    title: 'Cookie Policy',
    forp: 'cookie'
  })
})
//Term of service
router.get('/terms-of-service', (req, res) => {
  res.render('./frontend/static', {
    title: 'Terms of Service',
    forp: 'service'
  })
})

//@ Join Queue
router.post('/join-queue', (req, res) => {
  const { locid, firstname, placename, phone, labels } = req.body;
  let newVisitor = { "firstname": firstname, "phone": phone, "labels": labels, "place": placename, "line": locid, "status": "Waiting", "timeused": null };
  User.findOneAndUpdate({ email: labels }, { $push: { visitors: newVisitor }}, {new: true}).exec((err, docs) => {
    if (err) { return }
    docs.visitors.forEach(nowuser => {
      if (nowuser.firstname === firstname && nowuser.phone == phone) {
          res.send({user: nowuser})
      }
    })
    if (docs) {
      res.status(200)
    }
  })
})

//@Update Visitor to Served
router.post('/finish-visitor', (req, res) => {
  const { id, label, timeused } = req.body;
  User.findOneAndUpdate({ email: label, "visitors._id": id },
    { $set: { "visitors.$.status": "Served", "visitors.$.timeused": timeused } }).exec((err, docs) => {
      if (!err) {
         res.send()
      } 
  })
})

//@ Add Visitors Via Admin
router.post('/add-vistor', (req, res) => {
  const { locid, firstname, place, phone, labels } = req.body;
  let newVisitor = { "firstname": firstname, "phone": phone, "labels": labels, "place": place, "line": locid, "status": "Waiting", "timeused": null };
  User.findOneAndUpdate({ email: labels }, { $push: { visitors: newVisitor }}, {new: true}).exec((err, docs) => {
    if (err) { return }
    docs.visitors.forEach(nowuser => {
      if (nowuser.firstname === firstname && nowuser.phone == phone) {
          res.send({user: nowuser})
      }
    })
    if (docs) {
      res.status(200)
    }
  })
})
//@Update Calendar
router.post('/update-calendar', ensureAuthenticated, (req, res) => {
  const { locid, sun, mon, tue, wen, thu, fri, sat } = req.body;
  const { sun2, mon2, tue2, wen2, thu2, fri2, sat2 } = req.body;

  let obje = { sun: sun, mon: mon, tue: tue, wen: wen, thu: thu, fri: fri, sat: sat}
  let obje2 = {sun: sun2, mon: mon2, tue: tue2, wen: wen2, thu: thu2, fri: fri2, sat: sat2 }

  User.findOne({email: req.user.email},{ location: 1}, (findOneErr, levelDocument)=>{
    if(findOneErr){return;}
    if(levelDocument){
      let toSet;
       levelDocument.location.map((levelData, levelIndex)=>{
         if (levelData._id == locid) {
          
           levelData.fweek.map((questionData, questionIndex) => {
            toSet = 'location.'+levelIndex+'.fweek'
                //Finaly Update it
                  User.updateOne({"location._id": levelData._id },
                    { $set: {[`${toSet}`]: obje } },(err, num) =>{
                      if (err) { return;} 
                    });
                });
           //Second week
           levelData.sweek.map((questionData, questionIndex)=>{
            toSet = 'location.'+levelIndex+'.sweek'
                //Finaly Update it
                  User.updateOne({"location._id": levelData._id },
                    { $set: {[`${toSet}`]: obje2 } },(err, num) =>{
                      if (err) { return;
                      } 
                   });
                });
              }
            });
        }
  });
    res.send()
})


//@Update Location
router.post('/update-location', ensureAuthenticated, (req, res) => {
  const { locid, title, num } = req.body;

  User.findOneAndUpdate({ email: req.user.email }, { $set: { "location.$[elem].name": title, "location.$[elem].num": num  } },
        { arrayFilters: [ { "elem._id": new mongoose.Types.ObjectId(locid)} ], new: true },
      ).exec((err, docs) => { if (err) { return }})
  res.send()
})

//@Update SMS
router.post('/update-sms', ensureAuthenticated, (req, res) => {
  const { locid, sms } = req.body;
  console.log(sms);
  
  User.findOneAndUpdate({ email: req.user.email }, { $set: { "location.$[elem].sms": sms } }, { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(locid) }], new: true }).exec((err, docs) => {
    if (err) { return }
  })
   res.send()
})

//@Update Estimated Time
router.post('/update-est-time', ensureAuthenticated, (req, res) => {
  const { locid, avgwt } = req.body;
  User.findOneAndUpdate({ email: req.user.email }, { $set: { "location.$[elem].avgwt": avgwt } }, { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(locid) }], new: true }).exec((err, docs) => {
    if (err) { return }
  })
   res.send()
})


//@Add Team
router.post('/add-teams', ensureAuthenticated, (req, res) => {
  const { locid, workemail, fullname, role, location } = req.body;
  let newTeam = { "workemail": workemail, "fullname": fullname, "location": location, "role": role, "locationId": locid, "token": req.user.teamToken };
  User.findOneAndUpdate({ email: req.user.email },{$push: { team: newTeam } }).exec((err, docs) => {
    if (!err) {
      let transporter = nodemailer.createTransport({
        host: 'smtp.office365.com', // Office 365 server
        port: 587,     // secure SMTP
        secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
        requireTLS: true,
        auth: {
            user: 'contactus@flexyq.com',
            pass: 'AXszr#$39!@'
        },
        tls: {
            ciphers: 'SSLv3'
        }
      });
      let mailOptions = {
        from: 'FlexyQ Queuing System',
        to: workemail,
        subject: 'Team Invitation',
        text: 'Hey there, you got an invitation', 
        html: `<h3>Hello ${fullname},</h3> <p>${req.user.first} from ${req.user.biz} invited you to join their FlexyQ team.</p>  <p>Login via: https://${req.headers.host}/u/team-signup/${req.user.teamToken}`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
      })
    //   const msg = {
    //     to: workemail,
    //     from: 'contactus@flexyq.com',
    //     subject: 'Invitation',
    //     text: 'Hi',
    //     html: `<h3>Hello ${fullname},</h3> <p>${req.user.first} from ${req.user.biz} invited you to join their FlexyQ team.</p>  <p>Login via: https://${req.headers.host}/u/team-signup/${req.user.teamToken}`
    //  };
    //   sgMail.send(msg)
    }
  })
  res.send()
});

//@Edit Team
router.post('/edit-team', ensureAuthenticated, (req, res) => {
  const { id, fullname, workemail, role, locationId, location } = req.body;
  User.findOneAndUpdate({ email: req.user.email, "team._id": id },
    {
      $set: {
        "team.$.fullname": fullname, "team.$.workemail": workemail,
        "team.$.role": role, "team.$.locationId": locationId, "team.$.location": location,
      }
    }).exec((err, docs) => {
      if (!err) {
         res.redirect('/u/team')
      } else {
        console.log(err);
        
      }
    })
  Team.findOneAndUpdate({ email: workemail, token: req.user.teamToken }, {'fullname': fullname, 'location': location, 'role': role, 'email': workemail}, (err, result) => {
    if (err) { return }
  })
})
//@Delete Team
router.post('/delete-team', ensureAuthenticated, (req, res) => {
  const { id, workemail } = req.body
  User.updateOne({ email: req.user.email }, { $pull: { team: { _id : id } } },{ safe: true }, (err, obj) => {
    if (err) { return } 
  });
  Team.findOneAndRemove({email: workemail}, {useFindAndModify: false}, (err, doc) => { if (err) throw err; })
  res.redirect('/u/team')
})

//@Save Location
router.post('/savelocation', ensureAuthenticated, (req, res) => {
  const { locname, locaddress, date, lat, lng, method } = req.body;
  let setHours = {"sun": "10:00", "mon": "12:00"}
  let newLocation = { "name": locname, "address": locaddress, "date": date, "lat": lat, "lng": lng, "sms": "it's your turn now. You can come in now!", "method": method, "fweek": [setHours], "sweek": [setHours] };
  
  User.findOneAndUpdate({ email: req.user.email}, { $push: { location: newLocation }, locisadded: 'true' },  {useFindAndModify: false}).then(log => {})
  res.send()
});


//@Delete Location
router.post('/delete-location', ensureAuthenticated, (req, res) => {
  const { locid } = req.body;
  User.findOne({ email: req.user.email }, { 'location': { $elemMatch: { _id: locid } } }, (err, data) => {
    if (err) {
      return;
    } else {
      //@Remove from Location
       User.updateOne({ email: req.user.email }, { $pull: { location: { _id : locid } } },{ safe: true }, (err, obj) => {
           if (err) { return } 
       });
       res.redirect('/u/places')
    }
  })
})



//@==Save Slot====

//@Personalize
router.post('/save-slot-personalized', ensureAuthenticated, (req, res) => {

  let { week, slot, perday } = req.body
 
  slot = slot.split(',');
  for (let i = 0; i < slot.length; i++){
    let personalizedSlot = { "time": slot[i], "day": week };
    User.updateMany({ email: req.user.email }, { $push: { slot: personalizedSlot } }, { new: true }, (err, slots) => { })
  }

  
    //@Update Frequency
    if (week == 'Mon') {
      User.findByIdAndUpdate(req.user._id, { 'monspday': perday }, (err, res) => { if (err) return; })
    } else if (week == 'Tue') {
      User.findByIdAndUpdate(req.user._id, { 'tuespday': perday }, (err, res) => { if (err) return; })
    } else if (week == 'Wed') {
      User.findByIdAndUpdate(req.user._id, { 'wenspday': perday }, (err, res) => { if (err) return; })
    } else if (week == 'Thu') {
      User.findByIdAndUpdate(req.user._id, { 'thuspday': perday }, (err, res) => { if (err) return; })
    } else if (week == 'Fri') {
      User.findByIdAndUpdate(req.user._id, { 'frispday': perday }, (err, res) => { if (err) return; })
    } else if (week == 'Sat') {
      User.findByIdAndUpdate(req.user._id, { 'satspday': perday }, (err, res) => { if (err) return; })
    } else {
      User.findByIdAndUpdate(req.user._id, { 'sunspday': perday }, (err, res) => { if (err) return; })
    }
    
   req.flash('success_msg', 'Custom slot saved!');
   res.redirect('/u/slots')
})


//@Calculate Automatically
router.post('/save-slot', ensureAuthenticated, (req, res) => {
  let { week, start, stop, min, duration, perday } = req.body;
  let user = req.user

  parseInt(stop) + 1
    // User.findOneAndUpdate({ email: user.email }, { $push: { slot: newSlot }}, {useFindAndModify: false}).exec((err, docs) => {
    //   if (!err) {
    //     req.flash('success_msg', 'Slot saved!');
    //     res.redirect('/u/slots')
    //   }
    // })
    
 
    function tConvert (time) {
      // Check correct time format and split into components
      time = time.toString ().match (/^([01]?\d|2[0-3])(:)([0-5]?\d)(:[0-5]?\d)?$/) || [time];

      if (time.length > 1) { // If time format correct
          time = time.slice (1);  // Remove full string match value
          time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
          time[0] = +time[0] % 12 || 12; // Adjust hours
      }
      return time.join (''); // return adjusted time or original string
      }
       
        

      


        while(parseInt(start) < parseInt(stop)){
         // let originalTime = tConvert(`${parseInt(start)}:${min}`)
          let originalTime = ((tConvert(`${parseInt(start)}:${min}`).length == '7') ? '0' + tConvert(`${parseInt(start)}:${min}`) : tConvert(`${parseInt(start)}:${min}`))

           let defaultSlot = { "time": originalTime, "day": week };

          let afterOrigin;
            if(duration != 60){
           
              if(duration == 30 && min == 30){
               // afterOrigin = tConvert(`${parseInt(start) + 1}:${'00'}`)
                afterOrigin = ((tConvert(`${parseInt(start) + 1}:${'00'}`).length == '7') ? '0' + tConvert(`${parseInt(start) + 1}:${'00'}`) : tConvert(`${parseInt(start) + 1}:${'00'}`))
              } else if(duration == 30 && min == 00){
               // afterOrigin = tConvert(`${parseInt(start)}:${'30'}`)
                afterOrigin = ((tConvert(`${parseInt(start)}:${'30'}`).length == '7') ? '0' + tConvert(`${parseInt(start)}:${'30'}`) : tConvert(`${parseInt(start)}:${'30'}`))
              } else if(duration == 30 && min == 15){
               // afterOrigin = tConvert(`${parseInt(start)}:${parseInt(duration) + parseInt(min)}`)
                afterOrigin = ((tConvert(`${parseInt(start)}:${parseInt(duration) + parseInt(min)}`).length == '7') ? '0' + tConvert(`${parseInt(start)}:${parseInt(duration) + parseInt(min)}`) : tConvert(`${parseInt(start)}:${parseInt(duration) + parseInt(min)}`))

              }
                let _30minsSlot = { "time": afterOrigin, "day": week };

                User.updateMany({ email: user.email }, { $push: { slot: defaultSlot } }, { new: true }, (err, slots) => {})
                User.updateMany({ email: user.email }, { $push: { slot: _30minsSlot } }, { new: true }, (err, slots) => {})
            } else {
              //@For One Hours Slots
              User.updateMany({ email: user.email }, { $push: { slot: defaultSlot } }, { new: true }, (err, slots) => {})
            }
    
            parseInt(start++)
        }


    // while(start < stop){
    //   let d = tConvert(`${start}:${min}`)
    //   let newSlot = { "time": d, "day": week };

    //   User.updateMany({ email: user.email }, { $push: { slot: newSlot } }, { new: true }, (err, slots) => {})


    //    // console.log(d);
        
    //     start++;
    // }


    //@Update Frequency
    if (week == 'Mon') {
      User.findByIdAndUpdate(req.user._id, { 'monspday': perday }, (err, res) => { if (err) return; })
    } else if (week == 'Tue') {
      User.findByIdAndUpdate(req.user._id, { 'tuespday': perday }, (err, res) => { if (err) return; })
    } else if (week == 'Wed') {
      User.findByIdAndUpdate(req.user._id, { 'wenspday': perday }, (err, res) => { if (err) return; })
    } else if (week == 'Thu') {
      User.findByIdAndUpdate(req.user._id, { 'thuspday': perday }, (err, res) => { if (err) return; })
    } else if (week == 'Fri') {
      User.findByIdAndUpdate(req.user._id, { 'frispday': perday }, (err, res) => { if (err) return; })
    } else if (week == 'Sat') {
      User.findByIdAndUpdate(req.user._id, { 'satspday': perday }, (err, res) => { if (err) return; })
    } else {
      User.findByIdAndUpdate(req.user._id, { 'sunspday': perday }, (err, res) => { if (err) return; })
    }

  
    
      req.flash('success_msg', 'Slot saved!');
      res.redirect('/u/slots')
    
})

//@Delete Slot
router.post('/delete-slot', ensureAuthenticated, (req, res) => {
  const { id } = req.body
  User.updateOne({ email: req.user.email }, { $pull: { slot: { _id : id } } },{ safe: true }, (err, obj) => {
    if (err) { return } 
  });
  req.flash('success_msg', 'Slot deleted!');
  res.redirect('/u/slots')
})

//@Update Booking page Link
router.post('/save-booking-url', ensureAuthenticated, (req, res) => {
  const { link, alert } = req.body
  User.findByIdAndUpdate(req.user._id, { 'bookinglink': `${link}${uuidv4()}`, 'bookingalert': alert }, { useFindAndModify: false }, function (err, result) {
      if (err) { return } 
  })
  res.redirect('/u/appointment')
})

//@ Appointees books from page
router.post('/reverse-space', (req, res) => {
  const { emailid, name, email, phone, bizname, url, time, location, rdate } = req.body;
  
  const uuidRef = uuidv4()

  if (time != '' && time != "" && email != "" && email != '') {
    let newAppt = { "name": name, "phone": phone, "email": email, "location": location, "rdate": rdate, "status": 'scheduled', "time": time, "oneid": uuidRef };
    let clientAppt = { "ref": emailid, "time": time, "status": 'scheduled', "rdate": rdate, "location": location, "bizname": bizname, "url": url, "oneid": uuidRef };

   //@Svae to Admin DB
    User.findOneAndUpdate({ email: emailid }, { $push: { book: newAppt } }, { new: true }).exec((err, docs) => {
      if (err) { return } 
      if (docs.bookingalert == 'Yes') {
        const msg = {
          to: emailid,
          from: 'contactus@flexyq.com',
          subject: 'Appointment Alert',
          text: 'Hi',
          html: `Hi, ${name} has scheduled an appointement at ${time}`,
       };
        sgMail.send(msg)
      }
    })

    //@Save to Client DB too
    Booking.findOneAndUpdate({ email: email }, { $push: { book: clientAppt }}, {new: true}).exec((err, doc) => {
      if (err) { return } 
      res.send({ data: doc })
    })
   
    
  } else {
    res.send({err: 'Missing fields'})
  }
})

//@Booking page
router.get('/appt/:url', (req, res) => {
  User.findOne({ 'bookinglink': req.params.url }).then(data => {
    if (data) {
      res.render('./frontend/appt', {
        data: data,
        url: req.params.url
      })
    }
  })  
})


//@Cancel Appointment
router.post('/cancel-appt', ensureAuthenticated, (req, res) => {
  const { id, oneid, uemail } = req.body
  User.findOneAndUpdate({ email: req.user.email }, { $set: { "book.$[elem].status": 'cancelled' } }, { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(id) }], new: true }).exec((err, docs) => {
    if (err) { return }
  })
  Booking.findOneAndUpdate({ email: uemail }, { $set: { "book.$[elem].status": 'cancelled' } }, { arrayFilters: [{ "elem.oneid": oneid }], new: true }).exec((err, docs) => {
    if (err) { return }
  })
  res.redirect('/u/appointment')
})

//@Delete Appointment Admin
router.post('/delete-appt', ensureAuthenticated, (req, res) => {
  const { id, uemail } = req.body
  User.updateOne({ email: req.user.email }, { $pull: { book: { oneid : id } } },{ safe: true }, (err, obj) => {
    if (err) { return } 
  });
  Booking.updateOne({ email: uemail }, { $pull: { book: { oneid : id } } },{ safe: true }, (err, obj) => {
    if (err) { throw err } 
  });
  res.redirect('/u/appointment')
})


//@Get All bookings // Appt frontpage
router.post('/get-bookings', (req, res) => {
  const { emailid } = req.body
  User.findOne({ email: emailid }).then(user => {
    if (user) {
     res.send({data: user})
    }
  })
})

//@Delete Appt frontend
router.post('/delete-appt-client', (req, res) => {
  const { id, ref, uemail } = req.body
  Booking.updateOne({ email: uemail }, { $pull: { book: { oneid : id } } },{ safe: true }, (err, obj) => {
    if (err) { throw err } 
  });
  User.updateOne({ email: ref }, { $pull: { book: { oneid : id } } },{ safe: true }, (err, obj) => {
    if (err) { throw err } 
  });
  res.send()
})


//@Delete Appt ON AUTO
cron.schedule('55 23 * * *', () => {
  User.find((err, doc) => {
    for (let i = 0; i < doc.length; i++){
      doc[i].book.forEach(b => {
        let date = new Date(b.rdate)
        let momentO = moment(date)
        let momentB = momentO.format('YYYY-MM-DD')
        let days = moment().diff(momentB, 'days');
      //  console.log(`${b}, ${days}`);
        if (days == 1) {
          User.updateMany({}, { $pull: { book: { _id: b._id } } }, { safe: true }, (err, del) => {})
        }
      })
    }
  })
})









//@ ===========================================================================
//========================================================================

//STRIPE =============================== @//
router.get('/public-key', (req, res) => {
  res.send({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

router.post('/create-customer', ensureAuthenticated, async (req, res) => {
  // This creates a new Customer and attaches
  // the PaymentMethod to be default for invoice in one API call.
  const customer = await stripe.customers.create({
    payment_method: req.body.payment_method,
    email: req.body.email,
    invoice_settings: {
      default_payment_method: req.body.payment_method
    }
  });
  // At this point, associate the ID of the Customer object with your
  // own internal representation of a customer, if you have one.
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan: req.user.plancode }],
    expand: ['latest_invoice.payment_intent'],
    trial_period_days: 14,
  });
    res.send(subscription);
    const sub = subscription.id;
    const cus = subscription.customer;
    const uid = req.user._id

    User.findByIdAndUpdate(uid,{ 'sub': sub, 'customer': cus }, {useFindAndModify: false}, function(err, result){
      if (err) {
          return
      } 
  })
});

router.post('/subscription', async (req, res) => {
  let subscription = await stripe.subscriptions.retrieve(
    req.body.subscriptionId
  );
    res.send(subscription);
});

//@Update Paid Status
router.post('/update-paid', ensureAuthenticated, (req, res) => {
  const { id, status } = req.body;
  User.findByIdAndUpdate(id,{ 'subscribed': status }, {useFindAndModify: false}, function(err, result){
      if (err) {
          return
      } 
  })
  res.send({ event: true})
})


//@Update to Starter
router.post('/upgrade/starter', ensureAuthenticated, async (req, res) => {
  const subId = req.user.sub;
  const uid = req.user._id;

  const subscription = await stripe.subscriptions.retrieve(subId);
  stripe.subscriptions.update(subId, {
  cancel_at_period_end: false,
  proration_behavior: 'create_prorations',
  items: [{
      id: subscription.items.data[0].id,
      plan: 'plan_HDYy3VlOapvguc',
  }]
  });
  User.findByIdAndUpdate(uid, { 'sub': subscription.id, 'plan': 'Starter', 'plancode': 'plan_HDYy3VlOapvguc' }, {useFindAndModify: false}, (err, rs) => {
      if (err) { return } 
  })
  res.redirect('/u/dashboard')
})


//@Cancel Plan
router.post('/cancel-plan', ensureAuthenticated, (req, res) => {
  const sub = req.user.sub;
  const id = req.user._id
  User.findByIdAndUpdate(id,{ 'subscribed': 'false' }, {useFindAndModify: false}, (err, result) => {
      if (err) { return } 
      stripe.subscriptions.del(sub);
  })
  res.redirect('/u/dashboard')
})



//@WebHooks
router.post('/stripe-webhook', async function (req, res) {
  console.log('/webhooks POST route hit! req.body: ', req.body)

  let { data, type } = req.body
  let { previous_attributes, object } = data

  console.log('Data ' + previous_attributes);
  console.log('Object ' + object);

  try {
      if ('status' in previous_attributes
          && type === 'customer.subscription.updated'
          && previous_attributes.status === 'active'
          && object.status === 'past_due') {
          console.log("subscription payment has failed! Subscription id: ", object.id)

          let customer_id = object.customer
          let product_id = object.plan.product
          // https://stripe.com/docs/api/subscriptions/object

          let customer_object = await stripe.customers.retrieve(
              customer_id,
              { expand: ["default_source"] }
          )

          let product_object = await stripe.products.retrieve(
              product_id
          )

          let customer_email = customer_object.email
          // https://stripe.com/docs/api/customers/object
         let product_name = product_object.name
          // https://stripe.com/docs/api/service_products/object
         let plan_name = object.plan.nickname
          // https://stripe.com/docs/api/plans

          // Nodemailer configuration
        //@======Perform Actions========================
        const msg = {
            to: customer_email,
            from: 'contactus@flexyq.com',
            subject: 'Your subscription payment has failed!',
            text: 'Hey there',
            html: `<p>An automatic payment for your subscription to FlexyQ has failed. `
            + `Please log in and update your payment information to ensure your subscription remains valid.</p>`
        };
        sgMail.send(msg)

        //@Change status to false
        User.findOneAndUpdate({email: customer_email}, { 'subscribed': null }, {useFindAndModify: false}, function(err, result){
          if (err) { return } 
      })
        
          
        //@End of perferm actions
          res.sendStatus(200)
      }
      else {
          res.sendStatus(200)
      }
  }
  catch (err) {
      console.log("webhook error: ", err)
      res.sendStatus(200)
  }
})



//@ ========== END STRIPE ==========================



//@Update Planner
router.post('/update-planner', ensureAuthenticated, (req, res) => {
  const { locid, header, subheader, notes, vpurl, adminmail, adminphone, allowqueue, maxnum, msg } = req.body;
  User.findOne({ 'location.vpurl': vpurl }).then(url => {
    if (url) {
      User.findOneAndUpdate({ email: req.user.email },
        {
          $set: {
            "location.$[elem].header": header, "location.$[elem].subheader": subheader, "location.$[elem].notes": notes,
            "location.$[elem].adminmail": adminmail, "location.$[elem].adminphone": adminphone, "location.$[elem].allowqueue": allowqueue,
            "location.$[elem].maxnum": maxnum, "location.$[elem].msg": msg
          }
        },
          { arrayFilters: [ { "elem._id": new mongoose.Types.ObjectId(locid)}], new: true },
          ).exec((err, docs) => {
            if (err) {
              res.status(404); res.send()
            } else {
              res.status(201); res.send()
            }
          })
    } else {
      User.findOneAndUpdate({ email: req.user.email },
        {
          $set: {
            "location.$[elem].header": header, "location.$[elem].subheader": subheader, "location.$[elem].notes": notes, "location.$[elem].vpurl": vpurl,
            "location.$[elem].adminmail": adminmail, "location.$[elem].adminphone": adminphone, "location.$[elem].allowqueue": allowqueue, "location.$[elem].requiredemail": requiredemail,
            "location.$[elem].requiredphone": requiredphone, "location.$[elem].msg": msg
          }
        },
          { arrayFilters: [ { "elem._id": new mongoose.Types.ObjectId(locid)}], new: true },
          ).exec((err, docs) => {
            if (err) {
              res.status(404); res.send()
            } else {
              res.status(200); res.send()
            }
          })
    }
  })
})



//@Cancel Plan
router.post('/cancel-plan', ensureAuthenticated, (req, res) => {
    const sub = req.user.sub;
    const id = req.user._id
    User.findByIdAndUpdate(id,{ 'subscribed': 'false' }, {useFindAndModify: false}, (err, result) => {
        if (err) { return } 
        stripe.subscriptions.del(sub);
    })
    res.redirect('/')
})


//@Get Home Page
router.get('/', (req, res) => {
    res.render('./frontend/home')
})

//@Get Pricing Page
router.get('/plans', (req, res) => {
  res.render('./frontend/pricepage')
})








module.exports = router;