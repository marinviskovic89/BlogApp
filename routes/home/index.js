const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {isEmpty} = require("../../helpers/upload-helper");
const Comment = require("../../models/Comment");
const LocalStrategy = require('passport-local').Strategy;

router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res)=>{
    if(req.user){
        var is_user = req.user
        if(req.user.role == 'admin'){
            var user = req.user

        }
    }
    const perPage = 5;
    const page = req.query.page || 1;

    Post.find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then(posts =>{
        Post.count().then(postCount=>{
            Category.find({}).then(categories=>{
                res.render('home/index', {
                    posts: posts,
                    categories: categories,
                    user: user,
                    is_user: is_user,
                    current: parseInt(page),
                    pages: Math.ceil(postCount / perPage)

                });
            });

        });

    });

});

router.post('/create', (req, res)=>{

    let errors = [];

    if(!req.body.title) {
        errors.push({ message: 'please add a title'});
    }

    if(!req.body.body) {
        errors.push({ message: 'please add a description'});
    }

    if(errors.length > 0){

        res.render('admin/posts/create', {
            errors: errors
        })
    } else {

        let filename = 'slika1.jpg';

        if (!isEmpty(req.files)) {

            let file = req.files.file;
            filename = Date.now() + '-' + file.name;

            file.mv('./public/uploads/' + filename, (err) => {

                if (err) throw err;

            });
        }
        let allowComments = true;

        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        const newPost = new Post({
            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.body,
            category:req.body.category,
            file: filename
        });
        newPost.save().then(savedPost => {

            req.flash('success_message', `Post  ${savedPost.title} was created successfully`);
            res.redirect('/');

        }).catch(error => {

            console.log(error, "could not save post");

        });
    }

});


router.post('/', (req, res)=>{
    Post.findOne({_id: req.body.id}).then(post=>{


        const newComment = new Comment({

            user: req.user.id,
            body: req.body.body,
            approveComment: true

        });



        post.comments.push(newComment);

        post.save().then(savedPost=>{

            newComment.save().then(savedComment=>{

                req.flash('success_message', 'Your comment will reviewed in a moment');
                res.redirect(`/post/${post.id}`);


            })



        });


    });
});

router.get('/about', (req, res)=>{
    if(req.user){
        var is_user = req.user
        if(req.user.role == 'admin'){
            var user = req.user
        }
    }
    res.render('home/about', {user: user, is_user: is_user});
});

router.get('/create', (req, res)=>{
    if(req.user){
        is_user = req.user
        if(req.user.role == 'admin'){
            var user = req.user
        }
        if(req.user.allowUser == true){
            var allowUser = req.user.allowUser;
        }
    }
    Category.find({}).then(categories=>{
        res.render('home/create', {categories: categories, user: user,allowUser: allowUser, is_user: is_user});
    });
});

router.get('/login', (req, res)=>{
    if(req.user){
        var is_user = req.user
        if(req.user.role == 'admin'){
            var user = req.user
        }
    }
    post_id = req.query.param;
    res.render('home/login', {post: post_id, user: user, is_user: is_user});
});

// App Login

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{


    User.findOne({email: email}).then(user=>{

        if(!user) return done(null, false, {message: 'No user found'});

        bcrypt.compare(password, user.password, (err, matched)=>{

            if(err) return err;

            if(matched){
                return done(null, user);
            } else {
                return done(null, false, {message: 'Incorrect password'});
            }
        });
    });

}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


router.post('/login', (req, res, next)=>{
    post = req.body.hiddenField;
    if(post) {
        passport.authenticate('local', {
            successRedirect: '/post/' + post,
            failureRedirect: '/login',
            failureFlash: true

        })(req, res, next);
    }
    else{
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true

        })(req, res, next);
    }
});

router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });

});
router.get('/register', (req, res)=>{
    if(req.user){
        if(req.user.role == 'admin'){
            var user = req.user
        }
    }
    res.render('home/register', {user: user});
});

router.post('/register', (req, res)=>{

    let errors = [];

    if(!req.body.firstName) {
        errors.push({ message: 'enter the firstName'});
    }

    if(!req.body.lastName) {
        errors.push({ message: 'enter the lastName'});
    }
    if(!req.body.email) {
        errors.push({ message: 'enter the email'});
    }
    if(!req.body.password) {
        errors.push({ message: 'please add a password'});
    }
    if(!req.body.passwordConfirm) {
        errors.push({ message: 'this field cannot be blank'});
    }
    if(req.body.password !== req.body.passwordConfirm) {
        errors.push({ message: 'password fields do not match'});
    }

    if(errors.length > 0) {

        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email

        })
    }else
        {
            User.findOne({email: req.body.email}).then(user=>{

                if(!user){

                    const newUser = new User({

                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        password: req.body.password,
                        role: 'user',
                        allowUser: true

                    });

                    bcrypt.genSalt(10, (err, salt)=>{

                        bcrypt.hash(newUser.password, salt, (err, hash)=>{

                            newUser.password = hash;

                            newUser.save().then(savedUser=>{

                                req.flash('success_message', 'You are now registered');
                                res.redirect('/login');

                            });

                        });

                    });
                } else {

                    req.flash('error_message', 'That email exist please login');

                    res.redirect('/login');
                }

            });

        }

});

router.get('/post/:id', (req, res)=>{
    if(req.user){
        var is_user = req.user
        if(req.user.role == 'admin'){
            var user = req.user
        }
        if(req.user.allowUser == true){
            var allowUser = req.user.allowUser;
        }
    }
    Post.findOne({_id: req.params.id})
        .populate({path: 'comments', match: {approveComment: true}, populate: {path: 'user', model: 'users', is_user: is_user}})
        .populate('user')
        .then(post =>{
        Category.find({}).then(categories=>{
            res.render('home/post', {post: post, categories: categories, data: req.user, user: user, is_user: is_user, allowUser: allowUser});


        });

    });
});

router.get('/category/:id', (req, res)=>{
    if(req.user){
        var is_user = req.user
        if(req.user.role == 'admin'){
            var user = req.user
        }
    }
    Post.find({category: req.params.id})
        .then(posts =>{
            Category.find({}).then(categories=>{
                res.render('home/category', {
                    posts: posts,
                    categories: categories,
                    user: user,
                    is_user: is_user,
                });

            });

        });
});
//search

router.get("/search", async(req, res)=>{
    if(req.user){
        var is_user = req.user
        if(req.user.role == 'admin'){
            var user = req.user
        }
    }
    let searchUser = User.find({firstName: req.query.dsearch}).then(user1=>{
        user1.map(us => {
            Post.find({user: us.id})
                .populate('category')
                    .populate('user')
                    .then(posts =>{
                        Category.find({}).then(categories=> {
                            res.render('home/index', {
                                posts: posts,
                                user: user,
                                is_user: is_user,
                                categories: categories
                            });
                        });
            });
        })
    });
});

module.exports = router;

