'use strict'

const gulp = require('gulp')
const mocha = require('gulp-mocha')

gulp.task('test', () => {
    return gulp.src('server/**/*.spec.js')
        .pipe(mocha({}))
})

gulp.task('test:watch' ,() => {
    gulp.watch('server/**/*.js', ['test'])
})