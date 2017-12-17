var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var flash = require('connect-flash');

// router.get('/', function(req, res) {
//   res.render('index', { title: '首页' });
// });

router.get('/reg',checkNotLogin);

router.get('/reg',function(req,res){
  res.render('reg',{title:'用户注册'});
});

router.post('/reg',function(req,res){
  if(req.body['password-repeat']!= req.body['password']){
    req.flash('error','两次口令不一致！');
    return res.redirect('/reg');
  }
  //生成口令散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');
  
  var newUser = new User({
    name:req.body.username,
    password:password,
  });
  //检查该用户名是否已被注册
  User.get(newUser.name,function(err,user){
    if(user){
      err='该用户名已被注册';
    }
    
    if(err){
      req.flash('error',err);
      return res.redirect('/reg');
    }
    
    //数据库没有该用户名，可以新增
    newUser.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/reg');
      }
      //注册成功，保存用户到session
      req.session.user = newUser;
      req.flash('success','注册成功');
      res.redirect('/');

    });

  });

});

router.get('/login',checkNotLogin);

router.get('/login',function(req,res){
  res.render('login',{title:'用户登录'});
});

router.post('/login',function(req,res){

  //生成口令散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  var loginUser = {name:req.body.username,password:password}
  User.get(loginUser.name,function(err,user){
    if(err){
      req.flash('error',err);
      return res.redirect('/login');
    }
    if(!user){
      req.flash('error','该用户不存在！');
      return res.redirect('/login');
    }
    if(user.password !== loginUser.password){
      req.flash('error','密码错误');
      return res.redirect('/login');
    }
    req.session.user=user;
    res.redirect('/u/'+user.name);
    req.flash('success','登录成功！');

  })
});


router.get('/logout',checkLogin);

router.get('/logout',function(req,res){
  req.session.user = null;
  req.flash('success','登出成功！');
  res.redirect('/');
});

router.get('/post',checkLogin);

router.post('/post',function(req,res){
  var currUser = req.session.user;
  var post = new Post(currUser,req.body.post,null);
  post.save(function(err,post){
    if(err){
      req.flash('error','发表失败！');
      return res.redirect('/');
    }
    req.flash('success','发表成功！');
    res.redirect('/u/'+currUser.name);
  });
});

router.get('/u/:user',function(req,res){
  User.get(req.params.user,function(err,user){
    if(!user){
      req.flash('error','用户不存在');
      return res.redirect('/');
    }
    Post.get(user.name,function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('user',{
        title:user.name,
        posts:posts
      });
    })
  })
});

router.get('/',function(req,res){
  Post.get(null,function(err,posts){
    if(err){
      posts=[];
    }
    res.render('index',{
      title:'首页',
      posts:posts
    })
  })
});

function checkNotLogin(req,res,next){
  if(req.session.user){
    req.flash('error','已登入');
    res.redirect('/');
  }
  next();
}

function checkLogin(req,res,next){
  if(!req.session.user){
    req.flash('error','未登入');
    res.redirect('/login');
  }
  next();
}



module.exports = router;

