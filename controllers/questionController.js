const Direction = require('../models/Direction');
const Question = require('../models/Question');
var Test = require('../models/Test');
var async = require('async');

////// Image Upload Requirements- DOWN ///////
// var fs = require('fs');
// var path = require('path');

// var multer = require('multer');
// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// });
// var upload = multer({ storage: storage });
////// Image Upload Requirements- UP ////////


const { body, validationResult } = require('express-validator');

//Display list of all Questions.
exports.question_list = function (req, res, next) {
    Question.find({}, 'question direction')
        .populate('direction')
        .populate('test')
        .exec(function (err, list_questions) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('question_list', { title: 'Question List', question_list: list_questions });
        });
    // res.send('NOT IMPLEMENTED: Question list');
};

//Display detail page for a specific Question.
exports.question_detail = function (req, res, next) {
    // res.send('NOT IMPLEMENTED: Question detail: ' + req.params.id);
    async.parallel({
        question: function (callback) {
            Question.findById(req.params.id)
                .populate('test')
                .populate('direction')
                .exec(callback);
        },

        question_direction: function (callback) {
            Direction.find({ 'question': req.params.id })
                .exec(callback);
        },

        question_test: function (callback) {
            Test.find({ 'question': req.params.id })
                .exec(callback);
        },


    }, function (err, results) {
        if (err) { return next(err); }
        if (results.question == null) { //No results.
            var err = new Error('Question not found');
            err.status = 404;
            return next(err);

        }
        res.render('question_detail', { title: 'Question Detail', question: results.question, question_direction: results.question_direction, question_test: results.question_test });
    });

};

//Display Question create form on GET
exports.question_create_get = function (req, res, next) {
    // res.send('NOT IMPLEMENTED: Question create GET');
    async.parallel({
        direction: function (callback) {
            Direction.findById(req.params.id)
                .exec(callback);
        },
        ///////////////////
        // direction_test: function (callback) {
        //     Test.findById(direction.test)
        //         .exec(callback);
        // },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.direction == null) {
            var err = new Error('Direction not found');
            err.status = 404;
            return next(err);
        }
        async.parallel({
            direction_test: function (callback) {
                Test.findById(results.direction.test)
                    .exec(callback);
            },
        }, function (err1, results1) {
            if (err1) { return next(err1); }
            if (results1.direction_test == null) {
                var err1 = new Error('Test not found');
                err1.status = 404;
                return next(err1);
            }
            //Successful, so render
            res.render('question_form', { title: 'Create Question', numOfOptions: results1.direction_test.numOfOptions, id: req.params.id, question: null, errors: null });

        });



    });
};

//Handle Question create on POST
exports.question_create_post = [
    //Validate and sanitize fields
    body('question', 'Question is required').trim().isLength({ min: 1 }),
    body('a', 'Option A is required').trim().isLength({ min: 1 }), // --> .escape() <-- this is removed so to not to escape special characters.
    body('b', 'Option B is required').trim().isLength({ min: 1 }),
    body('c', 'Option C is required').trim().isLength({ min: 1 }),
    body('d', 'Option D is required').trim().isLength({ min: 1 }),
    body('ans', 'Correct Ans is required').trim().isLength({ min: 1 }),
    body('solution', 'Detailed Solution is required').trim().isLength({ min: 1 }),

    //Process request after Validation and Sanitization
    (req, res, next) => {
        //Extract the validation errors from a request
        const errors = validationResult(req);
        ///////////////////////////////
        async.parallel({
            direction: function (callback) {
                Direction.findById(req.params.id)
                    .populate('question')
                    .populate('test')
                    .exec(callback);
            },
            ////////////////////////
            // direction_test: function (callback) {
            //     Test.findById(direction.test)
            //         .exec(callback);
            // },
        }, function (err, results) {
            if (err) { return next(err); }
            async.parallel({
                direction_test: function (callback) {
                    Test.findById(results.direction.test)
                        .exec(callback);
                },

            }, function (err6, results6) {
                if (err6) { return next(err6); }
                // console.log(req.file);
                // console.log(`req.file.filename is: ${filename}`);

                //////////////////////// IMAGE UPLOAD FUNCTION BELOW//////////////////
                // const uploadFile = async(req, res)=> {
                //     try {
                //         await upload(req, res);

                //     } catch(error) {
                //         console.log(error);

                //     }

                // };
                //////////////////////// IMAGE UPLOAD FUNCTION UP//////////////////

                if (results6.direction_test.numOfOptions === 5) {
                    // console.log(req.file);
                    // console.log(`req.file.filename is: ${filename}`);
                    var question = new Question(
                        {
                            question: req.body.question,
                            // img: {
                            //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                            //     contentType: 'image/png'
                            // },
                            test: results6.direction_test._id,
                            direction: req.params.id,
                            a: req.body.a,
                            b: req.body.b,
                            c: req.body.c,
                            d: req.body.d,
                            e: req.body.e,
                            ans: req.body.ans,
                            solution: req.body.solution

                        }
                    )
                    if (!errors.isEmpty()) {
                        //There are errors. Render the form again with sanitized values/error messages.
                        res.render('question_form', { title: 'Create Question', numOfOptions: results6.direction_test.numOfOptions, id: req.params.id, question: null, errors: errors.array() });
                    }
                    else {
                        // Data from form is valid
                        // Check if question with the same name already exists.
                        Question.findOne({ 'question': req.body.question })
                            .exec(function (err1, found_question) {
                                if (err1) { return next(err1); }
                                if (found_question) {
                                    res.redirect(found_question.url);
                                }
                                else {
                                    question.save(function (err2) {
                                        if (err2) { return next(err2); }
                                        //Question saved. Redirect to question url
                                        // res.redirect(question.url)

                                        ///////////////////////////////////////////////////////////////////////////////
                                        //The BELOW BETWEEN // AND // is done to add the new direction which is created to the 'direction' array key of the corresponding 'Test'
                                        async.parallel({
                                            direction: function (callback) {
                                                Direction.findById(req.params.id).populate('question').populate('test').exec(callback);

                                            },
                                        }, function (err11, results11) {
                                            if (err11) { return next(err11); }

                                            var que = question._id;
                                            results11.direction.question.push(que);
                                            results11.direction.save();



                                            // res.redirect(direction.url);
                                            res.redirect(question.url);


                                        })
                                        //////////////////////////////////////////////////////////////////

                                    });
                                }
                            });
                    }

                }
                else {
                    var question = new Question(
                        {
                            question: req.body.question,
                            // img: {
                            //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                            //     contentType: 'image/png'
                            // },
                            test: results6.direction_test._id,
                            direction: req.params.id,
                            a: req.body.a,
                            b: req.body.b,
                            c: req.body.c,
                            d: req.body.d,
                            // e: req.body.e,
                            ans: req.body.ans,
                            solution: req.body.solution

                        }
                    )
                    if (!errors.isEmpty()) {
                        //There are errors. Render the form again with sanitized values/error messages.
                        res.render('question_form', { title: 'Create Question', numOfOptions: results6.direction_test.numOfOptions, id: req.params.id, question: null, errors: errors.array() });
                    }
                    else {
                        //Data from form is valid
                        //Check if question with same content already exists.
                        Question.findOne({ 'question': req.body.question })
                            .exec(function (err3, found_question) {
                                if (err3) { return next(err3); }
                                if (found_question) {
                                    //Question exists, redirect to its url
                                    res.redirect(found_question.url);
                                }
                                else {
                                    question.save(function (err4) {
                                        if (err4) { return next(err4); }
                                        // res.redirect(question.url);

                                        ///////////////////////////////////////////////////////////////////////////////
                                        //The BELOW BETWEEN // AND // is done to add the new direction which is created to the 'direction' array key of the corresponding 'Test'
                                        async.parallel({
                                            direction: function (callback) {
                                                Direction.findById(req.params.id).populate('question').populate('test').exec(callback);

                                            },
                                        }, function (err11, results11) {
                                            if (err11) { return next(err11); }

                                            var que = question._id;
                                            results11.direction.question.push(que);
                                            results11.direction.save();



                                            // res.redirect(direction.url);
                                            res.redirect(question.url);


                                        })
                                        //////////////////////////////////////////////////////////////////


                                    });
                                }
                            });
                    }

                }


            })





        });




        ////////////////////////

    }
]

//Display Question delete form on GET.
exports.question_delete_get = function (req, res, next) {
    // res.send('NOT IMPLEMENTED: Question delete GET');
    async.parallel({
        question: function (callback) {
            Question.findById(req.params.id).exec(callback)
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.question == null) { // No results.
            res.redirect('/catalog/tests')
        }
        //Successful, so render.
        res.render('question_delete', { title: 'Delete Question', question: results.question });

    });
};

//Handle Question delete on POST.
exports.question_delete_post = function (req, res, next) {
    // res.send('NOT IMPLEMENTED: Question delete POST');
    async.parallel({
        question: function (callback) {
            Question.findById(req.body.questionid).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        //Success
        var directionid = results.question.direction;
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        // The below Between // and // is NOT working. Couldn't Pull out question
        //// The below is done to remove the question Id from the array of 'question' element of Direction.
        // Favorite.updateOne( {cn: req.params.name}, { $pullAll: {uid: [req.params.deleteUid] } } )
        Direction.updateOne({ _id: directionid }, { $pull: { question: req.params.id } });
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        Question.findByIdAndRemove(req.body.questionid, function deleteQuestion(err) {
            if (err) { return next(err); }
            //Success - go to direction list
            res.redirect('/catalog/direction/' + directionid)
        })

    });
};

//Display Question update form on GET.
exports.question_update_get = function (req, res) {
    // res.send('NOT IMPLEMENTED: Question update GET');
    async.parallel({
        question: function (callback) {
            Question.findById(req.params.id).populate('test').populate('direction').exec(callback);

        },
        // res.render('question_form', { title: 'Create Question', numOfOptions: results.question.test.numOfOptions, id: req.params.id, question: null, errors: null });

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.question == null) {
            var err = new Error('Question not found');
            err.status = 404;
            return next(err);
        }
        res.render('question_form', { title: 'Update Question', numOfOptions: results.question.test.numOfOptions, id: req.params.id, question: results.question, errors: null });

    });
};

//Handle Question update on POST.
exports.question_update_post = [
    body('question', 'Question must not be empty').trim().isLength({ min: 1 }),
    body('a', 'Option a must not be empty').trim().isLength({ min: 1 }),
    body('b', 'Option b must not be empty').trim().isLength({ min: 1 }),
    body('c', 'Option c must not be empty').trim().isLength({ min: 1 }),
    body('d', 'Option d must not be empty').trim().isLength({ min: 1 }),
    body('ans', 'Correct Answer must not be empty').trim().isLength({ min: 1 }),
    body('solution', 'Solution must not be empty').trim().isLength({ min: 1 }),

    //Process request after validation and sanitization.
    (req, res, next) => {
        //Extract the validation errors from a request.
        const errors = validationResult(req);

        //Create a Question object with trimmed data and old id.
        if (req.body.e) {
            var question = new Question(
                {
                    question: req.body.question,
                    // img: {
                    //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.body.image)),
                    //     contentType: 'image/png'
                    // },
                    a: req.body.a,
                    b: req.body.b,
                    c: req.body.c,
                    d: req.body.d,
                    e: req.body.e,
                    ans: req.body.ans,
                    solution: req.body.solution,
                    test: req.body.test,
                    direction: req.body.direction,
                    _id: req.params.id
                });
            if (!errors.isEmpty()) {

                //There are errors. Render form again with sanitized values/error messages.
                // if(req.body.e) {
                //     var numOfOptions=5;
                // }
                res.render('question_form', { title: 'Update Question', numOfOptions: 5, id: req.params.id, question: question, errors: errors.array() });
                return;
            }
            else {
                //Data from form is valid. Update the record.
                Question.findByIdAndUpdate(req.params.id, question, {}, function (err, thequestion) {
                    if (err) { return next(err); }
                    //Successful - redirect to question detail page.
                    res.redirect(thequestion.url)
                });
            }

        }
        else {
            var question = new Question(
                {
                    question: req.body.question,
                    // img: {
                    //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.body.image)),
                    //     contentType: 'image/png'
                    // },
                    a: req.body.a,
                    b: req.body.b,
                    c: req.body.c,
                    d: req.body.d,
                    // e: req.body.e,
                    ans: req.body.ans,
                    solution: req.body.solution,
                    test: req.body.test,
                    direction: req.body.direction,
                    _id: req.params.id
                });
            if (!errors.isEmpty()) {

                //There are errors. Render form again with sanitized values/error messages.
                // if(req.body.e) {
                //     var numOfOptions=5;
                // }
                res.render('question_form', { title: 'Update Question', numOfOptions: 4, id: req.params.id, question: question, errors: errors.array() });
                return;
            }
            else {
                //Data from form is valid. Update the record.
                Question.findByIdAndUpdate(req.params.id, question, {}, function (err, thequestion) {
                    if (err) { return next(err); }
                    //Successful - redirect to question detail page.
                    res.redirect(thequestion.url)
                });
            }

        }

    }
];