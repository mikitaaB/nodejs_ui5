const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const personSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    image: {
        MimeType: String,
        OriginalSize: Number
    },
    post: {
        type: String
    },
    number: {
        type: String,
        unique: true
    },
    address: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

personSchema.plugin(uniqueValidator);
var Persons = mongoose.model("Persons", personSchema);

module.exports = Persons;