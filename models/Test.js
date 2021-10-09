const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const TestSchema = new Schema({
    title: { type: String, required: true },
    numOfOptions: { type: Number, enum: [4, 5], required: true },
    ///////////////////////////////////////
    duration: { type: Number, enum: [5, 10, 15, 20, 30, 60] },
    type: { type: Number, enum: [0, 1] },
    message: { type: String },
    //////////////////////////////////////////////
    direction: [{ type: Schema.Types.ObjectId, ref: 'Direction' }],
    question: [{ type: Schema.Types.ObjectId, ref: 'Question' }]

});

TestSchema
    .virtual('url')
    .get(function () {
        return '/catalog/test/' + this._id;
    });

//Export model
module.exports = mongoose.model('Test', TestSchema);
