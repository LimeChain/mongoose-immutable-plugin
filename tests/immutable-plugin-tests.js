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

const MixedImmutability = require('./models/mixed-immutable-model');
const MixedImmutabilityMock = require('./mocks/mixed-immutability-mock');


// =================== Immutable-fields tests ====================

describe('Test Whole Array Immutability', async function () {

    const UPDATE_VALUES = [
        { item: "1" },
        { item: "2" }
    ]

    before(() => mongoose.connection.collections['arrayimmutabilities'].remove({}));

    it('Should not store immutable array on re-save', async () => {
        await checkImmutableArray(async function (doc) {
            doc.arr = UPDATE_VALUES;

            await doc.save();
        });
    });

    it('Should keep immutable array state after update', async () => {
        await checkImmutableArray(async function (doc) {
            await ArrayImmutability.update({ _id: doc._id }, {
                $set: {
                    arr: UPDATE_VALUES
                }
            });
        });
    });

    it('Should keep immutable array state after updateOne', async () => {
        await checkImmutableArray(async function (doc) {
            await ArrayImmutability.updateOne({ _id: doc._id }, {
                $set: {
                    arr: UPDATE_VALUES
                }
            });
        });

    });

    it('Should keep immutable array state after updateMany', async () => {
        await checkImmutableArray(async function (doc) {
            await ArrayImmutability.updateMany({ _id: doc._id }, {
                $set: {
                    arr: UPDATE_VALUES
                }
            });
        });

    });

    it('Should keep immutable array state after findOneAndUpdate', async () => {
        await checkImmutableArray(async function (doc) {
            await ArrayImmutability.findOneAndUpdate({ _id: doc._id }, {
                $set: {
                    arr: UPDATE_VALUES
                }
            });
        });
    });


    async function checkImmutableArray(updateMethod) {
        let arrayImmutability = await ArrayImmutability.create(ArrayImmutabilityMock);
        await updateMethod(arrayImmutability);

        let updatedDoc = await ArrayImmutability.findById(arrayImmutability._id);

        assert(updatedDoc.arr[0].item == ArrayImmutabilityMock.arr[0].item, "Immutable array was updated");
        assert(updatedDoc.arr.length == ArrayImmutabilityMock.arr.length, "Immutable array was updated");
    }

    after(() => mongoose.connection.collections['arrayimmutabilities'].remove({}));
});

describe('Test Elements Of Immutable Array', async function () {

    const UPDATE_VALUES = {
        'arr.$.item': 'Update'
    }

    before(() => mongoose.connection.collections['arrayimmutabilities'].remove({}));

    it('Should not store element of immutable array on re-save', async () => {
        await checkImmutableArrayElement(async function (doc) {

            doc.arr[0].item = 'Update';
            doc.arr.push({ item: 'Update' });

            await doc.save();
        });
    });


    it('Should keep element state of immutable array after update', async () => {
        await checkImmutableArrayElement(async function (doc) {
            await ArrayImmutability.update({ 'arr._id': doc.arr[0].id }, {
                $set: UPDATE_VALUES
            });
        });
    });

    it('Should keep element state of immutable array state updateOne', async () => {
        await checkImmutableArrayElement(async function (doc) {
            await ArrayImmutability.updateOne({ 'arr._id': doc.arr[0].id }, {
                $set: UPDATE_VALUES
            });
        });

    });

    it('Should keep element state of immutable array after updateMany', async () => {
        await checkImmutableArrayElement(async function (doc) {
            await ArrayImmutability.updateMany({ 'arr._id': doc.arr[0].id }, {
                $set: UPDATE_VALUES
            });
        });

    });

    it('Should keep element state of immutable array after findOneAndUpdate', async () => {
        await checkImmutableArrayElement(async function (doc) {
            await ArrayImmutability.findOneAndUpdate({ 'arr._id': doc.arr[0].id }, {
                $set: UPDATE_VALUES
            });
        });
    });


    async function checkImmutableArrayElement(updateMethod) {
        let arrayImmutability = await ArrayImmutability.create(ArrayImmutabilityMock);
        await updateMethod(arrayImmutability);

        let updatedDoc = await ArrayImmutability.findById(arrayImmutability._id);
        assert(updatedDoc.arr[0].item == ArrayImmutabilityMock.arr[0].item, "Element of immutable array was updated");
    }

    after(() => mongoose.connection.collections['arrayimmutabilities'].remove({}));
});

describe('Test Nested Immutability', async function () {

    const UPDATE_VALUES = {
        'levelA.levelB.levelC1': 'Update',
        'levelA.levelB.levelC2': 'Update'
    }

    before(() => mongoose.connection.collections['nestedimmutabilities'].remove({}));

    // When creating a new document, immutable-fields are not triggered
    it('Should create document without care about immutable fields', async () => {
        let nestedImmutability = await NestedImmutability.create(NestedImmutabilityMock);
        var createdDoc = await NestedImmutability.findById(nestedImmutability._id);

        assert(createdDoc.levelA.levelB.levelC1, NestedImmutabilityMock.levelA.levelB.levelC1, "LevelC1 field is not the same as the one, which was saved");
        assert.ok(NestedImmutability.schema.tree.levelA.levelB.levelC1.immutable, "LevelC1 field is not immutable");
    });

    it('Should keep immutable nested field state after re-save', async () => {
        await checkNestedImmutableField(async function (doc) {
            doc.levelA.levelB.levelC1 = 'Update';
            doc.levelA.levelB.levelC2 = 'Update';

            await doc.save();
        });
    });

    it('Should keep immutable nested field state after update', async () => {
        await checkNestedImmutableField(async function (doc) {
            await NestedImmutability.update({ _id: doc._id }, {
                $set: UPDATE_VALUES
            });
        });
    });


    it('Should keep immutable nested field state after updateOne', async () => {
        await checkNestedImmutableField(async function (doc) {
            await NestedImmutability.updateOne({ _id: doc._id }, {
                $set: UPDATE_VALUES
            });
        });
    });

    it('Should keep immutable nested field state after updateMany', async () => {
        await checkNestedImmutableField(async function (doc) {
            await NestedImmutability.updateMany({ _id: doc._id }, {
                $set: UPDATE_VALUES
            });
        });
    });

    it('Should keep immutable nested field state after findOneAndUpdate', async () => {
        await checkNestedImmutableField(async function (doc) {
            await NestedImmutability.findOneAndUpdate({ _id: doc._id }, {
                $set: UPDATE_VALUES
            });
        });
    });

    async function checkNestedImmutableField(updateMethod) {
        let nestedImmutability = await NestedImmutability.create(NestedImmutabilityMock);
        await updateMethod(nestedImmutability);
        let updatedRecord = await NestedImmutability.findById(nestedImmutability._id);

        assert(updatedRecord.levelA.levelB.levelC1 == NestedImmutabilityMock.levelA.levelB.levelC1, "LevelC1 field is immutable, but it is updated");
        assert(updatedRecord.levelA.levelB.levelC2 == UPDATE_VALUES['levelA.levelB.levelC2'], "LevelC2 field is not immutable, but it is not updated");
    }

    after(() => mongoose.connection.collections['nestedimmutabilities'].remove({}));
});

describe('Test Simple Immutability', async function () {

    const UPDATE_VALUES = {
        propA: 'Update',
        propB: 5
    }

    before(() => mongoose.connection.collections['simpleimmutabilities'].remove({}));

    // When creating a new document, immutable-fields are not triggered
    it('Should create document without care about immutable fields', async () => {
        let simpleImmutability = await SimpleImmutability.create(SimpleImmutabilityMock);
        var createdDoc = await SimpleImmutability.findById(simpleImmutability._id);

        assert(createdDoc.propA == SimpleImmutabilityMock.propA, "PropA field is not the same as the one, which was saved");
        assert.ok(SimpleImmutability.schema.tree.propA.immutable, "PropA field is not immutable");
    });

    it('Should keep immutable field state after re-save', async () => {
        await checkSimpleImmutableField(async function (doc) {
            doc.propA = UPDATE_VALUES.propA;
            doc.propB = UPDATE_VALUES.propB;

            await doc.save();
        });
    });

    it('Should keep immutable field state after update', async () => {
        await checkSimpleImmutableField(async function (doc) {
            await SimpleImmutability.update({ _id: doc._id }, {
                $set: UPDATE_VALUES
            });
        });
    });

    it('Should keep immutable field state after updateOne', async () => {
        await checkSimpleImmutableField(async function (doc) {
            await SimpleImmutability.updateOne({ _id: doc._id }, {
                $set: UPDATE_VALUES
            });
        });
    });

    it('Should keep immutable field state after updateMany', async () => {
        await checkSimpleImmutableField(async function (doc) {
            await SimpleImmutability.updateMany({ _id: doc._id }, {
                $set: UPDATE_VALUES
            });
        });
    });

    it('Should keep immutable field state after findOneAndUpdate', async () => {
        await checkSimpleImmutableField(async function (doc) {
            await SimpleImmutability.findOneAndUpdate({ _id: doc._id }, {
                $set: UPDATE_VALUES
            });
        });
    });

    async function checkSimpleImmutableField(updateMethod) {
        let simpleImmutability = await SimpleImmutability.create(SimpleImmutabilityMock);
        await updateMethod(simpleImmutability);

        let updatedDoc = await SimpleImmutability.findById(simpleImmutability._id);

        assert(updatedDoc.propA == SimpleImmutabilityMock.propA, "PropA field is immutable, but it is updated");
        assert(updatedDoc.propB == UPDATE_VALUES.propB, "PropB field is not immutable, but it is not updated");
    }

    after(() => mongoose.connection.collections['simpleimmutabilities'].remove({}));
});


describe('Test Mixed Immutability', async function () {

    const UPDATE_VALUES = {
        parentA: {
            arr: [], // Try to remove an immutable array
            childA: "Update",
            childB: {
                arr1: [{ item: "Update" }, { item: "Update" }], // Immutable
                arr2: [{ item: "Update" }, { item: "Update" }] // Non-immutable
            },
            childC: "Update" // Immutable
        },
        parentB: "Update", // Non-immutable
        parentC: 4 // Immutable
    }

    const UPDATE_QUERY = {
        'parentA.arr': UPDATE_VALUES.parentA.arr,
        'parentA.childB.arr1': UPDATE_VALUES.parentA.childB.arr1,
        'parentA.childB.arr2': UPDATE_VALUES.parentA.childB.arr2,
        'parentA.childA': UPDATE_VALUES.parentA.childA,
        'parentA.childC': UPDATE_VALUES.parentA.childC,
        'parentB': UPDATE_VALUES.parentB,
        'parentC': UPDATE_VALUES.parentC
    }

    before(() => mongoose.connection.collections['mixedimmutabilities'].remove({}));

    it('Should not store immutable fields on re-save', async () => {
        await checkMixedImmutability(async function (doc) {
            doc.parentA.arr = UPDATE_VALUES.parentA.arr;
            doc.parentA.childA = UPDATE_VALUES.parentA.childA;
            doc.parentA.childB = UPDATE_VALUES.parentA.childB;
            doc.parentA.childC = UPDATE_VALUES.parentA.childC;
            doc.parentB = UPDATE_VALUES.parentB;
            doc.parentC = UPDATE_VALUES.parentC;

            await doc.save();
        });
    });

    it('Should keep immutable fields state after update', async () => {
        await checkMixedImmutability(async function (doc) {
            await MixedImmutability.update({ _id: doc._id }, UPDATE_QUERY);
        });
    });

    it('Should keep immutable fields state after updateOne', async () => {
        await checkMixedImmutability(async function (doc) {
            await MixedImmutability.updateOne({ _id: doc._id }, UPDATE_QUERY);

        });
    });

    it('Should keep immutable fields state after updateMany', async () => {
        await checkMixedImmutability(async function (doc) {
            await MixedImmutability.updateMany({ _id: doc._id }, UPDATE_QUERY);

        });
    });

    it('Should keep immutable fields state after findOneAndUpdate', async () => {
        await checkMixedImmutability(async function (doc) {
            await MixedImmutability.findOneAndUpdate({ _id: doc._id }, UPDATE_QUERY);
        });
    });


    async function checkMixedImmutability(updateMethod) {
        let mixedImmutability = await MixedImmutability.create(MixedImmutabilityMock);

        await updateMethod(mixedImmutability);
        let updatedDoc = await MixedImmutability.findById(mixedImmutability._id);

        assert(updatedDoc.parentA.arr[0].item == MixedImmutabilityMock.parentA.arr[0].item, "Immutable array was updated");
        assert(updatedDoc.parentA.arr.length == MixedImmutabilityMock.parentA.arr.length, "Immutable array was updated");

        assert(updatedDoc.parentA.childA == "Update", "Non-immutable field was not-updated");
        assert(updatedDoc.parentA.childC == MixedImmutabilityMock.parentA.childC, "Immutable nested field was not updated");

        assert(updatedDoc.parentA.childB.arr1[0].item == MixedImmutabilityMock.parentA.childB.arr1[0].item, "Immutable nested array was updated");
        assert(updatedDoc.parentA.childB.arr1.length == MixedImmutabilityMock.parentA.childB.arr1.length, "Immutable nested array was updated");
        assert(updatedDoc.parentA.childB.arr2[0].item == "Update", "Non-immutable nested array element was not updated");
        assert(updatedDoc.parentA.childB.arr2.length == 2, "Non-immutable nested array was not updated");

        assert(updatedDoc.parentB == "Update", "Non-immutable field was not updated");
        assert(updatedDoc.parentC == MixedImmutabilityMock.parentC, "Immutable field was updated");
    }

    after(() => mongoose.connection.collections['arrayimmutabilities'].remove({}));
});