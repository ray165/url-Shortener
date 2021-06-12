var mongoose = require('mongoose');

var urlSchema = new mongoose.Schema({
    originalURL: String,
    hashURL: String,
    creationDate: { type: Date, default: Date.now }
})


module.exports = {
    URL: mongoose.model('URL', urlSchema)
};