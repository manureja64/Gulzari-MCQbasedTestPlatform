var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionSchema = new Schema(
    {
        direction: { type: Schema.Types.ObjectId, ref: 'Direction' },
        test: { type: Schema.Types.ObjectId, ref: 'Test' },
        question: { type: String, required: true },
        // img: {
        //     data: Buffer,
        //     contentType: String
        // },
        a: { type: String, required: true },
        b: { type: String, required: true },
        c: { type: String, required: true },
        d: { type: String, required: true },
        e: { type: String },
        ans: { type: String, required: true },
        solution: { type: String, required: true }
    }

)

QuestionSchema
    .virtual('url')
    .get(function () {
        return '/catalog/question/' + this._id;
    });

//Export model
module.exports = mongoose.model('Question', QuestionSchema);