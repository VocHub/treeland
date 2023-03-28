var gulp = require('gulp');
var load = require('gulp-load-plugins')();
var livereload = require('gulp-livereload');
var wiredep = require('wiredep').stream
var sass = require('gulp-sass');


gulp.task('sass', function() {
  return gulp.src('client/app/styles/sass/*.sass')
  .pipe(load.plumber())
  .pipe(sass().on('error', sass.logError))
  .pipe(load.autoprefixer(), 'last 15 version')
  .pipe(gulp.dest('client/app/styles'))
  .pipe(load.connect.reload());

});

gulp.task('pug', function() {
  return gulp.src('client/app/views/jade/*.jade')
  .pipe(load.plumber())
  .pipe(load.pug())
  .pipe(gulp.dest('client/app/views'))
  .pipe(load.connect.reload());

});



gulp.task('scripts', function() {
  return gulp.src('app/scripts/**/*.js', { base : 'app' })
  .pipe(load.plumber())
  .pipe(load.uglify({mangle: false}))
  .pipe(gulp.dest('build'))
  .pipe(load.connect.reload());

});

gulp.task('images', function() {
  return gulp.src('app/images/**/*', { base : 'app' })
  .pipe(load.plumber())
  .pipe(gulp.dest('build'));

});

gulp.task('copy', function() {
  return gulp.src(['app/*.html','app/*.ico','app/*.txt','*.php'], { base : 'app' })
  .pipe(load.plumber())
  .pipe(gulp.dest('build'))
  .pipe(load.connect.reload());

});

gulp.task('copy:fonts', function() {
  return gulp.src(['app/fa/css/*','app/fa/fonts/*'], { base : 'app' })
  .pipe(load.plumber())
  .pipe(gulp.dest('build/styles/fonts/'))
  .pipe(load.connect.reload());

});

gulp.task('connect', function() {
  load.connect.server({
    root: 'client/app',
    livereload: true,
    port: 8800,
    middleware: function(connect) {
        return [connect().use('/bower_components', connect.static('bower_components'))];
    }
  });
});

// inject bower components
gulp.task('bower', function () {
  return gulp.src('app/index.html')
    .pipe(wiredep({ directory: 'bower_components' , ignore:'..'}))
    .pipe(gulp.dest('app'));
});

gulp.task('bower:copy', function () {
  return gulp.src('bower_components/**/*')
  .pipe(load.plumber())
  .pipe(gulp.dest('build/bower_components'))
  .pipe(load.connect.reload());
});

gulp.task('watch', function() {

  gulp.watch('client/app/styles/sass/*.sass',['sass']);
  gulp.watch('client/app/views/jade/*.jade',['pug']);
  //gulp.watch('app/scripts/**/*.js',['scripts']);
  //gulp.watch('app/*.html',['copy']);

});


gulp.task('default', ['sass','pug','watch'])
