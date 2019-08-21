$(document).ready(function () {
    var height = window.screen.height;
    $("body").css("background-size", '100% ' + height + 'px');
});

$(window).resize(function () {
    var height = window.screen.height;
    $("body").css("background-size", '100% ' + height + 'px');
    //$(".main-color").css("height", height + 'px')
});

$('#toHome').click(function () {
    window.location.href = '/'
});

$('#loginBtn').click(function () {
    var loginLoading = $("#loginLoading");

    if (loginLoading.hasClass('weui-loading')) {
        return
    }

    var tel = $('#tel');
    var password = $('#password');

    if (tel.val() === '' || tel.val() === null) {
        $.alert('请输入正确的手机号！', '注意');
        return;
    }

    if (password.val() === '' || password.val() === null) {
        $.alert('请输入密码！', '注意');
        return;
    }

    var loginReq = {
        tel: tel.val(),
        password: password.val()
    };

    console.log(loginReq);

    loginLoading.addClass('weui-loading');

    $.ajax({
        url: '/login',
        type: 'post',
        data: loginReq,
        dataType: 'json',
        success: function (data) {
            var err_code = data.err_code;
            if (err_code === 0) {
                window.location.href = '/'
            } else if (err_code === 1) {
                $.alert('手机号或者密码错误');
            } else if (err_code === 500) {
                $.alert('服务器忙，请稍后重试！');
            }
            loginLoading.removeClass('weui-loading')
        }
    })
});
