var gulp  = require('gulp'),
  jsdoc   = require('gulp-jsdoc'),
  connect = require('gulp-connect'),
  concat  = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  header = require('gulp-header'),
  paths   = {};

paths.scripts = [
  './src/array.js',
  './src/observer.js',
  './src/entity.js',
  './src/system.js',
  './src/ecs.js'
];

gulp.task('build', function () {
  gulp.src(paths.scripts)
    .pipe(concat('ecs.js'))
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