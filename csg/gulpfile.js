var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    jshint = require('gulp-jshint');

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

gulp.task('watch', function() {
    gulp.watch('js/**/*.js', ['lint', 'test']);
    gulp.watch('tests/**/*.js', ['lint-tests', 'test']);
});

gulp.task('default', ['lint', 'lint-tests', 'test', 'watch']); 