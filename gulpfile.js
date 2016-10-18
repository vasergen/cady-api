'use strict'

const gulp = require('gulp')
const mocha = require('gulp-mocha')
const istanbul = require('gulp-istanbul')

gulp.task('pre-test', function () {
    return gulp.src(['server/**/*.js', '!server/**/*.spec.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], () => {
    return gulp.src('server/**/*.spec.js')
        .pipe(mocha({}))
        .pipe(istanbul.writeReports())
})

gulp.task('test:watch' ,() => {
    gulp.watch('server/**/*.js', ['test'])
})