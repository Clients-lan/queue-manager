const mongoose = require('mongoose')


const TeamSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: false
    },
    token: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
})


const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;