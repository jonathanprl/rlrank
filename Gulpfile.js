var gulp = require('gulp'),
    inject = require('gulp-inject'),
    jade = require('gulp-jade'),
    templateCache = require('gulp-angular-templatecache'),
    concat = require('gulp-concat'),
    bowerFiles = require('main-bower-files'),
    nodemon = require('gulp-nodemon'),
    less = require('gulp-less'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify'),
    uglify = require('gulp-uglify'),
    series = require('stream-series');

gulp.task('inject-production', ['concat-app'], function() {
  var vendorStream = gulp.src(['./public/js/rlrank-vendor-min.js'], {read: false});
  var appStream = gulp.src(['./public/js/rlrank-min.js', './public/js/rlrank-templates-min.js'], {read: false});

  var stream = gulp.src(['./public/app/index/index.jade'])
    .pipe(inject(series(vendorStream, appStream), {name: 'app', ignorePath: '/public'}))
    .pipe(inject(gulp.src(['./public/css/*.css']), {ignorePath: '/public'}))
    .pipe(gulp.dest('./public/app'));
  return stream;
});

gulp.task('inject', ['templates'], function() {
  var vendorStream = gulp.src(bowerFiles(), {read: false, cwd: __dirname + '/public'});
  var appStream = gulp.src(['./public/app/**/*.js', '!./public/vendor/**/*.js', './public/js/rlrank-templates.js'], {read: false});

  var stream = gulp.src(['./public/app/index/index.jade'])
    .pipe(inject(series(vendorStream, appStream), {name: 'app', ignorePath: '/public'}))
    .pipe(inject(gulp.src(['./public/css/*.css'], {read: false}), {ignorePath: '/public'}))
    .pipe(gulp.dest('./public/app'));
  return stream;
});

gulp.task('concat-app', ['concat-vendor'], function() {
  var stream = gulp.src(['./public/app/**/*.js', '!./public/js/rlrank-templates-min.js'])
    .pipe(concat('rlrank.js'))
    .pipe(minify({
      ignoreFiles: ['-min.js']
    }))
    .pipe(gulp.dest('./public/js'));
  return stream;
});

gulp.task('concat-vendor', ['concat-templates'], function() {
  var stream = gulp.src(bowerFiles({"filter": "**/*.js"}))
    .pipe(concat('rlrank-vendor.js'))
    .pipe(minify({
      ignoreFiles: ['-min.js']
    }))
    .pipe(gulp.dest('./public/js'));
  return stream;
});

gulp.task('concat-templates', ['templates'], function() {
  var stream = gulp.src('./public/js/rlrank-templates.js')
    .pipe(minify({
      ignoreFiles: ['-min.js']
    }))
    .pipe(gulp.dest('./public/js'));
  return stream;
});

gulp.task('less', function() {
  var stream = gulp.src(['./public/app/themes/default/base.less'])
    .pipe(inject(gulp.src(['./public/app/**/*.less', '!./public/app/themes/**/*.less'], {read: false}), { relative: true }))
    .pipe(less({
      paths: ['./public/app/themes/default/']
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./public/css'));
  return stream;
});

gulp.task('templates', function () {
  //  compile jade, generate angular template cache
  var stream = gulp.src(['./public/app/**/*.jade'])
      .pipe(jade())
      .pipe(templateCache('rlrank-templates.js', {
        module: 'rlrank-templates',
        standalone: true,
        transformUrl: function(url) {
          url = '/views/' + url;
          return url.replace('.html', '');
        }
      }))
      .pipe(gulp.dest('./public/js'));
  return stream;
});

gulp.task('watch', function () {
  gulp.watch([
    './public/app/**/*.jade',
    './public/app/**/*.js',
    './public/app/**/*.less',
    '!./public/js/*.js',
    '!./public/app/index.jade',
    '!./public/app/rlrank-templates.js'
  ], ['build']);
});

gulp.task('daemon', function () {
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: ['public/*'],
    env: {
      'NODE_ENV': 'dev'
    }
  })
    .on('restart', function () {
      console.log('Restarted!');
    });
});

gulp.task('daemon-production', ['inject-production'], function () {
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: ['public/*'],
    env: {
      'NODE_ENV': 'dev'
    }
  })
    .on('restart', function () {
      console.log('Restarted!');
    });
});

gulp.task('default', ['build']);
gulp.task('build', ['inject', 'less']);
gulp.task('production', ['less', 'inject-production'])
gulp.task('serve', ['daemon', 'less', 'inject', 'watch']);
