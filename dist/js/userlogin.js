function login() {
    var name = $('#name').val();
    var password=$('#password').val();

if(name==''||name==null){
    alert("用户名不能为空");
    return false;
}
if(password==null||password==''){
    alert("密码不能为空");
    return false;
}

    $.ajax({
        type: "GET",
        url: "http://localhost:8888/Login/login?name="+name+"&password="+password,
        contentType: "application/json",
        success: function (r) {
            if (r == "登录成功") {
                alert(r);
                window.location.href = "userCenter.html";
                $("#jqGrid").trigger("reloadGrid");
            } else {
                alert(r);
            }
        }})
    
}
window.onload=function() {
    console.log("aaaa");
    var name = $.session.get('key');
    console.log("name:" + name);

    if (name == "null") {
        console.log("bbb");
        window.location.href = "login.html";
    }
}
function register() {
    var name = $('#username').val();
    var password=$('#userpwd').val();
    var mail=$('#email').val();
    if(name==''||name==null){
        alert("用户名不能为空");
        return false;
    }
    if(password==null||password==''){
        alert("密码不能为空");
        return false;
    }
    if(mail==null||mail==''){
        alert("邮箱不能为空");
        return false;
    }
    alert(mail);
    $.ajax({
        type: "GET",
        url: "http://localhost:8888/Login/register?name="+name+"&mail"+mail+"&password="+password,
        contentType: "application/json",
        success: function (r) {
            if (r == 1) {
                alert("注册成功");
                window.
                $("#jqGrid").trigger("reloadGrid");
            } else {
                alert("注册失败");
            }
        }})

}