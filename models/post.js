var mongodb = require('./db.js');
var moment = require('moment');
moment.locale('zh-cn');

class Post{
    constructor(postid,user,post,time){
        this.postid = postid;
        this.user = user;
        this.post = post;
        this.like = [];
        this.comment = [];
        this.time = time;
    }

    save(callback){
        if(!this.user){
            return callback("请登录后再发表");
        }
        var post = new Post(this.postid,this.user,this.post,this.time);
        mongodb.open((err,db)=>{
            if(err){
                return callback(err);
            }
            //读取posts集合
            db.collection('posts',(err,collection)=>{
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                collection.insert(post,(err,post)=>{
                    mongodb.close();
                    callback(err,post);
                });
            });
        });
    }

    static get(username,callback){
        mongodb.open((err,db)=>{
            if(err){
                return callback(err);
            }
            //读取posts集合
            db.collection('posts',(err,collection)=>{
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                collection.find({"user.name":username}).sort({time:-1}).toArray((err,docs)=>{
                    mongodb.close();
                    if(err){
                        callback("err",null);
                    }
                    //封装文档为post对象
                    var posts =[];
                    docs.forEach((doc,index)=>{
                        var relativeTime = moment(doc.time).fromNow();
                        var post = new Post(doc.postid,doc.user,doc.post,relativeTime);
                        posts.push(post);
                    });
                    callback(null,posts);
                });
            });
        });
    }

    static delete(postid,callback){
        mongodb.open((err,db)=>{
            if(err){
                return callback(err);
            }
            //读取posts集合
            db.collection('posts',(err,collection)=>{
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                collection.remove({"postid":postid.toString()},(err,result)=>{
                    mongodb.close();
                    callback(err);
                });
            });
        });
    }

}

module.exports = Post;
