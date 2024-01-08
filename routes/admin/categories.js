const faker = require('faker');
const Category = require('../../models/Category');
const Posts = require('../../models/Post');
const express = require('express');
const router = express.Router();

router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{

    Category.find({}).then(categories=>{
        res.render('admin/categories/index', {categories: categories});
    });

});

router.get('/edit/:id', (req, res)=>{

    Category.findOne({_id: req.params.id}).then(category=>{
        res.render('admin/categories/edit', {category: category});
    });

});

router.put('/edit/:id', (req, res)=>{

    Category.findOne({_id: req.params.id}).then(category=>{

        category.name = req.body.name;
        category.save(savedCategory=>{

            res.redirect('/admin/categories');

        });
    });
});

router.get('/posts/:id', (req, res)=>{
    Posts.find({category: req.params.id}).then(posts=>{
              res.render('admin/categories/posts', {posts: posts})
        });
});


router.post('/create', (req, res)=>{

    const newCategory = new Category({

        name: req.body.name

    });

    newCategory.save(savedCategory=>{

        res.redirect('/admin/categories');
    });

});

router.delete('/:id', (req, res)=>{

    Category.remove({_id: req.params.id}).then(result =>{

        res.redirect('/admin/categories');

    });

});

module.exports = router;