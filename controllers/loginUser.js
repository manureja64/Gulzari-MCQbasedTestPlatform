const bcrypt = require('bcrypt')
const User = require('../models/User')

module.exports = (req, res) => {
    const { username, password } = req.body;


    // check('username', 'Username is required').not().isEmpty();
    // check('password', 'Password is required').not().isEmpty();

    User.findOne({ username: username }, (error, user) => {
        if (!user) {
            const validationErrors = new Error('User not found')
            // validationErrors.status = 404;
            req.flash('validationErrors', 'User Name field empty Or User not found');
            req.flash('data', req.body);

            // res.redirect('/auth/login')
        }
        if (error) {
            ///////////////////////
            // console.log("This is an error");
            // const err = new Error('User not found')

            // const validationErrors = Object.keys(err).map(key => err.message)

            const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message)
            req.flash('validationErrors', validationErrors)
            req.flash('data', req.body)
            // req.session.validationErrors = validationErrors
            //////////////////////    

            res.redirect('/auth/login')
        }

        // if (!user) {
        //     const validationErrors = new Error('User not found')
        //     validationErrors.status = 404;
        //     req.flash('validationErrors', validationErrors);
        //     req.flash('data', req.body);

        //     res.redirect('/auth/login')
        // }


        if (user) {
            bcrypt.compare(password, user.password, (error, same) => {
                if (same) {//if passwords match
                    //store user session, will talk about it later
                    req.session.userId = user._id
                    res.redirect('/')
                }
                else {
                    // ///////////////////////
                    // const validatonErrors = Object.keys(error.errors).map(key => error.errors[key].message)
                    // req.flash('validationErrors', validationErrors)
                    // req.flash('data', req.body)
                    // // req.session.validationErrors = validationErrors

                    // //////////////////////    
                    req.flash('validationErrors', 'Password Field is empty OR Password is Incorrect')
                    req.flash('data', req.body)
                    res.redirect('/auth/login')

                }
            })
        }
        else {
            // ///////////////////////
            // const validatonErrors = Object.keys(error.errors).map(key => error.errors[key].message)
            // req.flash('validationErrors', validationErrors)
            // req.flash('data', req.body)
            // // req.session.validationErrors = validationErrors
            // //////////////////////    
            // check('username', 'Username is required').not().isEmpty();
            // check('password', 'Password is required').not().isEmpty();

            res.redirect('/auth/login')

        }
    })
}