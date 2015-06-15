/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 16:46:34
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-07-05 16:35:21
*/

var express = require('express');
var router = express.Router();
var path = require('path');

// 前台首页
router.get('/', function (req, res) {
    res.render('index');
});


module.exports = router;
