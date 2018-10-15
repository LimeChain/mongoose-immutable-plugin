let isObject = function (objCandidate) {
    return !!objCandidate && typeof objCandidate === 'object';
}

module.exports = function immutableFieldPlugin(schema) {
    // On update we have a mongoose query 
    // We have to remove the immutable properties from it
    guardUpdate(schema);

    // On save we have mongoose document, a.k.a object with some mongoose methods
    // We have to unmark the modifications for immutable properties
    guardSave(schema);
}

/*
    Update methods: 
        1. update
        2. updateOne
        3. updateMany
        4. findOneAndUpdate
*/
let guardUpdate = function (schema) {
    schema.pre('findOneAndUpdate', function (next) {
        guardImmutableFieldsUpdate(this._update);
        next();
    });

    schema.pre('update', function (next) {
        guardImmutableFieldsUpdate(this._update);
        next();
    });

    schema.pre('updateOne', function (next) {
        guardImmutableFieldsUpdate(this._update);
        next();
    });

    schema.pre('updateMany', function (next) {
        guardImmutableFieldsUpdate(this._update);
        next();
    });

    /* 
        updatedField -> an object with fields for update
        schemaNestedLevel -> because of recursive iterating on schema(object) properties

        guardImmutableFieldsUpdate gets the key name of updated field and use it for searching in schema like `schema[keyName]`
        Check the relevant field in schema if it has immutable property and if so remove it from update query
    */
    let guardImmutableFieldsUpdate = function (updatedFields, schemaNestedLevel = schema.tree) {
        let fieldsNames = Object.keys(updatedFields);

        for (let i = 0; i < fieldsNames.length; i++) {

            // Checks if a property is mongoose option(mongoose query options starts with $)
            // $set, $inc, $push, etc.
            if (fieldsNames[i].startsWith('$')) {
                guardImmutableFieldsUpdate(
                    updatedFields[fieldsNames[i]],
                    schemaNestedLevel
                );

                // Remove the mongoose option if it consists only immutable fields
                if (Object.keys(updatedFields[fieldsNames[i]]).length == 0) {
                    delete updatedFields[fieldsNames[i]];
                }
            } else if (fieldsNames[i].includes('.')) {

                // Checks for nested objects
                // Example: levelA.levelB.levelC
                let nestedFields = fieldsNames[i].split('.');
                if (isNestedImmutable(schemaNestedLevel[nestedFields[0]], nestedFields)) {
                    delete updatedFields[fieldsNames[i]];
                }
            } else if (schemaNestedLevel[fieldsNames[i]]) {
                if (isObject(updatedFields[fieldsNames[i]]) && !schemaNestedLevel[fieldsNames[i]].type) {
                    guardImmutableFieldsUpdate(
                        updatedFields[fieldsNames[i]],
                        schemaNestedLevel[fieldsNames[i]]
                    );
                } else if (schemaNestedLevel[fieldsNames[i]] && schemaNestedLevel[fieldsNames[i]].immutable) {
                    delete updatedFields[fieldsNames[i]];
                }
            }
        }
    }

    let isNestedImmutable = function (schemaNestedLevel, nestedFields, nesting = 1) {
        /*
            If a schemaNestedLevel is immutable, it removes the whole branch
            Example: {
                    levelA: {
                        type: {
                            levelB: String
                        },
                        immutable: true
                    }
                }
            Plugin wont check levelA.levelB, it will remove levelA
        */
        if (schemaNestedLevel.immutable) {
            return true;
        }

        // Check only existing schema properties for immutable flag
        if (schemaNestedLevel[nestedFields[nesting]]) {
            if (nestedFields.length - 1 == nesting) {
                return schemaNestedLevel[nestedFields[nesting]].immutable;
            }

            return isNestedImmutable(schemaNestedLevel[nestedFields[nesting]], nestedFields, ++nesting);
        }
        return false;
    }
}


let guardSave = function (schema) {
    schema.pre('save', function (next) {
        if (!this.isNew) {
            guardImmutableFieldsReSave(this);
        }

        next();
    });

    let guardImmutableFieldsReSave = function (updatedFields, schemaNestedLevel = schema.tree, fieldPath = []) {
        let fieldsNames = Object.keys(updatedFields.toObject());

        for (let i = 0; i < fieldsNames.length; i++) {
            if (isObject(updatedFields[fieldsNames[i]]) && !schemaNestedLevel[fieldsNames[i]].type) {

                discardChanges.call(updatedFields, fieldPath, fieldsNames[i],
                    function () {
                        guardImmutableFieldsReSave(
                            updatedFields[fieldsNames[i]],
                            schemaNestedLevel[fieldsNames[i]],
                            fieldPath
                        );
                    });
            } else if (schemaNestedLevel[fieldsNames[i]].immutable) {

                discardChanges.call(updatedFields, fieldPath, fieldsNames[i],
                    function () {
                        if (Array.isArray(schemaNestedLevel[fieldsNames[i]].type)) {
                            updatedFields[fieldsNames[i]] = [];
                        }
                    });
            }
        }
    }

    let discardChanges = function (fieldPath, fieldName, callBackLogic) {
        fieldPath.push(fieldName);

        callBackLogic();

        this.unmarkModified(fieldPath.join('.'));
        fieldPath.pop();
    }
}