/*global $, Modernizr, require, __dirname, module, process, unescape, Buffer*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 16:46:34
* @Last Modified by:   Jiyun
* @Last Modified time: 2015-06-22 18:29:20
*/

var express = require('express');
var router = express.Router();

var fs = require('fs');

// var url = require('url');
var http = require('http');
var https = require('https');
// var path = require('path');
var xmlreader = require('xmlreader');
// var querystring = require('querystring');

// var requestify = require('requestify');
var request = require('request');


// var imageChartConfig = require('../config/image-chart-config');
var imageChartConfig = require('config');
var uuid = require('node-uuid');
var crypto = require('crypto');

// 图片快照
var webshot = require('webshot');

// 用于图片快照的 html 模板
var swig  = require('swig');
var chartTemplate = swig.compileFile('./app/config/generatechart.swig');

// 用于缓存图片的 redis
var r = require('redis');
var redis = r.createClient(imageChartConfig.redis.port, imageChartConfig.redis.host, { detect_buffers: true });
var redisWriteStream = require('redis-wstream');
var redisReadStream = require('redis-rstream');

require('redis-streams')(r);

// 定时任务
var schedule = require('node-schedule');


// 前台首页
router.get('/', function (req, res) {
    // console.log('req.session', req.session);
    if (typeof req.session.auth !== 'undefined') {
        // var data = {text: '测试豆瓣小笨钟：整点自动报时广播 (ಠ_ಠ)'};

        // var rule = new schedule.RecurrenceRule();
        // rule.minute = [0];

        // var autoTask = schedule.scheduleJob(rule, function(){
        //     console.log('doubanToken = ', req.session.auth.douban.accessToken);
        //     // console.log('session.auth = ', session);

        //     postToDouban(req.session.auth.douban.accessToken, data, function (err, httpResponse, body) {
        //         console.log('豆瓣广播发布成功！偶也');
        //         res.json({error:err, message: null, data: JSON.parse(body)});
        //     });
        // });

        // postToDouban(req.session.auth.douban.accessToken, redisKey, data, function (err, httpResponse, body) {
        //     console.log('测试啦', err, body);
        //     // res.json({error:err, message: null, data: JSON.parse(body)});
        // });
    }
    
    res.render('index', {sess: req.session});
});


// 获取 last.fm 最近七天的榜单
router.post('/getlastfmchart', function (req, res) {
    var username = req.body.data;
    var xml = 'http://ws.audioscrobbler.com/2.0/user/' + username + '/weeklyartistchart.xml';
    // var xml = 'http://ws.audioscrobbler.com/2.0/user/' + username + '/recenttracks.xml';

    request.get(xml, {timeout: 3000}, function (err, httpResponse, body) {

        // console.log('body', body);

        try {
            // 解析 xml 为 json
            xmlreader.read(body, function(errors, responsive){
                var artists = responsive.weeklyartistchart.artist.array.reverse();
                var artistArray = [];

                // 只获取名字 播放数 链接
                for (var i = artists.length - 1; i >= 0; i--) {
                    var artistObj = {};
                    artistObj.name = artists[i].name.text();
                    artistObj.playcount = artists[i].playcount.text();
                    // artistObj.url = artists[i].url.text();
                    // artistObj.name = artists[i].name.text();
                    artistArray.push(artistObj);
                }

                // 前十条
                artistArray = artistArray.slice(0, 10);

                // console.log(artistArray);

                // 以 json 形式传回给前端
                res.json({error: err, message: 'null', data: artistArray});

                // console.log('responsive', responsive /*JSON.parse(responsive)*/);

                // var tracks = responsive.recenttracks.track.array.reverse();
                // var trackArray = [];

                // // 只获取名字 播放数 链接
                // for (var i = tracks.length - 1; i >= 0; i--) {
                //     var trackObj = {};
                //     // console.log(JSON.stringify(tracks[i]));

                //     trackObj.name = tracks[i].name.text();
                //     trackObj.artist = tracks[i].artist.text();
                //     trackObj.date = tracks[i].date.text();
                //     // artistObj.playcount = artists[i].playcount.text();
                //     trackObj.url = tracks[i].url.text();
                //     // artistObj.name = artists[i].name.text();
                //     trackArray.push(trackObj);
                // }

                // // 前十条
                // trackArray = trackArray.slice(0, 10);

                // // 以 json 形式传回给前端
                // res.json({error: err, message: 'null', data: trackArray});

            });
        } catch (error) {
            // console.log('errorerrorerror@@@', error);
            res.json({error: 1, message: '未找到对应的榜单数据', data: null});
            return;
        }
    });
});

// 发送豆瓣广播
router.post('/doubanshuo', function (req, res) {
    // var data = {text: '测试整点自动报时广播'};
    var text = req.body.text;

    // console.log(req.body.key);

    var key = { config: decodeURIComponent(req.body.key) };
    // console.log(key);

    var redisKey = 'chart:' + crypto.createHash('md5').update(JSON.stringify(key)).digest('hex');

    
    // console.log(redisKey);
    // res.json({err: 0});
    // return;

    if (typeof req.session.auth !== 'undefined') {
        postToDouban(req.session.auth.douban.accessToken, redisKey, text, function (err, httpResponse, body) {
            // console.log('body ======', body);
            res.json({error:err, message: null, data: JSON.parse(body)});
        });
    } else {
        console.log('需要重新授权');
    }


});

router.get('/chart', function (req, res) {

    // console.log('req.query == ', req.query, '=====', typeof req.query);

    var chartKey = 'chart:' + crypto.createHash('md5').update(JSON.stringify(req.query)).digest('hex');

    // console.log('chartKey===', chartKey);

    if(imageChartConfig.get('cache.enabled')) {

        if(redis.keys(chartKey, function (err, data) {
            if(data.length === 1) {
                // console.log('cache hit: ' + chartKey);
                redis.expire(chartKey, imageChartConfig.get('cache.expires'));
                res.writeHead(200, {'Content-Type': 'image/' + imageChartConfig.get('image.format') });
                redisReadStream(redis, chartKey).pipe(res);
            } else {
                var width = req.query.width ? req.query.width : '480',
                    height = req.query.height ? req.query.height : '310';

                var path = __dirname.replace('/app/routes', '');

                var chartHtml = chartTemplate({
                    basePath: path,
                    chartConfiguration: unescape(req.query.config) || '{}',
                    chartWidth: width,
                    chartHeight: height,
                    backgroundColor: req.query.bg || 'fff'
                });

                var options = {
                    takeShotOnCallback: true,
                    siteType: 'html',
                    windowSize: {
                        width: width,
                        height: height,
                    },
                    streamType: imageChartConfig.get('image.format'),
                    quality: imageChartConfig.get('image.quality') || 100,
                    renderDelay: 500
                };

                webshot(chartHtml, options, function(err, renderStream) {
                    if(err) {
                        console.error(err);
                        res.status(500).json({error: err});
                        return;
                    }
                    res.writeHead(200, {'Content-Type': 'image/' + imageChartConfig.get('image.format') });

                    if(imageChartConfig.get('cache.enabled')) {
                        var writeStream = redisWriteStream(redis, chartKey);

                        // console.log('add to cache: ' + chartKey);
                        renderStream.pipe(writeStream);

                        renderStream.on('end', function () {
                            // console.log('set cache expiration: ' + chartKey + ', ' + imageChartConfig.get('cache.expires') + 's');

                            // note here that we set the expiration on the temp key that redis-wstream uses because it hasn't been renamed yet
                            redis.expire(writeStream._redisTempKey, imageChartConfig.get('cache.expires'));
                        });
                    }

                    renderStream.pipe(res);
                });
            }

        })) {
            // console.log(1);
        } else {
            // console.log(2);
        }
    }
});



// 发送豆瓣广播
function postToDouban (accessToken, redisKey, text, callback) {

    var fileReadStream = redisReadStream(redis, redisKey);
    var fileWriteStream = fs.createWriteStream('/Users/hanjiyun/desktop/test2.jpg');
    fileReadStream.pipe(fileWriteStream);

    fileWriteStream.on('close',function () {
        // console.log('copy over');

        var r = request.post('https://api.douban.com/shuo/v2/statuses/', {
                method: 'POST',
                headers: {'Authorization': 'Bearer ' + accessToken},
                timeout: 3000
            }, function (err, httpResponse, body) {
                // console.log('body', body);
                if (callback && typeof callback === 'function') {
                    callback(err, httpResponse, body);
                }
            });

        var form = r.form();
        form.append('text', text);
        form.append('image', fs.createReadStream('/Users/hanjiyun/desktop/test2.jpg'));
    });



    // console.log('====================================');
    // console.log('========= redisReadStream =============', redis.readStream('chart:341edab70e20fd1df15c93eeabcf42d5'));
    // console.log('====================================');
    // console.log('========== fs.createReadStream =========', fs.createReadStream('/Users/hanjiyun/desktop/3D_Movie_Logo_3.jpg'));
    // console.log('====================================');

    // console.log('===================1111=================');
    // console.log(request.get('http://localhost:8678/chart?config=%7B%22data%22%3A%5B%7B%22name%22%3A%22F.D.%20Project%22%2C%22playcount%22%3A%22384%22%7D%2C%7B%22name%22%3A%22Lyn%20Collins%22%2C%22playcount%22%3A%2258%22%7D%2C%7B%22name%22%3A%22Dr.%20Dre%22%2C%22playcount%22%3A%2226%22%7D%2C%7B%22name%22%3A%22John%20Lennon%22%2C%22playcount%22%3A%2214%22%7D%2C%7B%22name%22%3A%22Side%20Liner%22%2C%22playcount%22%3A%2210%22%7D%2C%7B%22name%22%3A%22%E6%9C%A8%E9%A9%AC%22%2C%22playcount%22%3A%228%22%7D%2C%7B%22name%22%3A%22Pink%20Floyd%22%2C%22playcount%22%3A%227%22%7D%2C%7B%22name%22%3A%22Black%20N%20Blue%22%2C%22playcount%22%3A%227%22%7D%2C%7B%22name%22%3A%22Dr.%20Dre%20%26%20Snoop%20Dogg%20%26%20Kurupt%20%26%20Nate%20Dogg%22%2C%22playcount%22%3A%227%22%7D%2C%7B%22name%22%3A%22Australis%22%2C%22playcount%22%3A%226%22%7D%5D%7D'));
    // console.log('===================222=================');
    // console.log(request.get('http://img3.douban.com/view/status/median/public/5cfe4d9b75fc6fe.jpg'));



    // form.append('image', request.get('http://img3.douban.com/view/status/median/public/5cfe4d9b75fc6fe.jpg'));

    // form.append('my_buffer', new Buffer([1, 2, 3]));
    // form.append('image', fs.createReadStream('/Users/hanjiyun/desktop/3D_Movie_Logo_3.jpg'), {filename: '3D_Movie_Logo_3.jpg'});

    // var str = '{"_readableState":{"highWaterMark":65536,"buffer":[],"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"objectMode":false,"defaultEncoding":"utf8","ranOut":false,"awaitDrain":0,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"domain":null,"_events":{},"path":"/Users/hanjiyun/desktop/3D_Movie_Logo_3.jpg","fd":null,"flags":"r","mode":438,"autoClose":true}';

    // form.append('image', JSON.parse(str), {filename: '3D_Movie_Logo_3.jpg'});
    // form.append('image', fs.createReadStream('/Users/hanjiyun/desktop/3D_Movie_Logo_3.jpg'));
    // form.append('image', redisReadStream(redis, 'chart:341edab70e20fd1df15c93eeabcf42d5'));




    // var FormData = require('form-data');
    // var form = new FormData();
    // var url = 'http://localhost:8678/chart?config=%7B%22data%22%3A%5B%7B%22name%22%3A%22F.D.%20Project%22%2C%22playcount%22%3A%22384%22%7D%2C%7B%22name%22%3A%22Lyn%20Collins%22%2C%22playcount%22%3A%2258%22%7D%2C%7B%22name%22%3A%22Dr.%20Dre%22%2C%22playcount%22%3A%2226%22%7D%2C%7B%22name%22%3A%22John%20Lennon%22%2C%22playcount%22%3A%2214%22%7D%2C%7B%22name%22%3A%22Side%20Liner%22%2C%22playcount%22%3A%2210%22%7D%2C%7B%22name%22%3A%22%E6%9C%A8%E9%A9%AC%22%2C%22playcount%22%3A%228%22%7D%2C%7B%22name%22%3A%22Pink%20Floyd%22%2C%22playcount%22%3A%227%22%7D%2C%7B%22name%22%3A%22Black%20N%20Blue%22%2C%22playcount%22%3A%227%22%7D%2C%7B%22name%22%3A%22Dr.%20Dre%20%26%20Snoop%20Dogg%20%26%20Kurupt%20%26%20Nate%20Dogg%22%2C%22playcount%22%3A%227%22%7D%2C%7B%22name%22%3A%22Australis%22%2C%22playcount%22%3A%226%22%7D%5D%7D';
    // // form.append('text', '测试豆瓣广播 API: 自动发送图片和文字');

    // http.request(url, function(response) {
    //     form.headers({'Authorization': 'Bearer ' + accessToken});
    //     form.append('text', '测试豆瓣广播 API: 自动发送图片和文字');
    //     // form.append('my_buffer', new Buffer(10));
    //     form.append('image', response);
    // });

    // var request = https.request({
    //     method: 'post',
    //     host: 'api.douban.com',
    //     path: '/shuo/v2/statuses/',
    //     port: 443,
    //     headers: form.getHeaders()
    // });

    // form.pipe(request);

    // request.on('response', function(res) {
    //     console.log(res);
    // });




    // // var url = 'http://img3.douban.com/view/status/median/public/5cfe4d9b75fc6fe.jpg';
    // request.get(url, function(err, httpResponse, body) {
    //     // form.append('my_field', 'my value');
    //     // form.append('my_buffer', new Buffer(10));
    //     // form.append('my_logo', response);
    //     // console.log(err, httpResponse, body);
    //     setTimeout(function () {
    //         request.post('https://api.douban.com/shuo/v2/statuses/', {
    //                 method: 'POST',
    //                 headers: {'Authorization': 'Bearer ' + accessToken},
    //                 timeout: 3000
    //             }, function (e, h, b) {
    //                 if (callback && typeof callback === 'function') {
    //                     callback(e, h, b);
    //                 }
    //             });

    //         // var form = r.form();
    //         form.append('image', fs.createReadStream('/Users/hanjiyun/desktop/3D_Movie_Logo_3.jpg'));
    //         // form.append('image', fs.createReadStream(('http://img3.douban.com/view/status/median/public/5cfe4d9b75fc6fe.jpg')));
    //     }, 300);

    // });
}

// // 获取图片大小
// function getFilesizeInBytes (filename) {
//     var stats = fs.statSync(filename);
//     var fileSizeInBytes = stats.size;
//     return fileSizeInBytes;
// }



module.exports = router;
