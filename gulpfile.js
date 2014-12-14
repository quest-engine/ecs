var gulp  = require('gulp'),
  jsdoc   = require('gulp-jsdoc'),
  connect = require('gulp-connect'),
  concat  = require('gulp-concat'),
  uglify  = require('gulp-uglify'),
  header  = require('gulp-header'),
  wrap    = require('gulp-wrap'),
  bump    = require('gulp-bump'),
  paths   = {};

paths.scripts = [
  './src/array.js',
  './src/observer.js',
  './src/entity.js',
  './src/system.js',
  './src/ecs.js'
];

paths.pkgs = [
  './package.json',
  './bower.json'
];

gulp.task('bump', function () {
  return gulp.src(paths.pkgs)
    .pipe(bump())
    .pipe(gulp.dest('./'));
});

gulp.task('bump:minor', function () {
  return gulp.src(paths.pkgs)
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump:major', function () {
  return gulp.src(paths.pkgs)
    .pipe(bump({type: 'major'}))
    .pipe(gulp.dest('./'));
});

gulp.task('build', function () {
  gulp.src(paths.scripts)
    .pipe(concat('ecs.js'))
    .pipe(gulp.dest('./tmp'));
});

gulp.task('wrap', ['build'], function () {
  gulp.src('./tmp/ecs.js')
    .pipe(wrap({
      src: './src/wrap.txt'
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build:min', function () {
  gulp.src(paths.scripts)
    .pipe(concat('ecs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('jsdoc', function () {
  gulp.src(paths.scripts)
    .pipe(jsdoc('./docs', {
        path: 'ink-docstrap'
      }))
    .pipe(connect.reload());
});

gulp.task('server:docs', function () {
  connect.server({
    root: './docs',
    port: 8082,
    livereload: true
  });
});

gulp.task('watch:docs', function () {
  gulp.watch(paths.scripts, ['jsdoc']);
});

gulp.task('docs', ['jsdoc']);

gulp.task('docs:watch', ['jsdoc', 'server:docs', 'watch:docs']);