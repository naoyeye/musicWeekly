/*global $, Modernizr, require, __dirname, module, process*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 16:46:34
* @Last Modified by:   Jiyun
* @Last Modified time: 2015-06-16 11:24:06
*/

var express = require('express');
var router = express.Router();


var url = require('url');
var http = require('http');
var path = require('path');
var xmlreader = require('xmlreader');

// var DoubanClient = require('douban-client');

// var API_KEY = '08e9595bbd53778d1abc0c1337fa66a7';
// var API_SECRET = 'fb6ef218f1eaa591';
// var SCOPE = 'douban_basic_common,shuo_basic_r,shuo_basic_w';
// var client = new DoubanClient(API_KEY, API_SECRET, 'http://www.musicweekly.com/connect/douban/callback', SCOPE);

router.get('/connect/douban/callback', function (req, res) {
    console.log(111);
});

// 前台首页
router.get('/', function (req, res) {

    // process.stdout.write(client.authorize_url() + '\n');
    // res.redirect(client.authorize_url());
    // process.stdout.write('Enter the verification code:\n');


    // process.stdin.on('data', function(chunk) {
    //     var code = chunk;
        // var code = '7a612b79fd15865a';
        // client.auth_with_code(code, function(err, doubanToken){
        //     console.log('this is your ' + doubanToken);

        //     console.log('client.user.me()', client.user.me());

        //     // client.miniblog.new('text');

        //     // var event = client.user.get(id);
            
        //     // event.on('data', function(err, data){
        //     //     //发生异常时会将异常放入err, 并且 data == null
        //     //     if(!err){
        //     //         console.log(data);
        //     //     }
        //     // });

        // });
    // });





    // client.auth_with_token(token);

    // // # Token Code
    // token_code = client.token_code;

    // // # Refresh Token
    // // # 请注意：`refresh_token_code` 值仅可在授权完成时获取(即在 `auth_with_code`, `auth_with_password` 之后)
    // refresh_token_code = client.refresh_token_code;
    // client.refresh_token(refresh_token_code); // refresh token

    // res.render('index');
});

router.get('/welcome/', function (req, res) {
    res.render('index');
});

router.post('/mychart', function (req, res) {
    var username = req.body.data;
    var options = url.parse('http://ws.audioscrobbler.com/2.0/user/' + username + '/weeklyartistchart.xml');

     http.get(options, function(resp) {
        resp.setEncoding('utf8');
        var xml = '';
        resp.on('data', function(data) {
            xml += data;
        });

        resp.on('end', function() {
            try {
                xmlreader.read(xml, function(errors, responsive){
                    var artists = responsive.weeklyartistchart.artist.array.reverse();
                    var artistArray = [];

                    for (var i = artists.length - 1; i >= 0; i--) {
                        var artistObj = {};
                        console.log(artists[i]);
                        artistObj.name = artists[i].name.text();
                        artistObj.playcount = artists[i].playcount.text();
                        artistObj.url = artists[i].url.text();
                        // artistObj.name = artists[i].name.text();
                        artistArray.push(artistObj);
                    }

                    res.json({artistArray: artistArray});
                });
            } catch (error) {
                res.json({error: 1, message: '未找到对应的榜单数据'});
                return;
            }

        });
     });

});


module.exports = router;
