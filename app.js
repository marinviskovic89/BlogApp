const express = require('express');
const app = express();
const path = require('path');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const flash = require('connect-flash');
const session = require('express-session');
const {mongoDbUrl} = require('./config/database');
const passport = require('passport');
const User = require('./models/User')

mongoose.Promise = global.Promise;

mongoose.connect(mongoDbUrl).then(db =>{

    console.log('MONGO connected ');

}).catch(error=> console.log("COULD NOT CONNECT" + error));

//Using Static

app.use(express.static(path.join(__dirname, 'public')));

//Set View Engine

const {select, generateDate, paginate} = require('./helpers/handlebars-helpers');
app.engine('handlebars', engine({handlebars: allowInsecurePrototypeAccess(Handlebars), defaultLayout: 'home', helpers: {select: select, generateDate: generateDate, paginate: paginate }}));
app.set('view engine', 'handlebars');

//Upload Middleware

app.use(upload());

// Body Parser

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Method Override

app.use(methodOverride('_method'));

app.use(session({

    secret: 'mvi123',
    resave: true,
    saveUninitialized: true

}));

app.use(flash());

// Passport

app.use(passport.initialize());
app.use(passport.session());

// Local variables using Middleware

app.use((req, res, next)=>{

    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message') ;
    res.locals.error_message = req.flash('error_message');
    res.locals.form_errors = req.flash('form_errors');
    res.locals.error = req.flash('error');
    next();
});

//Load Routes

const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');
const handlebars = require("handlebars");

//Use Routes

app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);

app.listen(4500, ()=>{

    console.log('listening on port 4500 ');
});