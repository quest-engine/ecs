/**env: node */

var gulp    = require('gulp'),
    connect = require('gulp-connect'),
    concat  = require('gulp-concat'),
    jade    = require('gulp-jade'),
    bump    = require('gulp-bump');

var paths = {
  templates: [
    './src/demo/index.jade'
  ],
  scripts: [
    './src/inherit.js',
    './src/observer.js',
    './src/component.js',
    './src/entity.js',
    './src/ecs.js'
  ],
  version: [
    './package.json'
  ]
};

gulp.task('templates', function() {
  return gulp.src(paths.templates)
    .pipe(jade())
    .pipe(gulp.dest('./demo'));
});

gulp.task('scripts', function () {
  return gulp.src(paths.scripts)
    .pipe(concat('ecs.js'))
    .pipe(gulp.dest('./demo'));
});

gulp.task('watch', function () {
  gulp.watch(paths.templates, ['templates']);
  gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('connect', function() {
  connect.server({
    root: './demo',
    port: 9001,
    livereload: {
      port: 8001
    }
  });
});

gulp.task('bump', function () {
  return gulp.src(paths.version)
    .pipe(bump())
    .pipe(gulp.dest('./'));
});

gulp.task('bump:minor', function () {
  return gulp.src(paths.version)
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump:major', function () {
  return gulp.src(paths.version)
    .pipe(bump({type: 'major'}))
    .pipe(gulp.dest('./'));
});

gulp.task('default', ['templates', 'scripts', 'connect', 'watch']);