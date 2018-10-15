# Mongoose immutable fields plugin

Immutable property guards modifications on a field **after document creation**.

Mongoose immutable fields plugin was born when I have hard time trying to guard a field from modifications after document creation.
I could not find something, which does that for me (maybe the mongoose concept in my head is wrong), but I had need of some way to 
protect my fields (from developers - myself included).

### Operations-Guard
The plugin guards fields modification for following operations :
* re-save
* update
* updateOne
* updateMany
* findAndUpdate

### Usage

**Note!** Immutable-plugin is tested only for below types of fields. **The behavior of other types is unknown**


| object | array | number | string |
| ------ | :---: | :----: | -----: |

---

1. Simple Field Schema

```javascript
let SimpleFieldSchema = new Schema({
    id: Schema.Types.ObjectId,
    simpleFieldA: {
      type: String,
      immutable: true
    },
    simpleFieldB: Number
});

SimpleFieldSchema.plugin(require('mongoose-immutable-fields'));
```  

2. Nested Field Schema

```javascript
let NestedFieldSchema = new Schema({
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

NestedFieldSchema.plugin(require('mongoose-immutable-fields'));
```

3. Array Field Schema

**Note!**  Array-type field can be immutable, but the plugin will be triggered on array-level, not for array's items properties.
That means if you have for example an array of objects and mark an object(array item) property as immutable, plugin wont handle that. 

If you mark an array as immutable one, before db update, the whole array will be removed with all modifications on it

```javascript
let ArrayFieldSchema = new Schema({
  id: Schema.Types.ObjectId,
  arr: {
    immutable: true
    type: [
    	{ item: String }
    ]
  }
});

ArrayFieldSchema.plugin(require('mongoose-immutable-fields'));
```

4. Mixed Schema 
```javascript
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

MixedImmutabilitySchema.plugin(require('mongoose-immutable-fields'));
```



### Tests
You need to have installed and run **mongodb**  
Run tests -> run the test file with **npm run test**

### Limitations

   * If you use re-save as a way to update a document, you will get back the document in the state before update (field will be updated although it is immutable) but if you retrieve it, it won't be
       
       ##### Example :
       	```javascript  
            // You have defined someProp as immutable one
            let doc = new DOCModel({ someProp: 5 });
            let createdDOC = await doc.save();

            // createdDOC.someProp => 5
            
            doc.someProp = 6;
            let updatedDOC = await doc.save();
            
            // updatedDOC.someProp => 6

            let retrievedDOCAfterUpdate = await DOCModel.findById(doc._id);

            // retrievedDOCAfterUpdate.someProp => 5
        ```
            
