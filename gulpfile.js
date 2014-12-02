var gulp  = require('gulp'),
  jsdoc   = require('gulp-jsdoc'),
  connect = require('gulp-connect'),
  paths   = {};

paths.scripts = [
  './src/**/*.js'
];

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