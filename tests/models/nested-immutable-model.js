const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let NestedImmutabilitySchema = new Schema({
    id: Schema.Types.ObjectId,
    levelA: {
        levelB: {
            levelC1: {
                type: String,
                immutable: true
            },
            levelC2: String
        }
    }
});

NestedImmutabilitySchema.plugin(require('./../../'));
module.exports = mongoose.model('NestedImmutability', NestedImmutabilitySchema);
