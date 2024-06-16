const mongoose = require("mongoose")
var passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        lowercase: true,
        required: true
    },
    subscription: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
    },
    dateSub: {
        type: Date,
        default: getYesterday
    }
})

// add a number in subscription

// check if subscribed or not subscribed
userSchema.virtual('checkSub').get(function() {
    const today = new Date();
    if (this.dateSub >= today) {
        return true
    }
    return false
})

// Create date that is like this <!-- 2024-12-31 -->
userSchema.virtual('formatDateSub').get(function() {
    return formatDate(this.dateSub)
})


// create a virtual for the date 
userSchema.virtual('newDate').get(function() {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 30);

    return futureDate;
})

// virtual subscribed or not subscribed
userSchema.virtual('subscribed').get(function() {
    if (this.subscription > 0) {
        return true
    }
    return false
})

function getYesterday() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday;
}

// Function to format a date as 'YYYY-MM-DD'
function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema)
