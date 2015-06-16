/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 18:29:11
* @Last Modified by:   Jiyun
* @Last Modified time: 2015-06-15 19:43:07
*/


module.exports = function (grunt) {


    grunt.initConfig({

        // 启动 express
        supervisor: {
            target: {
                script: './bin/www',
                options: {
                    // exec: 'node',
                    // forceSync: true
                }
            }
        },

        // SCSS 文件编译
        compass : {
            server: {
                options: {
                    sassDir: 'app/src/stylesheets',
                    cssDir: 'app/public/css',
                    imagesPath: 'app/src/images',
                    imagesDir: 'app/public/img'
                }
            }
        },

        // autoprefixer: {
        //     options: {
        //         browsers: ['last 2 version', 'ie 8', 'ie 9', 'ie 10']
        //     },
        //     // prefix the specified file
        //     single_file: {
        //         src: 'app/public/css/award-admin.css',
        //         dest: 'app/public/css/autoprefixer/award.css'
        //     }
        // },

        // css 文件压缩
        cssmin: {
            options: {
                keepSpecialComments: 0 /* 移除 CSS 文件中的所有注释 */
            },
            css: {
                expand: true,
                cwd: 'app/public/css',
                src: ['*.css', '!*.min.css'],
                dest: 'app/public/css',
                ext: '.min.css'
            }
        },

        // js 文件压缩
        // for perview.jade
        uglify: {
            dev: {
                files: {
                    'app/public/js/award.min.js': [
                        'app/src/components/jquery/jquery.js',
                        'app/src/components/respond/src/respond.js',
                        'app/src/components/modernizr/modernizr.js',
                        'app/src/components/underscore/underscore.js',
                        'app/src/components/classie/classie.js',
                        'app/src/components/nprogress/nprogress.js',
                        'app/src/javascripts/app.js'
                    ]
                }
            },
            // prod: {
            //     files: {
            //         'app/public/js/new-award.min.js': [
            //             'app/src/components/jquery/jquery.js',
            //             'app/src/components/jquery-migrate/jquery-migrate.js',
            //             'app/src/components/respond/src/respond.js',
            //             'app/src/components/modernizr/modernizr.js',
            //             'app/src/components/underscore/underscore.js',
            //             'app/src/components/classie/classie.js',
            //             'app/src/components/nprogress/nprogress.js',
            //             'app/src/javascripts/new-award.js'
            //         ]
            //     }
            // },
        },

        //js 代码调试
        jshint: {
            // options: {
            //     eqeqeq: true,
            //     trailing: true
            // },
            test: ['app/src/javascripts/*.js']
        },

        // // css 文件合并
        // concat: {
        //     // options: {
        //     //     separator: ';'
        //     // },
        //     css: {
        //         src: ['app/public/css/jquery.min.js', 'js/custom.min.js'],
        //         dest: 'js/script.min.js'
        //     }
        // },

        clean : {
            // dist : ['<%= paths.app %>/css', '<%= paths.app %>/js'],
            server : {
                src : ['app/public/css', 'app/public/img', 'app/public/js']
            }
        },

        copy : {
            server : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : 'app/src/images',
                    dest : 'app/public/img',
                    src : [
                        '**/*.*'
                    ]
                }, {
                    expand : true,
                    dot : true,
                    cwd : 'app/src/fonts',
                    dest : 'app/public/fonts',
                    src : [
                        '**/*.*'
                    ]
                }]
            },
        },

        watch: {
            frontend: {
                options: {
                    livereload: true
                },
                files: [
                    'app/public/css/*.css',
                    'app/public/img/**/*',
                    'app/src/javascripts/*.js',
                    'app/views/*.jade',
                ],
                tasks: [
                    // 'clean:server',
                    // 'copy:server',
                    // 'cssmin:css' //,
                    // 'uglify:dev'

                ]
            },
            stylesSass: {
                files: [
                    'app/src/stylesheets/*.scss'
                ],
                tasks: [
                    'compass:server'
                ]
            },
            web: {
                files: [
                    'app/routes/*.js',
                    'app.js'
                ],
                tasks: [
                    // 'express:web'
                    'supervisor:target'
                ],
                options: {
                    nospawn: true, //Without this option specified express won't be reloaded
                    atBegin: true,
                }
            }
        },

        parallel: {
            web: {
                options: {
                    stream: true
                },
                tasks: [{
                    grunt: true,
                    args: ['watch:frontend']
                }, {
                    grunt: true,
                    args: ['watch:stylesSass']
                }, {
                    grunt: true,
                    args: ['watch:web']
                }]
            },
        },
    });

    // require('time-grunt')(grunt);

    // load all grunt tasks
    // require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-parallel');
    // grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-supervisor');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('web', 'launch webserver and watch tasks', [
        'clean:server',
        'copy:server',
        'compass:server',
        'parallel:web'
    ]);

    grunt.registerTask('default', ['web']);

    grunt.registerTask('jstest', ['jshint:test']);

    grunt.registerTask('build', ['cssmin:css', 'uglify:dev', 'uglify:prod']);

};
