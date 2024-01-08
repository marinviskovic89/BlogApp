const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');


router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{

    Comment.find({}).populate('user').then(comments=>{
        Post.find({}).then(posts=>{
            res.render('admin/comments', {comments: comments, posts: posts});

        });
    });
});

router.post('/', (req, res)=>{

    Post.findOne({_id: req.body.id}).then(post=>{


        const newComment = new Comment({

            user: req.user.id,
            body: req.body.body

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

router.delete('/:id', (req, res)=>{

    Comment.findByIdAndRemove({_id: req.params.id}).then(deleteItem=>{

        Post.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}, (err, data)=>{
            if(err) console.log(err);

            res.redirect('/admin/comments');
        });

    });
});

router.post('/approve-comment', (req, res)=>{


    Comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}, (err, result)=>{


        if(err) return err;


        res.send(result)


    });

});

router.post('/approve-user', (req, res)=>{


    User.findByIdAndUpdate(req.body.id, {$set: {allowUser: req.body.allowUser}}, (err, result)=>{


        if(err) return err;


        res.send(result)


    });

});
module.exports = router;