var mongodb = require('./db.js');
var uuid = require('uuid/v1');

function Post(postid,user,post,time){
    if(postid){
        this.postid = postid;
    }else{
        this.postid = uuid();
    }
    this.user = user;
    this.post = post;
    if(time){
        this.time = time;
    }else{
        this.time = new Date();
    }
    
}

module.exports = Post;

Post.prototype.save = function save(callback){
    if(!this.user){
        return callback("请登录后再发表");
    }
    var post = {
        postid:this.postid,
        user:this.user,
        post:this.post,
        time:this.time
    };
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
            //为user添加索引
            //collection.ensureIndex('user',{unique:false});
            //写入post文档
            collection.insert(post,(err,post)=>{
                mongodb.close();
                callback(err,post);
            });
        });
    });

}


Post.get = function get(username,callback){
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

			//查找user属性为username的文档
            collection.find({"user.name":username}).sort({time:-1}).toArray((err,docs)=>{
                mongodb.close();
                if(err){
                    callback("err",null);
                }
                //封装文档为post对象
                var posts =[];
                docs.forEach((doc,index)=>{
                    var post = new Post(doc.postid,doc.user,doc.post,doc.time);
                    posts.push(post);
                });
                callback(null,posts);
            });
		});
	});
};

Post.delete = function(postid,callback){
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
            collection.removeOne({"postid":postid.toString()},(err,result)=>{
                mongodb.close();
                callback(err);
            });
        });
    });
}
