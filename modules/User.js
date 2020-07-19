const mongoose = require('mongoose')
const  passportLocalMongoose = require('passport-local-mongoose')


const UserSchema = new mongoose.Schema({
    first: {
        type: String,
        required: true
    },
    last: {
        type: String,
        required: true
    },
    biz: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: String,
        required: true
    },
    password2: {
        type: String,
        required: false
    },
    subscribed: {
        type: String,
        required: false
    },
    plan: {
        type: String,
        required: false
    },
    plancode: {
        type: String,
        required: false
    },
    sub: {
        type: String,
        required: false
    },
    customer: {
        type: String,
        required: false
    },
    locisadded: {
        type: String,
        required: false
    },
    location : [{ 
        name : String, 
        address: String,
        header: String,
        subheader: String,
        notes: String,
        vpurl: String,
        date: String,
        method: String,
        lat: Number,
        lng: Number,
        adminmail: String,
        adminphone: String,
        allowqueue: String,
        requiredemail: String,
        requiredphone: String,
        msg: String,
        maxnum: String,
        num: String,
        sms: String,
        avgwt: String,
        fweek:[{ 
            sun: String,
            mon: String,
            tue: String,
            wen: String,
            thu: String,
            fri: String,
            sat: String
        }],
        sweek:[{ 
            sun: String,
            mon: String,
            tue: String,
            wen: String,
            thu: String,
            fri: String,
            sat: String
        }],
        
    }],
    team: [{
        workemail: String,
        fullname: String,
        location: String,
        role: String,
        locationId: String,
        token: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    visitors: [{ 
        firstname : String, 
        lastname: String,
        phone: String,
        line: String,
        labels: String,
        location: String,
        status: String,
        timeused: String,
        place: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    date: {
        type: Date,
        default: Date.now
    },
    slot: [{
        time: String,
        day: String,
    }],
    monspday: String,
    tuespday: String,
    wenspday: String,
    thuspday: String,
    frispday: String,
    satspday: String,
    sunspday: String,
    book: [{
        name: String,
        email: String,
        phone: String,
        time: String,
        status: String,
        location: String,
        rdate: String,
        oneid: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    bookingalert: String,
    bookinglink: {
        type: String,
        required: false
    },
    verifyToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    teamToken: String
})


UserSchema.plugin(passportLocalMongoose)
const User = mongoose.model('User', UserSchema);

module.exports = User;