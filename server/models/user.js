var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var uniqueValidator = require("mongoose-unique-validator");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);