<!-- /* jshint ignore:start */ -->
<html>
<head>
    <style>
        body, html {
            border:0;
            padding:0;
            margin: 0;
        }

        body {
            width: 100%;
            background: #fff;
            /*font-family: "Lantinghei SC", "Microsoft Yahei", "Hiragino Sans GB", "Helvetica Neue", Helvetica, Arial, sans-serif;*/
            font-family: "Lucida Grande", Arial, Helvetica, Verdana, sans-serif;
            line-height: 1.78;
            font-size: 11px;
            line-height: 16px;
            text-align: center;
            color: #1b1b1b;
            -webkit-overflow-scrolling: touch;
            -webkit-font-smoothing: antialiased;
            -webkit-tap-highlight-color: transparent;
            -webkit-text-size-adjust: none;
            -webkit-backface-visibility: hidden;
            // -webkit-transform-style: preserve-3d;
        }


        ul,
        li {
            padding: 0;
            margin: 0;
            list-style: none;
        }

        #chart {
            width: 480px;
            height: 500px;
            margin:0;
            padding:0;
            /*background: #c00;*/
            text-align: left;
        }

        #wrap li {
            font-size: 0;
            display: block;
            overflow: hidden;
        }

        #wrap li:nth-child(odd) {
            background-color: #eee;
        }

        #wrap span {
            display: inline-block;
            font-size: 12px;
            padding-top: 6px;
            /*line-height: 1;*/
            /*padding: 10px 0;*/
        }

        .order {
            height: 20px;
            /*padding: 0 10px;*/
            width: 40px;
            text-align: right;
            float: left;
            color: #666;
        }

        .name {
            /*margin: 0 100px 0 30px;*/
            width: 300px;
            margin-left: 15px;
            overflow: hidden;
            /*background: #c99;*/
        }

        i {
            display: inline-block;
        }

        #wrap span.playcount {
            float: right;
            width: 100px;
            
            color: #fff;
            
            height: 22px;
            line-height: 24px;
        }

        #wrap span.playcount i {
            border-radius: 0 4px 4px 0;
            background: #71b7e6;
            margin: -4px 0 0 0;
            padding: 0 10px 0 10px;
            font-style: normal;
        }

        .ttt {
            color: #666;
        }

        #wrap .ttt span.playcount {
            background: none;
            color: #666;
            margin: 0;
            padding-top: 6px;
            height: auto;
            line-height: 16px;
        }

    </style>

    <!-- Load c3.css -->
    <!--<link href="file://{{basePath}}/node_modules/c3/c3.css" rel="stylesheet" type="text/css">-->

    <!-- Load d3.js and c3.js -->
    <!--
    <script src="file://{{basePath}}/node_modules/d3/d3.min.js" charset="utf-8"></script>
    <script src="file://{{basePath}}/node_modules/c3/c3.min.js"></script>
    -->
    <!-- // <script src="file:///Users/hanjiyun/Project/musicWeekly/node_modules/d3/d3.min.js" charset="utf-8"></script> -->
    <script src="file://{{basePath}}/app/src/components/jquery/jquery.js"></script>

</head>
<body>
    <div id="chart">
        <ul id="wrap">
            <li class="ttt"><span class="order">排名</span><span class="name">音乐人</span><span class="playcount">播放次数</span></li>
        </ul>
    </div>

    <script>
/* jshint ignore:end */

/*global $, Modernizr, require, _, __dirname, module, classie, jQuery, globalData, NProgress, ga, AlbumColors */

    var wrap = $('#wrap');
    var chartConfig = JSON.parse(decodeURIComponent('{{chartConfiguration|raw}}'));



    $(chartConfig.data).each(function (i, item) {
    
        wrap.append('<li><span class="order">' + (i + 1) + '</span><span class="name">' + item.name + '</span><span class="playcount"><i>' + item.playcount + '</i></span></li>');
    });

    // chartConfig.bindto = '#chart';
    // chartConfig.onrendered = function () { window.callPhantom('takeShot'); };

    window.callPhantom('takeShot');

    // var chart = c3.generate(chartConfig);

/* jshint ignore:start */
    </script>


</body>
</html>
<!-- /* jshint ignore:end */ -->