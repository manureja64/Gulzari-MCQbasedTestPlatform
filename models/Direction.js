var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var DirectionSchema = new Schema(
    {
        direction: { type: String, required: true },
        question: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
        test: { type: Schema.Types.ObjectId, ref: 'Test' }
    }
);

DirectionSchema
    .virtual('url')
    .get(function () {
        return '/catalog/direction/' + this._id;

    });

module.exports = mongoose.model('Direction', DirectionSchema);
