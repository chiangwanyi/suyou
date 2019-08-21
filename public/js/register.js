$(document).ready(function () {
    var height = window.screen.height;
    $("body").css("background-size", '100% ' + height + 'px');
    //$(".main-color").css("height", height + 'px')
});

$(window).resize(function () {
    var height = window.screen.height;
    $("body").css("background-size", '100% ' + height + 'px');
    $(".main-color").css("height", height + 'px')
});

$('#toHome').click(function () {
    window.location.href = '/'
});

$('#registerBtn').click(function () {
    var registerLoading = $("#registerLoading");

    if (registerLoading.hasClass('weui-loading')) {
        return
    }

    var tel = $("#tel");
    var nickname = $("#nickname");
    var password = $("#password");
    var re_password = $("#re_password");
    var code = $("#code");

    if (tel.val() === '' || tel.val() === null) {
        $.alert('请输入正确的手机号！', '注意');
        return;
    }

    if (nickname.val() === '' || nickname.val() === null) {
        $.alert('请输入昵称！', '注意');
        return;
    }

    if (password.val() === '' || password.val() === null) {
        $.alert('请输入密码！', '注意');
        return;
    }

    if (re_password.val() === '' || re_password.val() === null) {
        $.alert('请再次输入密码！', '注意');
        return;
    }

    if (password.val() != re_password.val()){
        $.alert('两次密码不一致！', '注意');
        return;
    }

    if (code.val() === '' || code.val() === null) {
        $.alert('请输入验证码！', '注意');
        return;
    }

    var registerReq = {
        tel: tel.val(),
        nickname: nickname.val(),
        password: password.val()
    };

    console.log(registerReq);

    registerLoading.addClass('weui-loading');

    $.ajax({
        url: '/register',
        type: 'post',
        data: registerReq,
        dataType: 'json',
        success: function (data) {
            var err_code = data.err_code;
            if (err_code === 0) {
                window.location.href = '/login'
            } else if (err_code === 1) {
                $.confirm('手机号已存在，是否登录？', function () {
                    window.location.href = '/login'
                });
            } else if (err_code === 500) {
                $.alert('服务器忙，请稍后重试！');
            }
            registerLoading.removeClass('weui-loading')
        }
    })
});