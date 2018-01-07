var router = require('./index');
var crypto = require('crypto');
var moment = require('moment');
var Post = require('../models/post.js');
var flash = require('connect-flash');
var uuid = require('uuid/v1');
var User = require('../models/user.js');

router.get('/post',checkLogin);

router.post('/post',(req,res)=>{
  var currUser = req.session.user;
  var post = new Post(uuid(),currUser,req.body.post,moment().format());
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