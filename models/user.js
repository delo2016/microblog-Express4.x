var mongodb = require('./db.js');

function User(user){
    this.name = user.name;
    this.password = user.password;
}

module.exports = User;

User.prototype.save = function save(callback){
    var user = {
        name:this.name,
        password:this.password
    }
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取users集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //为name添加索引
            collection.ensureIndex('name',{unique:true});
            //写入usesr文档
            collection.insert(user,{safe:true},function(err,user){
                mongodb.close();
                callback(err,user);
            });
        });
    });

}

User.prototype.update = function update(user,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
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


User.get = function get(username,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取users集合
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找name属性为username的文档
			collection.findOne({name:username},function(err,doc){
                 mongodb.close();
				if(doc){
					//封装文档为User对象
					var user = new User(doc);
					callback(err,user);
				}
				else{
					callback(err,null);
				}
			});
           
		});
	});
};
