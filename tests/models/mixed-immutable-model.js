const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MixedImmutabilitySchema = new Schema({
    id: Schema.Types.ObjectId,
    parentA: {
        arr: {
            immutable: true,
            type: [
                { item: String }
            ]
        },
        childA: String,
        childB: {
            arr1: {
                immutable: true,
                type: [
                    { item: String }
                ]
            },
            arr2: {
                type: [
                    { item: String }
                ]
            }
        },
        childC: {
            type: String,
            immutable: true,
        }
    },
    parentB: String,
    parentC: {
        type: Number,
        immutable: true,
    }
});

MixedImmutabilitySchema.plugin(require('./../../'));
module.exports = mongoose.model('MixedImmutability', MixedImmutabilitySchema);
