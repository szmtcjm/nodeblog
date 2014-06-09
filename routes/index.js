var express = require('express'),
	router = express.Router(),
	crypto = require('crypto'),
	User = require('../models/user'),
	Post = require('../models/post'),
	Comment = require('../models/comment.js'),
	fs = require('fs'),
	path = require('path'),
	formidable = require('formidable');

// GET home page.
router.get('/', function(req, res) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	Post.getTen(null, page, function(err, posts, total) {
		if (err) {
			posts = [];
		}
		res.render('index', { 
	    	title: '主页',
	    	user: req.session.user,
	    	posts: posts,
	    	page: page,
	    	isFirstPage: (page - 1) === 0,
	    	isLastPage: ((page - 1) * 10 + posts.length) === total,
	    	success: req.flash('success').toString(),
	    	error: req.flash('error').toString()
	    });
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
	var currentUser = req.session.user,
		tags = [req.body.tag1, req.body.tag2, req.body.tag3],
		post = new Post(currentUser.name, req.body.title, req.body.post, tags);

	post.save(function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发布成功');
		res.redirect('/');
	})
});

//登出
router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
	req.session.user = null;
	req.flash('success', '登出成功！');
	res.redirect('/login');
});

router.get('/upload', checkLogin);
router.get('/upload', function(req, res) {
	res.render('upload', {
		title: '文件上传',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/upload', checkLogin);
router.post('/upload', function(req, res) {	
	var form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.uploadDir = 'public/images';
	form.on('error', function(err) {
		req.flash('error', '上传过程有问题');
		req.resume();
	});
	form.on('aborted', function() {
		req.flash('error', '上传终止');
		res.redirect('/upload');
	});
	form.parse(req, function(err, fields, files) {
		var i, file;
		//删除空文件
		for (i in files) {
			file = files[i];
			if (file.size === 0 && file.name === '') {
				fs.unlinkSync(file.path);
			}
		}
		req.flash('succes', '上传成功');
		res.redirect('/upload');
	});
});

router.get('/archive', function (req, res) {
  Post.getArchive(function (err, posts) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    res.render('archive', {
      title: '存档',
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.get('/tags', function (req, res) {
  	Post.getTags(function (err, posts) {
  	  	if (err) {
  	  	  	req.flash('error', err); 
  	  	  	return res.redirect('/');
  	  	}
  	  	res.render('tags', {
  	  	  	title: '标签',
  	  	  	posts: posts,
  	  	  	user: req.session.user,
  	  	  	success: req.flash('success').toString(),
  	  	  	error: req.flash('error').toString()
  	  	});
  	});
});

router.get('/tags/:tag', function (req, res) {
  	Post.getTag(req.params.tag, function (err, posts) {
  	  	if (err) {
  	  	  	req.flash('error',err); 
  	  	  	return res.redirect('/');
  	  	}
  	  	res.render('tag', {
  	  	  	title: 'TAG:' + req.params.tag,
  	  	  	posts: posts,
  	  	  	user: req.session.user,
  	  	  	success: req.flash('success').toString(),
  	  	  	error: req.flash('error').toString()
  	  	});
  	});
});

router.get('/u/:name', function(req, res) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	User.get(req.params.name, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}

		Post.getTen(user.name, page, function(err, posts, total) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name,
				posts: posts,
				user: req.session.user,
				page: page,
        		isFirstPage: (page - 1) == 0,
        		isLastPage: ((page - 1) * 10 + posts.length) == total,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
});

router.get('/u/:name/:day/:title', function(req, res) {
	var params = req.params;
	Post.getOne(params.name, params.day, params.title, function(err, post) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('article', {
			title: req.params.title,
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

//添加评论
router.post('/u/:name/:day/:title', function (req, res) {
  	var date = new Date(),
  	    time = date.getFullYear() + "-" + (date.getMonth() + 1) + 
  	    	"-" + date.getDate() + " " + date.getHours() + ":" + 
  	    	(date.getMinutes() < 10 ? '0' + 
  	    	date.getMinutes() : date.getMinutes());
  	var comment = {
  	    name: req.body.name,
  	    email: req.body.email,
  	    website: req.body.website,
  	    time: time,
  	    content: req.body.content
  	};
  	var newComment = new Comment(req.params.name, req.params.day, 
  		req.params.title, comment);
  	newComment.save(function(err) {
  	  	if (err) {
  	  	  	req.flash('error', err); 
  	  	  	return res.redirect('back');
  	  	}
  	  	req.flash('success', '留言成功!');
  	  	res.redirect('back');
  	});
});

router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title', function(req, res) {
	var currentUser = req.session.user;
	Post.edit(currentUser.name, req.params.day, req.params.title, 
		function(err, post) {
			if (err) {
				req.flash('error', err);
				res.redirect('back');
			}
			res.render('edit', {
				title: '编辑',
				post: post,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
});

router.post('/edit/:name/:day/:title', checkLogin);
router.post('/edit/:name/:day/:title', function(req, res) {
	var currentUser = req.session.user;
	Post.update(currentUser.name, req.params.day, req.params.title, 
		req.body.post, function(err) {
			var url = '/u/' + req.params.name + '/' + req.params.day + 
				'/' + req.params.title;
			if (err) {
				req.flash('error', err);
				return res.redirect(url); //出错！返回文章页
			}
			req.flash('success', '修改成功!');
			res.redirect(url); //成功！返回文章页
	});
});

router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', function(req, res) {
	var currentUser = req.session.user;
	Post.remove(currentUser.name, req.params.day, req.params.title, 
		function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '删除成功!');
			res.redirect('/');
	});
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
