var express = require('express');
var router = express.Router();

////// Image Upload Requirements- DOWN ///////
// var fs = require('fs');
// var path = require('path');

// var multer = require('multer');
// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'path.join(__dirname + ' / uploads / ' + req.file.filename')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// });
// var upload = multer({ storage: storage });
////// Image Upload Requirements- UP ////////


const authMiddleware = require('../middleware/authMiddleware');

//Require controller modules
var test_controller = require('../controllers/testController');
var direction_controller = require('../controllers/directionController');
var question_controller = require('../controllers/questionController');
var catalog_controller = require('../controllers/catalogController');

//Catalog ROUTE ///
router.get('/', catalog_controller.catalog);

//TEST ROUTES ///

// GET catalog TEST Page.
router.get('/test/create', authMiddleware, test_controller.test_create_get);

//POST request for Creating TEST Page.
router.post('/test/create', authMiddleware, test_controller.test_create_post);

//GET request to delete Test.
router.get('/test/:id/delete', test_controller.test_delete_get);

//POST request to delete Test.
router.post('/test/:id/delete', test_controller.test_delete_post);

//GET request to update Test.
router.get('/test/:id/update', test_controller.test_update_get);

//POST request to update Test.
router.post('/test/:id/update', test_controller.test_update_post);

//GET request for one Test.
router.get('/test/:id', test_controller.test_detail);

//GET request for all Tests.
router.get('/tests', test_controller.test_list);



//////////////////

//DIRECTION ROUTES ///

// GET request for Creating Direction Page.
router.get('/direction/create/:id', direction_controller.direction_create_get); //:id is the _id of test

//POST request for Creating Direction Page.
router.post('/direction/create/:id', direction_controller.direction_create_post); //:id is the _id of test

//GET request to delete Direction.
router.get('/direction/:id/delete', direction_controller.direction_delete_get);  //:id is the _id of direction

//POST request to delete Direction.
router.post('/direction/:id/delete', direction_controller.direction_delete_post);   //:id is the _id of direction

//GET request to update Direction.
router.get('/direction/:id/update', direction_controller.direction_update_get);     //:id is the _id of direction

//POST request to update Direction.
router.post('/direction/:id/update', direction_controller.direction_update_post);       //:id is the _id of direction

//GET request for one Direction.
router.get('/direction/:id', direction_controller.direction_detail);        //:id is the _id of direction

//GET request for all Directions.
router.get('/directions', direction_controller.direction_list);         //:id is the _id of direction

///////////////////

//////////////////

//QUESTION ROUTES ///

// GET request for Creating Question Page.
router.get('/question/create/:id', question_controller.question_create_get);    //:id is the _id of direction

//POST request for Creating Question Page.
router.post('/question/create/:id', question_controller.question_create_post);      //:id is the _id of direction
// router.post('/question/create/:id', upload.single('image'), question_controller.question_create_post);      //:id is the _id of direction

//GET request to delete Question.
router.get('/question/:id/delete', question_controller.question_delete_get);        //:id is the _id of test

//POST request to delete Question.
router.post('/question/:id/delete', question_controller.question_delete_post);      //:id is the _id of test

//GET request to update Question.
router.get('/question/:id/update', question_controller.question_update_get);        //:id is the _id of test

//POST request to update Question.
router.post('/question/:id/update', question_controller.question_update_post);      //:id is the _id of test
// router.post('/question/:id/update', upload.single('image'), question_controller.question_update_post);      //:id is the _id of test

//GET request for one Question.
router.get('/question/:id', question_controller.question_detail);           //:id is the _id of test

//GET request for all Questions.
router.get('/questions', question_controller.question_list);                //:id is the _id of test

module.exports = router;