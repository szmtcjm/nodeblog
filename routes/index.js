var express = require('express'),
	router = express.Router(),
	crypto = require('crypto'),
	User = require('../models/user');

// GET home page.
router.get('/', function(req, res) {
    res.render('index', { 
    	title: '主页',
    	user: req.session.user,
    	success: req.flash('success').toString(),
    	error: req.flash('error').toString()
    });
});

//注册页面
router.get('/reg', function(req, res) {
    res.render('reg', { 
    	title: '注册',
    	user: req.session.user,
    	success: req.flash('success').toString(),
    	error: req.flash('error').toString()
    });
});


//注册请求
router.post('/reg', function(req, res) {
	var name = req.body.name,
		password = req.body.password,
		password_re = req.body['password-repeat'],
		md5,
		newUser;

	if (password_re !== password) {
		req.flash('error', '两次输入的密码不一致');
		return res.redirect('/reg');
	}

	User.get(name, function(err, user) {
		if (user) {
			req.flash('error', '用户名已存在！');
			return res.redirect('/reg');
		}

		md5 = crypto.createHash('md5');
		password = md5.update(req.body.password).digest('hex');
		newUser = new User({
			name: req.body.name,
			password: password,
			email: req.body.email
		});

		newUser.save(function(err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('reg');
			}
			req.session.user = user;
			req.flash('success', '注册成功');
			res.redirect('/');
		})
	})
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
