// This was set up using the help of this tut:
//http://merrickchristensen.com/articles/gruntjs-workflow.html


module.exports = function(grunt) {
    // grunt.loadNpmTasks('grunt-contrib-jshint'); // load lint

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        autoprefixer: {
            css: {
                options: {
                    browsers: ['last 2 versions', 'ie 8', 'ie 9'],
                    cascade: true,
                    safe: false,//safe, while well-intentioned, is…just not a good idea
                },
                src: 'assets/out/css/main.css',
                dest: 'assets/out/css/main.css',
            },
        },

        //set up concats
        concat: {
            options: {
                // Get the filepath for all js files and format it to be a
                //   separator for easier debugging in concatted files
                process: function(src, filepath){
                    var lines = '\n//--------------------------------------------------\n'
                    var final_name = filepath.substring(filepath.lastIndexOf('/scripts/') + 1, filepath.length);//.join('-');
                    return( lines
                            + '// Source: '
                            + final_name
                            + lines
                            + src);
                }
            },

            js: {
                src: [
                    'assets/in/js/vend/jquery.js',
                    'assets/in/js/vend/*.js',
                    'assets/in/js/legacy/*.js',
                    'assets/in/js/app/*.js'
                ],
                dest: 'assets/out/js/app.js',
                nonull: true
            },

            omniture: {
                src: [
                    'assets/in/js/analytics/config.js',
                    'assets/in/js/analytics/s_code.js',
                    'assets/in/js/analytics/offsite-tracklinks.js',
                ],
                dest: 'assets/out/js/analytics.js',
                nonull: true,
            },
        },

        sass: {
            dev: {
                files:{
                    'assets/out/css/main.css' : 'assets/in/sass/index.scss'
                }
            },

            prod: {
                options:{
                    style: 'compressed'
                },
                files: {
                    'assets/out/css/main.css' : 'assets/in/sass/index.scss'
                }
            }
        },

        uglify: {
          options: {
            mangle: false,
          },
          js: {
            files: {
              //uglify in place
              'assets/out/js/app.js' : 'assets/out/js/app.js'
            }
          }
        },

        //watch for stuff when we save
        watch: {
            js: {
                files: ['assets/in/js/**/*.js'],
                tasks: ['concat:js']
            },
            omniture: {
                files: ['assets/in/js/**/*.js'],
                tasks: ['concat:omniture']
            },
            sass: {
                files: ['assets/in/sass/**/*.scss', 'assets/in/sass/*.scss'],
                tasks: ['sass:dev', 'autoprefixer:css']
            },
            svg: {
                files: ['assets/in/svg/*.svg'],
                tasks: ['svgstore'],
            },
        },

        svgstore: {
            options: {
                prefix : '_icon-',
                svg: {
                    display: 'none',
                    xmlns: 'http://www.w3.org/2000/svg',
                },
                includedemo: true,
            },
            default : {
                files: {
                    'assets/in/svg/svg-defs.svg': ['assets/in/svg/*.svg'],
                }
            }
        },

    });//initConfig

    //
    function loadNpmTasks(tasks) {
        if (typeof tasks === 'string') {
            tasks = tasks.split(' ');
        }

        for( var i = 0; i < tasks.length; i++ ) {
            grunt.loadNpmTasks(tasks[i]);
        }
    }

    loadNpmTasks([
        'grunt-autoprefixer',
        'grunt-contrib-concat',
        'grunt-contrib-sass',
        'grunt-contrib-uglify',
        'grunt-contrib-watch',
        'grunt-svgstore'
    ]);

//-----------------------------------------------------------------------------
//CUSTOM CLI COMMANDS
    // All tasks we have going in the initconfig should be registered here. Else
    //   the cli won't know what we're asking
    grunt.registerTask('default', 'Compiles sass, concats js, builds SVG sprite.', function(n) {
      var tasklist = ['concat', 'sass:dev', 'autoprefixer:css', 'svgstore'];

      if(grunt.option('omniture')) {
          tasklist.push('concat:omniture');

          if(grunt.option('watch')) {
              tasklist.push('watch:omniture');
          }
      }

      //watch should always be last
      if(grunt.option('watch')) {
        tasklist.push('watch')
      }

      grunt.task.run(tasklist);
    });

    grunt.registerTask('js', 'Concats javascript files,  pass --watch to concat as you go', function(n){
      var tasklist = ['concat:js'];

      if(grunt.option('omniture')) {
          tasklist.push('concat:omniture');

          if(grunt.option('watch')) {
              tasklist.push('watch:omniture');
          }
      }

      //watch should always be last
      if(grunt.option('watch')) {
        tasklist.push('watch:js');
      }

      grunt.task.run(tasklist);
    });


    grunt.registerTask('css', 'Compiles sass to css. Pass --watch to compile as you go. Pass --ie to build the IE-specific styles', function(n){
      var tasklist = ['sass:dev', 'autoprefixer:css'];

      if(grunt.option('ie')) {
        tasklist.push('sass:ie');
      }

      //Watch should always be last
      if(grunt.option('watch')) {
        tasklist.push('watch:sass');
      }

      grunt.task.run(tasklist);
    });

    grunt.registerTask('svg', 'Combines svg files into a new SVG sprite, pass --watch to combine as you go', function(n){
      var tasklist = ['svgstore'];

      //Watch should always be last
      if(grunt.option('watch')) {
        tasklist.push('watch:svg');
      }

      grunt.task.run(tasklist);
    });

    grunt.registerTask('prod', 'Compiles sass to compressed css, uglifies javascript, creates SVG sprite', function(n){
      var tasklist = ['concat:js', 'uglify:js', 'sass:prod', 'svgstore', 'autoprefixer:css'];
      grunt.task.run(tasklist);
    });
};
