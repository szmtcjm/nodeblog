var express = require('express');
var router = express.Router();

// GET home page.
router.get('/', function(req, res) {
    res.render('index', { title: '主页' });
});

//注册页面
router.get('/reg', function(req, res) {
    res.render('reg', {title: '注册'});
});


//注册请求
router.post('/reg', function(req, res) {
});

//登录页面
router.get('/login', function(req, res) {
    res.render('login', {title: '登录'});
});

//登录请求
router.post('/login', function(req, res) {
});

//发表博客页面
router.get('/post', function(req, res) {
    res.render('post', {title: '发表'});
});

//发表博客页面
router.post('/post', function(req, res) {
});

//发表博客页面
router.get('/logout', function(req, res) {
});

module.exports = router;
