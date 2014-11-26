/**env: node */

var gulp    = require('gulp'),
    connect = require('gulp-connect'),
    concat  = require('gulp-concat'),
    jade    = require('gulp-jade');

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

gulp.task('default', ['templates', 'scripts', 'connect', 'watch']);