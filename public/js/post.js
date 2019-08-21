$(function () {
    var fd = new FormData()
    fd.append('image', null)
    fd.append('text', '')
    var tmpl = '<li id="image" class="weui-uploader__file" style="background-image:url(#url#)"></li>',
        $gallery = $("#gallery"), $galleryImg = $("#galleryImg"),
        $uploaderInput = $("#uploaderInput"),
        $uploaderFiles = $("#uploaderFiles"),
        $images_num = $('#images_num');

    $uploaderInput.on("change", function (e) {
        var src, url = window.URL || window.webkitURL || window.mozURL, files = e.target.files;
        for (var i = 0, len = files.length; i < len; ++i) {
            var file = files[i];
            if (file.size > 3 * 1024 * 1024) {
                $.alert('上传的图片大小不能超过3M');
                return;
            }
            console.log(url)
            if (url) {
                src = url.createObjectURL(file);
                fd.set('image', file)
                console.log(fd)
            } else {
                src = e.target.result;
            }

            $uploaderFiles.append($(tmpl.replace('#url#', src)));
            $('.weui-uploader__input-box')[0].style.display = "none"
            $images_num[0].innerText = parseInt($images_num[0].innerText)+1
        }
    });

    $uploaderFiles.on("click", "li", function () {
        $galleryImg.attr("style", this.getAttribute("style"));
        $gallery.fadeIn(100);
    });

    $gallery.on("click", function () {
        $gallery.fadeOut(100);
    });

    $('.weui-gallery__del').click(function () {
        $.confirm('确定删除该图片？', function () {
            $('#image').remove()
            $('.weui-uploader__input-box')[0].style.display = ""
            $images_num[0].innerText = parseInt($images_num[0].innerText)-1
            $uploaderInput[0].value = ''
            fd.set('image', null)
        }, function () {
            return
        })
    })

    $('.post').click(function () {
        var text = $('#text').val();
        var uploadFile = $('.weui-uploader__file');

        if (text === null || text === "") {
            $.alert('请输入内容');
        } else {
            fd.set('text', text)
            $.showLoading('上传中...');
            console.log(fd)
            $.ajax({
                url: '/post',
                type: 'post',
                data: fd,
                processData: false,
                contentType: false,
                success: function (data) {
                    var err_code = data.err_code;
                    if (err_code === 0) {
                        $.hideLoading()
                        window.location.href = '/community'
                    } else if (err_code === -1) {
                        $.hideLoading()
                    }
                },
            });
        }
    });
});