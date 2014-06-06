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
router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
    res.render('reg', { 
    	title: '注册',
    	user: req.session.user,
    	success: req.flash('success').toString(),
    	error: req.flash('error').toString()
    });
});


//注册请求
router.post('/reg', checkNotLogin);
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
router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
    res.render('login', {
    	title: '登录',
    	user: req.session.user,
    	success: req.flash('success').toString(),
    	error: req.flash('error').toString()
    });
});

//登录请求
router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');

	User.get(req.body.name, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在!');
			return res.redirect('/login');
		}
		debugger;
		if (user.password !== password) {
			req.flash('error', '密码错误!');
			return res.redirect('/login');
		}

		req.session.user = user;
		req.flash('success', '登录成功!');
		res.redirect('/');
	});
});

//发表博客页面
router.get('/post', checkLogin);
router.get('/post', function(req, res) {
    res.render('post', {
    	title: '登录',
    	user: req.session.user,
    	success: req.flash('success').toString(),
    	error: req.flash('error').toString()
    });
});

//发表博客页面
router.post('/post', checkLogin);
router.post('/post', function(req, res) {
});

//登出
router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
	req.session.user = null;
	req.flash('success', '登出成功！');
	res.redirect('/login');
});


function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error','未登录');
		res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error','已登录');
		res.redirect('back');
	}
	next();
}

module.exports = router;
