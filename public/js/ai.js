var questions = [];
var answers = {};

var step = 0;
var rel = '';
var key;
var pass = true;

var $talk = $("#talk");
var $select = $("#select");
var $input = $("#input");
var text_p = null;

var q_tmpl = `
<li>
    <div class="weui-row">
        <img src="#url#">
        <p></p>
    </div>
</li>
`;

var a_tmpl_sel = `
<div class="weui-flex__item select">
        <a class="weui-btn weui-btn_primary" href="javascript:">#ans#</a>
</div>
`;

var i = 0;
var count = 1;
var info = '';

// 记录回答结果并显示
function show_reply(reply) {
    var $text = $(q_tmpl.replace('#url#', user_ava))
    $text.find('img').attr('style', 'float:right')
    $text.find('p').attr('style', 'float:right')
    $text.find('p')[0].innerText = reply
    $talk.append($text)
    $select.empty()
}

// 做出回答
function get_reply() {
    $("div.select a").click(function () {
        var ans = this.innerText;
        if (ans == '查看') {
            console.log('查看')
            window.location.href = '/recommend?key=' + key
            return
        }
        console.log('pass')
        if (!pass) {
            step--
        }
        if (step == 0) {
            $input.css('display', 'none');
            rel = $('input#need').val();
            show_reply(rel);
            step++;
            getQuestions();
        } else if (step == 1) {
            show_reply(ans);
            step++;
            rel = ans;
            getQuestions();
        } else {
            final_qa_list[index].reply = ans
            show_reply(ans);
            index++
            show_qa_list()
        }
    })
}

// 逐字显示
function typing() {
    var screen = info.substr(0, count);
    text_p.innerHTML = screen;
    count++
    window.scrollTo(0, document.getElementsByTagName('body')[0].scrollHeight);
    if (count > info.length) {
        count = 1
        i++
        putQuestions()
        return
    }
    setTimeout(typing, 30);
}

// 显示问题
function putQuestions() {
    if (i < questions.length) {
        var $text = $(q_tmpl.replace('#url#', '/public/images/logo/AI.svg'));
        text_p = $text.find('p')[0];
        $talk.append($text);
        info = questions[i];
        typing();
    } else {
        i = 0;
        putAnswer();
        return;
    }
}

// 显示回答列表
function putAnswer() {
    if (answers.type == 'input') {
        $input.find("input")[0].placeholder = answers.content;
        answers.reply.forEach(el => {
            var $text = $(a_tmpl_sel.replace('#ans#', el))
            $select.append($text)
        });
        $input.css('display', 'block');
        get_reply();
    } else if (answers.type == 'wait') {
        return;
    } else if (answers.type == 'select') {
        answers.content.forEach(el => {
            var $text = $(a_tmpl_sel.replace('#ans#', el))
            $select.append($text)
        });
        get_reply();
    }
    window.scrollTo(0, document.getElementsByTagName('body')[0].scrollHeight);
}

var final_qa_list = null

// 根据 step 的值获取问题
function getQuestions() {
    replyReq = {
        reply: rel,
        step: step,
        pass: true
    }
    $.ajax({
        url: '/ai',
        type: 'post',
        dataType: 'json',
        data: replyReq,
        traditional: true,
        success: function (data) {
            console.log(data)
            if (data.pass == false){
                pass = false
            }else{
                pass = true
            }
            if (data.step == 0) {
                questions = data.questions
                answers = data.answers
                putQuestions()
            } else {
                step = data.step
                final_qa_list = data.final_qa_list
                console.log(final_qa_list)
                show_qa_list()
            }
        }
    })
}

var index = 0

function show_qa_list() {
    if (index < final_qa_list.length) {
        questions = final_qa_list[index].questions
        answers = final_qa_list[index].answers
        console.log(questions)
        console.log(answers)
        putQuestions()
    } else {
        console.log(final_qa_list)
        var reply_list = []

        final_qa_list.forEach(el => {
            reply_list.push({
                name: el.name,
                reply: el.reply
            })
        })
        $.ajax({
            url: '/ai',
            type: 'post',
            dataType: 'json',
            data: {
                reply_list: JSON.stringify(reply_list),
                location: JSON.stringify(loc)
            },
            traditional: true,
            success: function (data) {
                if (data.code == 0) {
                    key = data.key
                    questions = ['我明白了，正在为您推荐合适的店铺，请稍等...', '点击查看就可以看到我为您推荐的店铺啦']
                    answers = {
                        type: 'select',
                        content: ['查看']
                    }
                    putQuestions()
                }
            }
        })
        console.log('结束')
    }
}
