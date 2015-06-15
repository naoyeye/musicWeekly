/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 16:46:34
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-07-05 16:35:00
*/

var fs = require('fs');
var express = require('express');
var router = express.Router();
var path = require('path');
var http = require('http');
var url = require('url');
var jsonfile = require('jsonfile');
var file = require('../controller/file');

// 后台首页
router.get('/', function (req, res) {
    res.render('admin');
});

module.exports = router;
