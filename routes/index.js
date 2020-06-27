const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const env = require('dotenv').config({ path: './.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const User = require('../modules/User');
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



//@Add Visitors Via Planner Page
// router.post('/join-queue', (req, res) => {
//   const { locid, firstname, phone, labels } = req.body;
//   if (firstname != '' && phone != '') {
//     let newVisitor = { "firstname": firstname, "phone": phone, "labels": labels, "line": locid, "status": "Waiting", "timeused": null };

//     User.findOneAndUpdate({ email: labels }, {$push: { visitors: newVisitor } },
//     ).exec((err, docs) => {
//       if (err) {
//         return
//       }
//       res.send({rt: docs})
//     })
//   }
// })

//@ Join Queue
router.post('/join-queue', (req, res) => {
  const { locid, firstname, placename, phone, labels } = req.body;
  let newVisitor = { "firstname": firstname, "phone": phone, "labels": labels, "place": placename, "line": locid, "status": "Waiting", "timeused": null };
  User.findOneAndUpdate({ email: labels }, { $push: { visitors: newVisitor }}, {new: true}).exec((err, docs) => {
    if (err) { return }
    docs.visitors.forEach(nowuser => {
      if (nowuser.firstname === firstname && nowuser.phone == phone) {
          console.log(nowuser);
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
          console.log(nowuser);
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
  let newTeam = { "workemail": workemail, "fullname": fullname, "location": location, "role": role, "locationId": locid };
  User.findOneAndUpdate({ email: req.user.email },{$push: { team: newTeam } }).exec((err, docs) => {
    if (!err) {
      const msg = {
        to: workemail,
        from: 'anthonylannn@gmail.com',
        subject: 'Invitation',
        text: 'Hi',
        html: `Hey ${fullname}, ${req.user.first} invited you to joined their team. Here is the login email and password: ${req.user.email} => ${req.user.password2} here is the login link: http://${req.headers.host}/u/login`,
     };
      sgMail.send(msg)
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
})
//@Delete Team
router.post('/delete-team', ensureAuthenticated, (req, res) => {
  const { id } = req.body
  User.updateOne({ email: req.user.email }, { $pull: { team: { _id : id } } },{ safe: true }, (err, obj) => {
    if (err) { return } 
  });
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

//@Temporary aOuth Admin
router.post('/aouth-admin', ensureAuthenticated, (req, res) => {
  User.findOne({ email: req.user.email }).then(user => {
    if (user) {
      //@Pass first step
      if (user.onepass == req.body.onepasser) {
        console.log('Is admin');
        res.send()
      } else {
        console.log('is not admin');
        res.redirect('/u/dashboard')
      }
    }
  }) 
})

//@Save Slot
router.post('/save-slot', ensureAuthenticated, (req, res) => {
  const { week, slotone, slottwo } = req.body;
  let user = req.user
  let slots = req.user.slot

  let errors = []
  if (slotone == '' || slottwo == '') {
    errors.push({msg: 'Fields can not be empty!'})
  }
  if (errors.length > 0) {
    res.render('slot', {
      errors,
      week,
      slotone,
      slottwo,
      user,
      slots
    })
  } else {
    let newSlot = { "time": `${slotone} - ${slottwo}`, "day": week };
    User.findOneAndUpdate({ email: user.email }, { $push: { slot: newSlot }}, {useFindAndModify: false}).exec((err, docs) => {
      if (!err) {
        req.flash('success_msg', 'Slot saved!');
        res.redirect('/u/slots')
      }
    })
  }

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
  const { link } = req.body
  User.findByIdAndUpdate(req.user._id, { 'bookinglink': `${link}${uuidv4()}` }, { useFindAndModify: false }, function (err, result) {
      if (err) { return } 
  })
  res.redirect('/u/appointment')
})

//@ Appointees books from page
router.post('/reverse-space', (req, res) => {
  const { emailid, name, email, phone, time, location } = req.body;
  if (time != '' || time != "") {
    let newAppt = { "name": name, "phone": phone, "email": email, "location": location, "status": 'offline', "time": time };
    User.findOneAndUpdate({ email: emailid }, { $push: { book: newAppt }}, {new: true}).exec((err, docs) => {
      if (err) { return } 
      res.render('confirm', {
        msg: 'Your booking was successful!'
      })
      const msg = {
        to: emailid,
        from: email,
        subject: 'Appointment Alert',
        text: 'Hi',
        html: `Hi, ${name} has scheduled an appointement at ${time}`,
     };
      sgMail.send(msg)
    })
  } else {
    res.render('confirm', {
      msg: 'Opps! Missing field'
    })
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
  const { id } = req.body
  User.findOneAndUpdate({ email: req.user.email }, { $set: { "book.$[elem].status": 'cancelled' } }, { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(id) }], new: true }).exec((err, docs) => {
    if (err) { return }
  })
  res.redirect('/u/appointment')
})

//@Delete Appointment
router.post('/delete-appt', ensureAuthenticated, (req, res) => {
  const { id } = req.body
  User.updateOne({ email: req.user.email }, { $pull: { book: { _id : id } } },{ safe: true }, (err, obj) => {
    if (err) { return } 
  });
  res.redirect('/u/appointment')
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
    expand: ['latest_invoice.payment_intent']
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

//@ ========== END STRIPE ==========================



//@Update Planner
router.post('/update-planner', ensureAuthenticated, (req, res) => {
  const { locid, header, subheader, notes, vpurl, adminmail, adminphone, allowqueue, requiredemail, requiredphone, msg } = req.body;
  User.findOne({ 'location.vpurl': vpurl }).then(url => {
    if (url) {
      User.findOneAndUpdate({ email: req.user.email },
        {
          $set: {
            "location.$[elem].header": header, "location.$[elem].subheader": subheader, "location.$[elem].notes": notes,
            "location.$[elem].adminmail": adminmail, "location.$[elem].adminphone": adminphone, "location.$[elem].allowqueue": allowqueue, "location.$[elem].requiredemail": requiredemail,
            "location.$[elem].requiredphone": requiredphone, "location.$[elem].msg": msg
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