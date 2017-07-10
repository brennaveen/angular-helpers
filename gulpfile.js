/* eslint no-undef: 0 */  // --> OFF
/* eslint strict: 0 */  // --> OFF

var gulp = require('gulp'),
    concat = require('gulp-concat')
    del = require('del')
    runSeq = require('run-sequence');

var paths = {
    js: [
        'src/app.js',
        'src/directives/*.js',
        'src/filters/*.js'
    ]
};

gulp.task('build', function (callback) {
    runSeq(
        'clean',
        'js',
        callback
    );
});

gulp.task('clean', function () {
    return del([
        './dist'
    ]);
});

gulp.task('js', function () {
    return gulp.src(paths.js)
        .pipe(concat('angular-helpers.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['build']);