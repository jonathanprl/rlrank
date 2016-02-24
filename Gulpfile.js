var gulp = require('gulp'),
    inject = require('gulp-inject'),
    jade = require('gulp-jade'),
    templateCache = require('gulp-angular-templatecache'),
    concat = require('gulp-concat'),
    bowerFiles = require('main-bower-files'),
    nodemon = require('gulp-nodemon'),
    less = require('gulp-less'),
    minifyCss = require('gulp-minify-css');

gulp.task('inject', function() {
  var sources = gulp.src(['./public/**/*.js', '!./public/vendor/**/*.js', '!./public/app/rlrank-templates.js'], {read: false});

  gulp.src(['./public/app/index.jade'])
    .pipe(inject(sources, {name: 'app', ignorePath: '/public'}))
    .pipe(inject(gulp.src(bowerFiles(), {read: false, cwd: __dirname + '/public'}), {name: 'bower'}))
    .pipe(inject(gulp.src(['./public/css/*.css'], {read: false}), {ignorePath: '/public'}))
    .pipe(gulp.dest('./public/app'));
});

gulp.task('less', function() {
  gulp.src(['./public/app/themes/default/base.less'])
    .pipe(inject(gulp.src(['./public/app/**/*.less', '!./public/app/themes/**/*.less'], {read: false}), { relative: true }))
    .pipe(less())
    .pipe(minifyCss())
    .pipe(gulp.dest('./public/css'));
});

gulp.task('templates', ['inject'], function () {
    //  compile jade, generate angular template cache
    gulp.src(['./public/app/**/*.jade'])
        .pipe(jade())
        .pipe(templateCache('rlrank-templates.js', {
          module: 'rlrank-templates',
          standalone: true,
          transformUrl: function(url) {
            url = '/views/' + url;
            return url.replace('.html', '');
          }
        }))
        .pipe(gulp.dest('./public/app'));
});

gulp.task('watch', function () {
    gulp.watch([
      './public/app/**/*.jade',
      './public/app/**/*.js',
      '!./public/app/rlrank-templates.js',
      '!./public/app/index.jade',
    ], ['build']);

    gulp.watch([
      './public/app/**/*.less'
    ], ['less']);
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

gulp.task('default', ['build']);
gulp.task('build', ['templates', 'less']);
gulp.task('serve', ['daemon', 'templates', 'less', 'watch']);
