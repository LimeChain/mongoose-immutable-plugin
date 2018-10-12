let isObject = function (objCandidate) {
    return !!objCandidate && typeof objCandidate === 'object';
}

module.exports = function immutableFieldPlugin(schema) {

    schema.pre('findOneAndUpdate', function (next) {
        guardEachUpdateOption(this._update);
        next();
    });

    schema.pre('update', function (next) {
        guardEachUpdateOption(this._update);
        next();
    });

    schema.pre('updateOne', function (next) {
        guardEachUpdateOption(this._update);
        next();
    });

    schema.pre('updateMany', function (next) {
        guardEachUpdateOption(this._update);
        next();
    });

    let guardEachUpdateOption = function (updateQuery) {
        // Immutable update is only supported for $set and $inc
        if (updateQuery.$set || updateQuery.$inc) {
            Object.keys(updateQuery).forEach((option) => {
                guardImmutableFieldsUpdate(updateQuery[option]);
            });
        } else {
            // This is when on update is passed whole object
            guardImmutableFieldsUpdate(updateQuery);
        }
    }

    let guardImmutableFieldsUpdate = function (updatedFields, schemaNestedLevel = schema.tree) {
        let fieldsNames = Object.keys(updatedFields);
        for (let i = 0; i < fieldsNames.length; i++) {
            if (fieldsNames[i].includes('.')) {
                let nestedFields = fieldsNames[i].split('.');
                if (isNestedImmutable(schemaNestedLevel[nestedFields[0]], nestedFields)) {
                    delete updatedFields[fieldsNames[i]];
                }
            } else if (isObject(updatedFields[fieldsNames[i]]) && !schemaNestedLevel[fieldsNames[i]].type) {
                guardImmutableFieldsUpdate.call(
                    this,
                    updatedFields[fieldsNames[i]],
                    schemaNestedLevel[fieldsNames[i]]
                );
            } else if (schemaNestedLevel[fieldsNames[i]] && schemaNestedLevel[fieldsNames[i]].immutable) {
                delete updatedFields[fieldsNames[i]];
            }
        }
    }

    let isNestedImmutable = function (schemaNestedLevel, nestedFields, nesting = 1) {
        if (schemaNestedLevel.immutable) {
            return true;
        }

        if (schemaNestedLevel[nestedFields[nesting]]) {
            if (nestedFields.length - 1 == nesting) {
                return schemaNestedLevel[nestedFields[nesting]].immutable;
            }

            return isNestedImmutable(schemaNestedLevel[nestedFields[nesting]], nestedFields, ++nesting);
        }
        return false;
    }

    schema.pre('save', function (next) {
        if (!this.isNew) {
            guardImmutableFieldsReSave.call(this, this);
        }

        next();
    });

    let guardImmutableFieldsReSave = function (updatedFields, schemaNestedLevel = schema.tree, fieldPath = '') {
        let fieldsNames = Object.keys(updatedFields.toObject());
        let prevFieldPath = fieldPath;

        for (let i = 0; i < fieldsNames.length; i++) {
            if (isObject(updatedFields[fieldsNames[i]]) && !schemaNestedLevel[fieldsNames[i]].type) {
                fieldPath = fieldPath ? `${fieldPath}.${fieldsNames[i]}` : fieldsNames[i].toString();

                guardImmutableFieldsReSave.call(this,
                    updatedFields[fieldsNames[i]],
                    schemaNestedLevel[fieldsNames[i]],
                    fieldPath
                );
                this.unmarkModified(fieldPath);
                fieldPath = prevFieldPath;

            } else if (schemaNestedLevel[fieldsNames[i]].immutable) {
                fieldPath = fieldPath ? `${fieldPath}.${fieldsNames[i]}` : fieldsNames[i].toString();
                if (Array.isArray(schemaNestedLevel[fieldsNames[i]].type)) {
                    updatedFields[fieldsNames[i]] = [];
                }
                this.unmarkModified(fieldPath);
                fieldPath = prevFieldPath;
            }
        }
    }
}