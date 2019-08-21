$('.submit a').click(function () {
    var input = $('#text');
    var text = input.val();
    if (text === '' || text === null) {
        $.alert('请输入内容！');
        return;
    }
    var note_id = input.attr('name');
    console.log(text, note_id);
    var commentReq = {
        note_id: note_id,
        text: text
    }
    $.showLoading('提交中...');
    $.ajax({
        url: '/community/comment',
        type: 'post',
        data: commentReq,
        dataType: 'json',
        success: function (data) {
            var err_code = data.err_code
            if (err_code === 0) {
                history.go(0)
            }
        }
    })
})