/* global describe, it, before, after */

'use strict'

const assert = require('assert');
const mongoose = require('mongoose');

mongoose.connect(`mongodb://127.0.0.1:27017/immutable-test-db`, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

const ArrayImmutability = require('./models/array-immutable-model');
const ArrayImmutabilityMock = require('./mocks/array-immutability-mock');

const NestedImmutability = require('./models/nested-immutable-model');
const NestedImmutabilityMock = require('./mocks/nested-immutability-mock');

const SimpleImmutability = require('./models/simple-immutable-model');
const SimpleImmutabilityMock = require('./mocks/simple-immutable-mock');


// =================== Immutable-fields tests ====================

describe('Test Whole Array Immutability', async function () {

    const UPDATE_VALUES = {
        'arr.$.item': 'Update'
    }

    // before(() => mongoose.connection.collections['apiusers'].remove({}));

    // When creating a new document, immutable-fields are not triggered
    // it('Should create document without care about immutable fields', async () => {
    //     let arrayImmutability = await ArrayImmutability.create(ArrayImmutabilityMock);
    //     var createdDoc = await ArrayImmutability.findById(arrayImmutability._id);

    //     assert(createdDoc[0].item == ArrayImmutability[0].item, "Array item's value is not the same as the one, which was saved");
    //     assert.ok(ArrayImmutability.schema.tree.arr.immutable, "Array is not immutable");
    // });

    // it('Should not store immutable array on re-save', async () => {
    //     await checkImmutableArray(async function (doc) {
    //         doc.arr[0].item = 'Update';

    //         await doc.save();
    //     });
    // });

    // it('Should keep immutable array state after update', async () => {
    //     await checkImmutableArray(async function (doc) {
    //         await ArrayImmutability.update({ 'arr': [{ item: "BRUM" }] }, {
    //             $set: UPDATE_VALUES
    //         });
    //     });
    // });

    // it('Should keep immutable array state after update', async () => {
    //     await checkImmutableArray(async function (doc) {
    //         await ArrayImmutability.update({ 'arr._id': doc.arr[0].id }, {
    //             $set: UPDATE_VALUES
    //         });
    //     });
    // });

    // it('Should keep immutable array state after updateOne', async () => {
    //     await checkImmutableArray(async function (doc) {
    //         await Payment.updateOne({ _id: doc._id }, {
    //             $set: UPDATE_VALUES
    //         });
    //     });

    // });

    // it('Should keep immutable array state after updateMany', async () => {
    //     await checkImmutableArray(async function (doc) {
    //         await ArrayImmutability.updateMany({ _id: doc._id }, {
    //             $set: UPDATE_VALUES
    //         });
    //     });

    // });

    // it('Should keep immutable array state after findOneAndUpdate', async () => {
    //     await checkImmutableArray(async function (doc) {
    //         await ArrayImmutability.findOneAndUpdate({ _id: doc._id }, {
    //             $set: UPDATE_VALUES
    //         });
    //     });
    // });


    // async function checkImmutableArray(updateMethod) {
    //     let arrayImmutability = await ArrayImmutability.create(ArrayImmutabilityMock);
    //     await updateMethod(arrayImmutability);

    //     let updatedDoc = await ArrayImmutability.findById(arrayImmutability._id);
    //     assert(updatedDoc.propA == SimpleImmutabilityMock.propA, "PropA field is immutable, but it is updated");
    //     assert(updatedDoc.propB == UPDATE_VALUES.propB, "PropB field is not immutable, but it is not updated");
    // }

    // after(() => emptyCollections());
});

describe('Test Elements Of Immutable Array', async function () {

    const UPDATE_VALUES = {
        'arr.$.item': 'Update'
    }

    before(() => mongoose.connection.collections['arrayimmutabilities'].remove({}));

    it('Should not store element of immutable array on re-save', async () => {
        await checkImmutableArray(async function (doc) {
            doc.arr[0].item = 'Update';

            await doc.save();
        });
    });


    // it('Should keep element state of immutable array after update', async () => {
    //     await checkImmutableArray(async function (doc) {
    //         await ArrayImmutability.update({ 'arr._id': doc.arr[0].id }, {
    //             $set: UPDATE_VALUES
    //         });
    //     });
    // });

    // it('Should keep element state of immutable array state updateOne', async () => {
    //     await checkImmutableArray(async function (doc) {
    //         await ArrayImmutability.updateOne({ 'arr._id': doc.arr[0].id }, {
    //             $set: UPDATE_VALUES
    //         });
    //     });

    // });

    // it('Should keep element state of immutable array after updateMany', async () => {
    //     await checkImmutableArray(async function (doc) {
    //         await ArrayImmutability.updateMany({ 'arr._id': doc.arr[0].id }, {
    //             $set: UPDATE_VALUES
    //         });
    //     });

    // });

    // it('Should keep element state of immutable array after findOneAndUpdate', async () => {
    //     await checkImmutableArray(async function (doc) {
    //         await ArrayImmutability.findOneAndUpdate({ 'arr._id': doc.arr[0].id }, {
    //             $set: UPDATE_VALUES
    //         });
    //     });
    // });


    async function checkImmutableArray(updateMethod) {
        let arrayImmutability = await ArrayImmutability.create(ArrayImmutabilityMock);
        await updateMethod(arrayImmutability);

        let updatedDoc = await ArrayImmutability.findById(arrayImmutability._id);
        console.log(updatedDoc);
        assert(updatedDoc.arr[0].item == ArrayImmutabilityMock.arr[0].item, "Element of immutable array was updated");
    }

    after(() => mongoose.connection.collections['arrayimmutabilities'].remove({}));
});

// describe('Test Nested Immutability', async function () {

//     const UPDATE_VALUES = {
//         'levelA.levelB.levelC1': 'Update',
//         'levelA.levelB.levelC2': 'Update'
//     }

//     before(() => mongoose.connection.collections['nestedimmutabilities'].remove({}));

//     // When creating a new document, immutable-fields are not triggered
//     it('Should create document without care about immutable fields', async () => {
//         let nestedImmutability = await NestedImmutability.create(NestedImmutabilityMock);
//         var createdDoc = await NestedImmutability.findById(nestedImmutability._id);

//         assert(createdDoc.levelA.levelB.levelC1, NestedImmutabilityMock.levelA.levelB.levelC1, "LevelC1 field is not the same as the one, which was saved");
//         assert.ok(NestedImmutability.schema.tree.levelA.levelB.levelC1.immutable, "LevelC1 field is not immutable");
//     });

//     it('Should keep immutable nested field state after re-save', async () => {
//         await checkNestedImmutableField(async function (doc) {
//             doc.levelA.levelB.levelC1 = 'Update';
//             doc.levelA.levelB.levelC2 = 'Update';

//             await doc.save();
//         });
//     });

//     it('Should keep immutable nested field state after update', async () => {
//         await checkNestedImmutableField(async function (doc) {
//             await NestedImmutability.update({ _id: doc._id }, {
//                 $set: UPDATE_VALUES
//             });
//         });
//     });


//     it('Should keep immutable nested field state after updateOne', async () => {
//         await checkNestedImmutableField(async function (doc) {
//             await NestedImmutability.updateOne({ _id: doc._id }, {
//                 $set: UPDATE_VALUES
//             });
//         });
//     });

//     it('Should keep immutable nested field state after updateMany', async () => {
//         await checkNestedImmutableField(async function (doc) {
//             await NestedImmutability.updateMany({ _id: doc._id }, {
//                 $set: UPDATE_VALUES
//             });
//         });
//     });

//     it('Should keep immutable nested field state after findOneAndUpdate', async () => {
//         await checkNestedImmutableField(async function (doc) {
//             await NestedImmutability.findOneAndUpdate({ _id: doc._id }, {
//                 $set: UPDATE_VALUES
//             });
//         });
//     });

//     async function checkNestedImmutableField(updateMethod) {
//         let nestedImmutability = await NestedImmutability.create(NestedImmutabilityMock);
//         await updateMethod(nestedImmutability);
//         let updatedRecord = await NestedImmutability.findById(nestedImmutability._id);

//         assert(updatedRecord.levelA.levelB.levelC1 == NestedImmutabilityMock.levelA.levelB.levelC1, "LevelC1 field is immutable, but it is updated");
//         assert(updatedRecord.levelA.levelB.levelC2 == UPDATE_VALUES['levelA.levelB.levelC2'], "LevelC2 field is not immutable, but it is not updated");
//     }

//     after(() => mongoose.connection.collections['nestedimmutabilities'].remove({}));
// });

// describe('Test Simple Immutability', async function () {

//     const UPDATE_VALUES = {
//         propA: 'Update',
//         propB: 5
//     }

//     before(() => mongoose.connection.collections['simpleimmutabilities'].remove({}));

//     // When creating a new document, immutable-fields are not triggered
//     it('Should create document without care about immutable fields', async () => {
//         let simpleImmutability = await SimpleImmutability.create(SimpleImmutabilityMock);
//         var createdDoc = await SimpleImmutability.findById(simpleImmutability._id);

//         assert(createdDoc.propA == SimpleImmutabilityMock.propA, "PropA field is not the same as the one, which was saved");
//         assert.ok(SimpleImmutability.schema.tree.propA.immutable, "PropA field is not immutable");
//     });

//     it('Should keep immutable field state after re-save', async () => {
//         await checkSimpleImmutableField(async function (doc) {
//             doc.propA = UPDATE_VALUES.propA;
//             doc.propB = UPDATE_VALUES.propB;

//             await doc.save();
//         });
//     });

//     it('Should keep immutable field state after update', async () => {
//         await checkSimpleImmutableField(async function (doc) {
//             await SimpleImmutability.update({ _id: doc._id }, {
//                 $set: UPDATE_VALUES
//             });
//         });
//     });

//     it('Should keep immutable field state after updateOne', async () => {
//         await checkSimpleImmutableField(async function (doc) {
//             await SimpleImmutability.updateOne({ _id: doc._id }, {
//                 $set: UPDATE_VALUES
//             });
//         });
//     });

//     it('Should keep immutable field state after updateMany', async () => {
//         await checkSimpleImmutableField(async function (doc) {
//             await SimpleImmutability.updateMany({ _id: doc._id }, {
//                 $set: UPDATE_VALUES
//             });
//         });
//     });

//     it('Should keep immutable field state after findOneAndUpdate', async () => {
//         await checkSimpleImmutableField(async function (doc) {
//             await SimpleImmutability.findOneAndUpdate({ _id: doc._id }, {
//                 $set: UPDATE_VALUES
//             });
//         });
//     });

//     async function checkSimpleImmutableField(updateMethod) {
//         let simpleImmutability = await SimpleImmutability.create(SimpleImmutabilityMock);
//         await updateMethod(simpleImmutability);

//         let updatedDoc = await SimpleImmutability.findById(simpleImmutability._id);

//         assert(updatedDoc.propA == SimpleImmutabilityMock.propA, "PropA field is immutable, but it is updated");
//         assert(updatedDoc.propB == UPDATE_VALUES.propB, "PropB field is not immutable, but it is not updated");
//     }

//     after(() => mongoose.connection.collections['simpleimmutabilities'].remove({}));
// });