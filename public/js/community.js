$('.like').click(function () {
    if ($(this).hasClass('wating')) {
        return;
    }
    $(this).addClass('wating')
    var likeReq = {
        note_id: $(this).attr('id'),
        type: null
    }
    var icon = $(this).find('img');
    var number = $(this).find('.number');
    if (icon.attr('src') === '/public/icon/like.png') {
        icon.attr('src', '/public/icon/like-on.png');
        number.text(parseInt(number.text()) + 1)
        likeReq.type = 1;
    } else {
        icon.attr('src', '/public/icon/like.png');
        number.text(parseInt(number.text()) - 1)
        likeReq.type = -1;
    }
    var a = $(this)
    $.ajax({
        url: '/community',
        type: 'post',
        data: likeReq,
        dataType: 'json',
        success: function (data) {
            var err_code = data.err_code;
            console.log(data)
            if (err_code === 0) {
                a.removeClass('wating')
            }
        }
    })
});