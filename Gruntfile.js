/**
 * SWUMailDev - Gruntfile.js
 */

var sendEmails = require('./test/send.js')

module.exports = function (grunt) {
  grunt.initConfig({

    // Path config:
    path: {
      dist: 'dist',
      src: 'src'
    },

    autoprefixer: {
      options: {
        browsers: ['last 2 versions', 'ie 8', 'ie 9']
      },
      files: {
        '<%= path.dist %>/styles/style.css': '<%= path.src %>/styles/style.css'
      }
    },

    concat: {
      angular: {
        src: [
          'node_modules/angular/angular.js',
          'node_modules/angular-*/angular-*.js',
          '!node_modules/angular-*/angular-*.min.js',
          'node_modules/socket.io-client/socket.io.js'
        ],
        dest: '<%= path.dist %>/scripts/angular-pack.js'
      },
      app: {
        src: ['<%= path.src %>/scripts/ng/**/*.js'],
        dest: '<%= path.dist %>/scripts/app-pack.js'
      },
      vendor: {
        src: ['<%= path.src %>/scripts/vendor/*.js'],
        dest: '<%= path.dist %>/scripts/vendor-pack.js'
      }
    },

    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    copy: {
      vendor_scripts: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['node_modules/sweetalert/dist/sweetalert.min.js'],
            dest: '<%= path.src %>/scripts/vendor/',
            filter: 'isFile'
          }
        ]
      },
      fonts: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['node_modules/font-awesome/fonts/*', '<%= path.src %>/fonts/*'],
            dest: '<%= path.dist %>/fonts/',
            filter: 'isFile'
          }
        ]
      },
      images: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['<%= path.src %>/images/*', '!<%= path.src %>/images/favicon.ico'],
            dest: '<%= path.dist %>/images/',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: ['<%= path.src %>/images/favicon.ico'],
            dest: '<%= path.dist %>/',
            filter: 'isFile'
          }
        ]
      },
      views: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['<%= path.src %>/views/*.html'],
            dest: '<%= path.dist %>/',
            filter: 'isFile'
          }
        ]
      }
    },

    nodemon: {
      dev: {
        script: './bin/maildev',
        options: {
          args: [
            // '--outgoing-port=465',
            '--outgoing-host=smtp.gmail.com',
            '--outgoing-user=brandon@sendwithus.com',
            '--outgoing-pass=prrvbyfltzzaaaov',
            '--outgoing-secure'
          ],
          ignoredFiles: ['dist/**', 'src/**', 'test/**'],
          callback: function (nodemon) {
            nodemon.on('start', function () {
              setTimeout(sendEmails, 1000)
            })
          }
        }
      }
    },

    sass: {
      dist: {
        files: {
          '<%= path.dist %>/styles/style.css': '<%= path.src %>/styles/style.scss'
        },
        options: {
          outputStyle: 'compressed'
        }
      }
    },

    standard: {
      options: {},
      all: [
        'Gruntfile.js',
        'index.js',
        'lib/*.js',
        '<%= path.dist %>/scripts/{,*/}*.js'
      ]
    },

    watch: {
      sass: {
        files: ['<%= path.src %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['sass']
      },
      views: {
        files: ['<%= path.src %>/views/*'],
        tasks: ['copy:views']
      },
      images: {
        files: ['<%= path.src %>/images/*'],
        tasks: ['copy:images']
      },
      fonts: {
        files: ['<%= path.src %>/fonts/*'],
        tasks: ['copy:fonts']
      },
      scripts: {
        files: ['<%= path.src %>/scripts/**/*'],
        tasks: ['concat']
      }
    }

  })

  // Load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  grunt.registerTask('dev', 'Run the app and watch SCSS files for changes', [
    'concurrent'
  ])

  grunt.registerTask('build', 'Lint JavaScript', [
    'standard'
  ])

  grunt.registerTask('build', 'Compile SCSS + copy fonts', [
    'copy',
    'sass',
    'autoprefixer',
    'concat'
  ])

  grunt.registerTask('default', ['build'])
}
