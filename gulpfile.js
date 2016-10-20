'use strict'

const gulp = require('gulp')
const mocha = require('gulp-mocha')
const istanbul = require('gulp-istanbul')

gulp.task('pre-coverage', function () {
    return gulp.src(['server/**/*.js', '!server/**/*.spec.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('coverage', ['pre-coverage'], () => {
    return gulp.src('server/**/*.spec.js')
        .pipe(mocha({}))
        .pipe(istanbul.writeReports())
})

gulp.task('test', () => {
    return gulp.src('server/**/*.spec.js')
        .pipe(mocha({}))
})

gulp.task('test:watch', ['test'], () => {
    gulp.watch('server/**/*.js', ['test'])
})