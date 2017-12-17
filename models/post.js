var mongodb = require('./db.js');
//var uuid = require('node-uuid');

function Post(username,post,time){
    this.user = username;
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
        //_id:uuid.v1(),
        user:this.user,
        post:this.post,
        time:this.time
    };
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //为user添加索引
            //collection.ensureIndex('user',{unique:false});
            //写入post文档
            collection.insert(post,function(err,post){
                mongodb.close();
                callback(err,post);
            });
        });
    });

}


Post.get = function get(username,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
                mongodb.close();
				return callback(err);
			}

			//查找user属性为username的文档
            collection.find({"user.name":username}).sort({time:-1}).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    callback("err",null);
                }
                //封装文档为post对象





                var posts =[];
                docs.forEach(function(doc,index){
                    var post = new Post(doc.user,doc.post,doc.time);
                    posts.push(post);
                });
                callback(null,posts);
            });
		});
	});
};
