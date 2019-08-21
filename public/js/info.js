$(function () {
    var fd = new FormData();
    fd.append('avatar', null)
    fd.append('nickname', '')
    fd.append('gender', '')
    var avatar_change = false
    var previous_nickname = $('#nickname')[0].value
    var previous_gender = $('#gender')[0].selectedOptions[0].value

    var $uploaderInput = $("#uploaderInput");
    var $avatar = $("#avatar");
    $uploaderInput.on("change", function (e) {
        var src, url = window.URL || window.webkitURL || window.mozURL, files = e.target.files;
        for (var i = 0, len = files.length; i < len; ++i) {
            var file = files[i];
            console.log(file)
            if (file.size > 1 * 1024 * 1024) {
                $.alert('上传的头像大小不能超过1M');
                return;
            }
            console.log(file)
            if (url) {
                src = url.createObjectURL(file);
                fd.set('avatar', file)
            } else {
                src = e.target.result;
            }
            $avatar[0].src = src
            avatar_change = true
        }
    });

    $('#submit').click(function () {
        console.log('pass')
        var current_nickname = $('#nickname')[0].value
        var current_gender = $('#gender')[0].selectedOptions[0].value
        var nickname = previous_nickname === current_nickname ? false : current_nickname
        var gender = previous_gender === current_gender ? false : current_gender
        console.log(nickname)
        console.log(gender)
        console.log(avatar_change)
        if ((nickname || gender || avatar_change) === false) {
            $.alert('未修改信息，无法提交')
            return;
        } else {
            fd.set('nickname', nickname)
            fd.set('gender', gender)
        }
        $.showLoading('上传中...');
        $.ajax({
            url: '/user/info',
            type: 'post',
            data: fd,
            processData: false,
            contentType: false,
            success: function (data) {
                var err_code = data.err_code;
                if (err_code === 0) {
                    $.hideLoading()
                    window.location.href = '/me'
                } else if (err_code === -1) {
                    $.hideLoading()
                }
            }
        })
    })
})