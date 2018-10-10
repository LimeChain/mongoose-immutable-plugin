const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SimpleImmutabilitySchema = new Schema({
    id: Schema.Types.ObjectId,
    propA: {
        type: String,
        immutable: true
    },
    propB: Number
});

SimpleImmutabilitySchema.plugin(require('./../../'));
module.exports = mongoose.model('SimpleImmutability', SimpleImmutabilitySchema);
