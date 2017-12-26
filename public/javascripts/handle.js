$(function(){
    $("#content").keyup(function(){
        //判断输入的字符串长度
        var content_len = $("#content").val().replace(/\s/g,"").length;
        $(".tips").text("已经输入"+content_len+"个字");
        if(content_len==0){
            // alert(content);
            $(".tips").text("");
            $("#send").addClass("disabled");
            return false;
        }else{
            $("#send").removeClass("disabled");
        }
    });
    $(".pic").click(function(){
        $(".select_Img").click();  	
    })
    $("#send").click(function(){
        var content=$("#content").html();
        //判断选择的是否是图片格式		 
        var imgPath = $(".imgPath").text();
        var start  = imgPath.lastIndexOf(".");
        var postfix = imgPath.substring(start,imgPath.length).toUpperCase();
        if(imgPath!=""){
            if(postfix!=".PNG"&&postfix!=".JPG"&&postfix!=".GIF"&&postfix!=".JPEG"){
                    alert("图片格式需为png,gif,jpeg,jpg格式");
            }else{
                $(".item_msg").append("<div class='col-sm-12 col-xs-12 message' > <img src='/images/img/icon.png' class='col-sm-2 col-xs-2' style='border-radius: 50%'><div class='col-sm-10 col-xs-10'><span style='font-weight: bold;''>Jack.C</span> <br><small class='date' style='color:#999'>刚刚</small><div class='msg_content'>"+content+"<img class='mypic' onerror='this.src='/images/img/bg_1.jpg' src='file:///"+imgPath+"' ></div></div></div>");
            }
        }else{
                $(".item_msg").append("<div class='col-sm-12 col-xs-12 message' > <img src='/images/img/icon.png' class='col-sm-2 col-xs-2' style='border-radius: 50%'><div class='col-sm-10 col-xs-10'><span style='font-weight: bold;''>Jack.C</span> <br><small class='date' style='color:#999'>刚刚</small><div class='msg_content'>"+content+"</div></div></div>");
        }
    });
    //添加表情包1
    for (var i = 1; i < 60; i++) {
        $(".emoji_1").append("<img src='/images/img/f"+i+".png' style='width:35px;height:35px' >");
    }
    //添加表情包2
    for (var i = 1; i < 61; i++) {
        $(".emoji_2").append("<img src='/images/img/h"+i+".png' style='width:35px;height:35px' >");
    }
    $(".emoji").click(function(){
        $(".myEmoji").show();
        //点击空白处隐藏弹出层
        $(document).click(function (e) {
            if (!$("#edit_form").is(e.target) && $("#edit_form").has(e.target).length === 0) {
                $(".myEmoji").hide();
            }
        });
    });
    //将表情添加到输入框
    $(".myEmoji img").each(function(){
        $(this).click(function(){
            var url = $(this)[0].src;
            $('#content').append("<img src='"+url+"' style='width:25px;height:25px' >");
            $("#send").removeClass("disabled");
        })
    })
    //放大或缩小预览图片
    $(".mypic").click(function(){
        var oWidth=$(this).width(); //取得图片的实际宽度  
        var oHeight=$(this).height(); //取得图片的实际高度  
        if($(this).height()!=200){
            $(this).height(200); 
        }else{
            $(this).height(oHeight + 200/oWidth*oHeight); 
        }
    })
})