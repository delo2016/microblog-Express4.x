var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var flash = require('connect-flash');

/* GET users listing. */

router.get('/modifypassword/:username',checkLogin);

router.get('/modifypassword/:username',(req,res)=>{
  res.render('modifypassword',{title:'修改密码'});
})

router.post('/modifypassword/:username', (req, res)=> {

  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  var loginUser = new User({
    name:req.session.user.name,
    password:password
    }
  );
  User.get(req.params.username,(err,user)=>{
    var md5 = crypto.createHash('md5');
    var orignpwd = md5.update(req.body.orignpwd).digest('base64')
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    else if(!user){
      req.flash('error','该用户不存在！');
      return res.redirect('/login');
    }
    else if(req.body['password-repeat']!= req.body['password']){
      req.flash('error','两次密码不一致！');
      return res.redirect('/users/modifypassword/'+req.params.username);
    }
    else if( orignpwd !== user.password){
      req.flash('error','原密码输入有误！');
      return res.redirect('/users/modifypassword/'+req.params.username);
    }
    loginUser.update(loginUser,(err,result)=>{
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      if(result.result.n == 1){
        req.session.user = loginUser;
        req.flash('success','修改成功');
        return res.redirect('/u/'+loginUser.name);
      }
      req.flash('error','修改失败');
      res.redirect('/');
    })
  });
});

function checkLogin(req,res,next){
  if(!req.session.user){
    req.flash('error','未登入');
    res.redirect('/login');
  }
  next();
}

module.exports = router;
