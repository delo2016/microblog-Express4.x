var mongodb = require('./db.js');

class User{
    constructor(name,password,followers,following,likeBlog){
        this.name = name;
        this.password = password;
        this.followers = followers == null ? []:followers ;
        this.following = following == null ? []:following;
        this.likeBlog = likeBlog == null ? [] :likeBlog;
    }
    save(callback){
        let user = new User(this.name,this.password);
        mongodb.open((err,db)=>{
            if(err){
                return callback(err);
            }
            //读取users集合
            db.collection('users',(err,collection)=>{
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                //为name添加索引
                collection.ensureIndex('name',{unique:true});
                //写入usesr文档
                collection.insert(user,{safe:true},(err,user)=>{
                    mongodb.close();
                    callback(err,user);
                });
            });
        });
    
    }

    update(user,callback){
        mongodb.open((err,db)=>{
            if(err){
                return callback(err);
            }
            db.collection('users',(err,collection)=>{
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                collection.update({name:user.name},{$set:{password:user.password}},(err,result)=>{
                    mongodb.close();
                    return callback(err,result);
                })
            });
        })
    }

    static get(username,callback){
        mongodb.open((err,db)=>{
            if(err){
                return callback(err);
            }
            //读取users集合
            db.collection('users',(err,collection)=>{
                if(err){
                    mongodb.close();
                    return callback(err);
                }
    
                //查找name属性为username的文档
                collection.findOne({name:username},(err,doc)=>{
                     mongodb.close();
                    if(doc){
                        //封装文档为User对象
                        let user = new User(doc.name,doc.password,doc.followers,doc.following,doc.likeBlog);
                        callback(err,user);
                    }
                    else{
                        callback(err,null);
                    }
                });
               
            });
        });
    }
}

module.exports = User;

