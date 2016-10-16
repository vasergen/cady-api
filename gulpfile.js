'use strict'

const gulp = require('gulp')
const babel = require('babel-register')({
    presets: [ 'es2015' ]
});
const mocha = require('gulp-mocha')

gulp.task('test', () => {
    return gulp.src('server/**/*.spec.js')
        .pipe(mocha({
            compilers: {js: babel}
        }))
})

gulp.task('test:watch' ,() => {
    gulp.watch('server/**/*.js', ['test'])
})