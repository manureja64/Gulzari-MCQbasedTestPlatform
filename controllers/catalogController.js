var Test = require('../models/Test');
var Direction = require('../models/Direction');
var Question = require('../models/Question');

var async = require('async');

exports.catalog = function (req, res) {
    async.parallel({
        test_count: function (callback) {
            Test.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        direction_count: function (callback) {
            Direction.countDocuments({}, callback);
        },
        question_count: function (callback) {
            Question.countDocuments({}, callback);
        }
    }, function (err, results) {
        res.render('catalog', { title: 'Catalog of Test Home', error: err, data: results });
    });

};