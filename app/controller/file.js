/*global $, Modernizr, require, __dirname, module, exports*/


/*
* @Author: hanjiyun
* @Date:   2014-06-04 11:36:19
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-07-05 16:32:44
*/


var fs = require('fs');
var path = require('path');
var util = require('util');
var jade = require('jade');
var jsonfile = require('jsonfile');
var moment = require('moment');


var appDir = path.resolve(__dirname + '/' + '../');

// Number of spaces to indent JSON files.
jsonfile.spaces = 4;


