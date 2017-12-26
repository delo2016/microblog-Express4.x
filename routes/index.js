var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var flash = require('connect-flash');

router.get('/',(req,res)=>{
  var loginName='';
  if(req.session.user !== null && req.session.user !== undefined) {
    loginName = req.session.user.name;
  }
  Post.get(loginName,(err,posts)=>{
    if(err){
      posts=[];
    }
    res.render('blog',{
      title:'首页',
      posts:posts
    })
  })
});

router.get('/reg',checkNotLogin);

router.get('/reg',(req,res)=>{
  res.render('reg',{title:'用户注册'});
});

router.post('/reg',(req,res)=>{
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
  User.get(newUser.name,(err,user)=>{
    if(user){
      err='该用户名已被注册';
    }
    
    if(err){
      req.flash('error',err);
      return res.redirect('/reg');
    }
    
    //数据库没有该用户名，可以新增
    newUser.save((err)=>{
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

router.get('/login',(req,res)=>{
  res.render('login',{title:'用户登录'});
});

router.post('/login',(req,res)=>{

  //生成口令散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  var loginUser = {name:req.body.username,password:password}
  User.get(loginUser.name,(err,user)=>{
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

router.get('/logout',(req,res)=>{
  req.session.user = null;
  req.flash('success','登出成功！');
  res.redirect('/');
});

router.get('/post',checkLogin);

router.post('/post',(req,res)=>{
  var currUser = req.session.user;
  var post = new Post(null,currUser,req.body.post,null);
  post.save((err,post)=>{
    if(err){
      req.flash('error','发表失败！');
      return res.redirect('/');
    }
    req.flash('success','发表成功！');
    res.redirect('/u/'+currUser.name);
  });
});

router.get('/u/:user',(req,res)=>{
  if(req.session.user!==undefined){
    User.get(req.params.user,(err,user)=>{
      if(!user){
        req.flash('error','用户不存在');
        return res.redirect('/');
      }
      Post.get(user.name,(err,posts)=>{
        if(err){
          req.flash('error',err);
          return res.redirect('/');
        }
        res.render('blog',{
          title:user.name,
          posts:posts
        });
      })
    })
  }else{
    return res.redirect('/');
  }
});

router.get('/post/delete/:postid',checkLogin);

router.get('/post/delete/:postid',(req,res)=>{
  if(req.session.user!==null || req.session.user!= undefined){
    Post.delete(req.params.postid,(err)=>{
      if(err){
        req.flash('error','删除失败！');
        return res.redirect('/u/'+req.session.user.name);
      }
      res.redirect(303,'/u/'+req.session.user.name);
    })
  }
})


function checkNotLogin (req,res,next){
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

