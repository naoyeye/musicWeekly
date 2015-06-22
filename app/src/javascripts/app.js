/*global $, Modernizr, require, _, __dirname, module, classie, jQuery, globalData, NProgress, ga, AlbumColors */

/*
* @Author: hanjiyun
* @Date:   2014-07-05 16:45:59
* @Last Modified by:   Jiyun
* @Last Modified time: 2015-06-22 18:13:13
*/

NProgress.start();

$(function () {
    console.log('successful!');

    var username;
    // NProgress.done();

    $('#lastfm').click(function () {
        // todo
        username = $('input').val() || 'yangyangyang';

        if (!username) {
            alert('哎呦我操');
            return;
        }

        $('#content').append('<span class="loading">加载中</span>');

        $.ajax({
            url: '/getlastfmchart',
            type: 'POST',
            data: {'data': username},
            success: function (resp) {
                console.log('resp', resp);
                var listWrap = $('#artist-list');

                if (resp.error) {
                    console.error(resp.message);
                    $('#content .loading').hide();
                    alert(resp.message);
                    return;
                }
                // var array = resp.data;

                // $(array).each(function (i, item) {
                //     console.log('item = ', item);
                //     listWrap.append('<li><span class="order">' + (i + 1) + '</span><span class="name">' + item.name + '</span> - <span class="playcount">' + item.playcount + '</span></li>');
                // });

                var config = encodeURIComponent(JSON.stringify(resp).replace(/[\\"']/g, '\\$&'));
                console.log('config', config);
                $('#content').prepend('<img id="chart-image" src="/chart?config=' + config + '" data-key="' + config + '">');
                $('#content .loading, h1, #wrap .action').remove();
                $('#content .button').css('display', 'inline-block');
            }
        });
    });


    $('#doubanshuo').click(function () {
        var key = $('#chart-image').attr('data-key');
        var nickname = $('#name').text();

        $.ajax({
            url: '/doubanshuo',
            type: 'POST',
            data: {text: '这是' + nickname + '最近七天的音乐数据, 查看 ta 的 last.fm 页面：http://www.last.fm/user/' + username, key: key},
            success: function (resp) {
                console.log('发送豆瓣广播回馈', resp);
            }
        });
    });

    // // var img = new Image();
    // var url = $('.test').attr('src');
    // var albumColors = new AlbumColors(url);

    // albumColors.getColors(function(colors) {
    //     console.log(colors);
    //     console.log(getRGBColor(colors[2]));
    //     // Result: [[254, 254, 254], [2, 138, 14], [4, 171, 21]]
    // });

    // function getHorizontalGradientCSS(color1, color2) {
    //     return '-webkit-linear-gradient(top, ' + color1 + ' 0%, ' + color2 + ' 15%)';
    // }

    // function getVerticalGradientCSS(color1, color2) {
    //     return '-webkit-linear-gradient(left, ' + color1 + ' 0%, ' + color2 + ' 15%)';
    // }

    // function getRGBColor(color) {
    //     return 'rgb(' + color + ')';
    // }

    // function getTransparentRGBColor(color) {
    //     return 'rgba(' + color + ',0)';
    // }


    // var grad = new Grad(img, 'test');
});
