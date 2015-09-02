var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    jshint = require('gulp-jshint'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify');

gulp.task('lint', function() {
    gulp.src('js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('lint-tests', function() {
    gulp.src('tests/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('test', function() {
    gulp.src('tests/**/*.js')
        .pipe(mocha())
        .on('error', function(err){
            console.log(err.message);    
        });
});

gulp.task('browserify', function() {
    var b = browserify({
        cache: {},
        packageCache: {},
        fullPaths: true,
        debug: true
    });

    b.add('./js/app.js');

    return bundleShare(b);
});

gulp.task('watchify', function() {
    var b = browserify({
        cache: {},
        packageCache: {},
        fullPaths: true,
        debug: true
    });

    b = watchify(b);
    b.on('update', function() {
        bundleShare(b);
    });

    b.add('./js/app.js');

    return bundleShare(b);
});

function bundleShare(b) {
    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./builds/'));
}

gulp.task('watch', ['watchify'], function() {
    gulp.watch('js/**/*.js', ['lint', 'test']);
    gulp.watch('tests/**/*.js', ['lint-tests', 'test']);
});

gulp.task('default', ['lint', 'lint-tests', 'test', 'browserify', 'watch']);