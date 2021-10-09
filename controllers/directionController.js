const Direction = require('../models/Direction');
const Question = require('../models/Question');
var Test = require('../models/Test');
var async = require('async');
const { body, validationResult } = require('express-validator');

//Display list of all Directions.
exports.direction_list = function (req, res, next) {
    Direction.find({}, 'direction test')
        .populate('test')
        .exec(function (err, list_directions) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('direction_list', { title: 'Direction List', direction_list: list_directions });
        });
    // res.send('NOT IMPLEMENTED: Direction list');
};

//Display detail page for a specific Direction.
exports.direction_detail = function (req, res, next) {
    // res.send('NOT IMPLEMENTED: Direction detail: ' + req.params.id);
    async.parallel({
        direction: function (callback) {
            Direction.findById(req.params.id)
                .populate('test')
                .populate('question')
                .exec(callback);
        },
        direction_questions: function (callback) {
            Question.find({ 'direction': req.params.id })
                .exec(callback);
        },



    }, function (err, results) {
        if (err) { return next(err); }
        if (results.direction == null) { // No result
            var err = new Error('Direction not found');
            err.status = 404;
            return next(err);
        }
        //Successful, so render
        res.render('direction_detail', { title: 'Direction Detail', direction: results.direction, direction_questions: results.direction_questions });
    });
};

//Display Direction create form on GET.
exports.direction_create_get = function (req, res, next) {
    // res.send('NOT IMPLEMENTED: Direction create GET');

    // res.render('direction_form', { title: 'Create Direction', tid: req.params.id, direction: null, errors: null })
    res.render('direction_form', { title: 'Create Direction', id: req.params.id, direction: null, errors: null })

};

//Handle Direction create on POST.
exports.direction_create_post = [
    //Validate and sanitize fields.
    body('direction', 'Direction is required').trim().isLength({ min: 1 }), //--> .escape() <-- This is removed so to not to escape special characters.

    //Process request after validation and sanitization.
    (req, res, next) => {
        //Extract the validation errors from a request.
        // if (!mongoose.Types.ObjectId.isValid(id)) return false;
        const errors = validationResult(req);

        // var testInstance = Test.find({ _id: req.params.id });
        //Create a direction object with escaped and trimmed data.
        var direction = new Direction(
            {
                direction: req.body.direction,
                test: req.params.id
                // test: testInstance._id
            }
        );
        if (!errors.isEmpty()) {
            //There are errors. Render form again with sanitized values/errors messages
            res.render('direction_form', { title: 'Create Direction', direction: req.body, id: req.params.id, errors: errors.array() });
            return;
        }
        else {
            //Data from form is valid
            //Check if Direction with the same 'direction' already exists.
            Direction.findOne({ 'direction': req.body.direction })
                .populate('test')
                .populate('question')
                .exec(function (err, found_direction) {
                    if (err) { return next(err); }
                    if (found_direction) {
                        //Direction exists, redirect to its detail page
                        res.redirect(found_direction.url);
                    }
                    else {
                        direction.save(function (err) {
                            if (err) { return next(err); }
                            //Direction 'saved'. Redirect to direction detail page.

                            // res.redirect(direction.url);
                            ///////////////////////////////////////////////////////////////////////////////
                            //The BELOW BETWEEN // AND // is done to add the new direction which is created to the 'direction' array key of the corresponding 'Test'

                            async.parallel({
                                test: function (callback) {
                                    Test.findById(req.params.id).populate('direction').populate('question').exec(callback);

                                },

                            }, function (err, results) {
                                if (err) { return next(err); }

                                var dir = direction._id;
                                results.test.direction.push(dir);
                                results.test.save();

                                // var test = new Test({
                                //     title: results.test.title,
                                //     numOfOptions: results.test.numOfOptions,
                                //     _id: req.params.id, //This is required, or a new ID will be created 
                                //     $push: { direction: direction._id }
                                // });
                                // Test.findByIdAndUpdate(req.params.id, test, {}, function (err, thetest) {
                                //     if (err) { return next(err); }
                                //     //Successful - redirect to Test detail page.
                                //     // res.redirect(thetest.url);

                                // });

                                res.redirect(direction.url);

                            })
                            //////////////////////////////////////////////////////////////////
                        });

                    }
                })
        }
    }
];




//Display Direction delete form on GET.
exports.direction_delete_get = function (req, res, next) {
    // res.send('NOT IMPLEMENTED: Direction delete GET');
    async.parallel({
        direction: function (callback) {
            Direction.findById(req.params.id).exec(callback)
        },
        direction_questions: function (callback) {
            Question.find({ 'direction': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.direction == null) { //No results
            res.redirect('/catalog/directions');
        }
        //Successful, so render.
        res.render('direction_delete', { title: 'Delete Direction', direction: results.direction, direction_questions: results.direction_questions });

    });

};

//Handle Direction delete on POST.
exports.direction_delete_post = function (req, res, next) {
    // res.send('NOT IMPLEMENTED: Direction delete POST');
    async.parallel({
        direction: function (callback) {
            Direction.findById(req.body.directionid).exec(callback)
        },
        direction_questions: function (callback) {
            Question.find({ 'direction': req.body.directionid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        //Success
        if (results.direction_questions.length > 0) {
            //Direction has questions. Render in same way as for GET route.
            res.render('direction_delete', { title: 'Direction Delete', direction: results.direction, direction_questions: results.direction_questions });
            return;
        }
        else {
            var testid = results.direction.test;
            // results.direction.test.direction

            /////////////////////////////////////////////////////////////////////////////////////////////////////
            // The below Between // and // is NOT working. Couldn't Pull out question
            //// The below is done to remove the direction Id from the array of 'direction' element of Test.
            // Favorite.updateOne( {cn: req.params.name}, { $pullAll: {uid: [req.params.deleteUid] } } )
            Test.updateOne({ _id: testid }, { $pull: { direction: req.body.directionid } })
            ////////////////////////////////////////////////////////////////////////////////////////////////////

            //Direction has no questions. Delete (direction) object and redirect to the list of tests.
            Direction.findByIdAndDelete(req.body.directionid, function deleteDirection(err) {
                if (err) { return next(err); }
                //Success - go to test lists
                res.redirect('/catalog/test/' + testid)
            })
        }
    });
};

//Display Direction update form on GET.
exports.direction_update_get = function (req, res) {
    // res.send('NOT IMPLEMENTED: Direction update GET');
    async.parallel({
        direction: function (callback) {
            Direction.findById(req.params.id).populate('test').populate('question').exec(callback);

        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.direction == null) {
            var err = new Error('Direction not found');
            err.status = 404;
            return next(err);
        }
        //Success.
        res.render('direction_form', { title: 'Update Direction', direction: results.direction, id: results.direction.test._id, errors: null });


    })
};

//Handle Direction update on POST.
exports.direction_update_post = [
    //Validate and sanitise fields.
    body('direction', 'Direction must not be empty').trim().isLength({ min: 1 }),

    //Process request after validation and sanitization.
    (req, res, next) => {
        //Extract the validation errors from a request.
        const errors = validationResult(req);
        var direction = new Direction(
            {
                direction: req.body.direction,
                test: req.body.test,
                _id: req.params.id
            }
        );
        if (!errors.isEmpty()) {
            //There are errors. Render form again with sanitized values/error messages.
            res.render('direction_form', { title: 'Update Direction', direction: direction, id: direction.test, errors: errors.array() });
            return;
        }
        else {
            //Data from form is valid. Update the record.
            Direction.findByIdAndUpdate(req.params.id, direction, {}, function (err, thedirection) {
                if (err) { return next(err); }
                //Successful - redirect to direction detail page.
                res.redirect(thedirection.url);
            });
        }
    }
];