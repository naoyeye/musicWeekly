/*global $, Modernizr, require, _, __dirname, module, classie, jQuery, globalData, NProgress, ga, AlbumColors */

/*
* @Author: hanjiyun
* @Date:   2014-07-05 16:45:59
* @Last Modified by:   Jiyun
* @Last Modified time: 2015-06-15 21:17:26
*/

NProgress.start();

$(function () {
    console.log('successful!');
    // NProgress.done();

    $('.button a').click(function () {
        var username = $('input').val();

        if (!username) {
            return;
        }

        $('#content').html('<span class="loading">加载中</span>');

        $.ajax({
            url: '/mychart',
            type: 'POST',
            data: {'data': username},
            success: function (resp) {
                console.log('resp', resp);
                $('#content .loading').remove();
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
