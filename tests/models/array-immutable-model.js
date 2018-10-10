const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ArrayImmutabilitySchema = new Schema({
    id: Schema.Types.ObjectId,
    arr: {
        immutable: true,
        type: [
            { item: String }
        ]
    }

});

ArrayImmutabilitySchema.plugin(require('./../../'));
module.exports = mongoose.model('ArrayImmutability', ArrayImmutabilitySchema);
