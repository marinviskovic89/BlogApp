const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const faker = require('faker');
const {userAuthenticated} = require('../../helpers/authentication');
const User = require("../../models/User");
const Category = require("../../models/Category");

router.all('/*', userAuthenticated, (req, res, next)=>{
    if(req.user.role == 'admin'){
        req.app.locals.layout = 'admin';
        next();
    }
});

router.get('/', (req, res)=>{
    const mostComments = [];
    const postTitle = [];
    const usersId = [];
    var map1 = new Map();
    var map2 = new Map();
    Post.find({})
        .then(posts =>{
            posts.map(post => {
                map1.set(post.comments.length, post.title)
                map2.set(post.comments.length, post.id)
            })
            map1 = new Map([...map1.entries()].sort((a, b) => b[0] - a[0]));
            for (let [key, value] of map1) {
                mostComments.push(key)
                postTitle.push(value);
            }
            map2 = new Map([...map2.entries()].sort((a, b) => b[0] - a[0]));
            for (let [key, value] of map2) {
                mostComments.push(key)
                usersId.push(value);
            }
            console.log(mostComments)
            console.log(postTitle)
            res.render('admin/index', {mostComments: mostComments.slice(0,5), postTitle: postTitle.slice(0,5), usersId: usersId.slice(0, 5)});

    });
});

router.get('/topusers', async(req, res)=>{
    const allUsers = await User.find({});
    const postPromise = allUsers.map(async (uId)=>{
        const currentUser = await User.findById(uId);
        const singlePostCount = await Post.countDocuments({user: uId});
        return {userName: currentUser.firstName, postCount:singlePostCount};
    });
    const loadedUserPostCounts = await Promise.all(postPromise);
    const sortedUserPostCounts = loadedUserPostCounts.sort(sortOn("postCount"));

    const usersMostPost = []
    for ( let i = 0; i < sortedUserPostCounts.length; i++) {
        usersMostPost.push(sortedUserPostCounts[i]['userName']);
    }
    const postCounts = []
    for ( let i = 0; i < sortedUserPostCounts.length; i++) {
        postCounts.push(sortedUserPostCounts[i]['postCount']);
    }
    res.render('admin/topUsers', {usersMostPost: usersMostPost.slice(0,5), postCounts: postCounts.slice(0,5)});
});

router.get('/topcomments', async(req, res)=>{
    const allUsers = await User.find({});
    const postPromise = allUsers.map(async (uId)=>{
        const currentUser = await User.findById(uId);
        const singlePostCount = await Comment.countDocuments({user: uId});
        return {userName: currentUser.firstName, commCount:singlePostCount};
    });
    const loadedUserPostCounts = await Promise.all(postPromise);
    const sortedUserCommCounts = loadedUserPostCounts.sort(sortOn("commCount"));

    const usersMostComm = []
    for ( let i = 0; i < sortedUserCommCounts.length; i++) {
        usersMostComm.push(sortedUserCommCounts[i]['userName']);
    }
    const commCounts = []
    for ( let i = 0; i < sortedUserCommCounts.length; i++) {
        commCounts.push(sortedUserCommCounts[i]['commCount']);
    }
    res.render('admin/topComments', {usersMostComm: usersMostComm.slice(0,5), commCounts: commCounts.slice(0,5)});
});
function sortOn(property) {
    return function (a, b) {
        if (a[property] > b[property]) {
            return -1;
        } else if (a[property] < b[property]) {
            return 1;
        } else {
            return 0;
        }
    };
}

router.get("/search", async(req, res)=>{
    if(req.user){
        is_user = req.user
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
                        res.render('admin/posts', {
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

router.post('/generate-fake-posts', (req, res)=>{

    for(let i = 0; i < req.body.amount; i++){

        let post = new Post();

        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.random.boolean();
        post.body = faker.lorem.sentence();

        post.save(function(err){

            if (err) throw err;

        });
    }

    res.redirect('/admin/posts');

});

module.exports = router;