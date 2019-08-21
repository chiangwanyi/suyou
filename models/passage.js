const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)

mongoose.connect(config.mongodb, { useNewUrlParser: true })

const Schema = mongoose.Schema

var passageSchema = new Schema({
    title: {type: String, required: true},
    subheading: {type: String, default: null},
    // editor: {type: ObjectId, required}
    editor: {type: String, default: 'admin'},
    
})

module.exports = mongoose.model('Passage', passageSchema)