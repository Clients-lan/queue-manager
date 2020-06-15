const mongoose = require('mongoose')


const ScheduleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: false
    },
    time: {
        type: String,
        required: false
    },
    can1: {
        type: String,
        required: false
    },
    can2: {
        type: String,
        required: false
    },
    can3: {
        type: String,
        required: false
    },
    can4: {
        type: String,
        required: false
    },
    can5: {
        type: String,
        required: false
    },
    code: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    now: {
        type: Date,
        default: Date.now
    }

    
})

const Schedule = mongoose.model('Schedule', ScheduleSchema);
module.exports = Schedule;