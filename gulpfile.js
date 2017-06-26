var
    gulp         = require('gulp'),
    browserSync  = require('browser-sync'),
    concat       = require('gulp-concat'),
    rename       = require('gulp-rename'),
    del          = require('del'),
    plumber      = require('gulp-plumber'),
    size         = require('gulp-size'),

    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    csso         = require('gulp-csso'),
    combineMq     = require('gulp-combine-mq'),

    imagemin     = require('gulp-imagemin'),
    spritesmith  = require('gulp.spritesmith'),
    pngquant     = require('imagemin-pngquant'),

    uglify       = require ('gulp-uglifyjs'),
    pug          = require('gulp-pug2');

var $ = {
    gutil: require('gulp-util'),
    svgSprite: require('gulp-svg-sprite'),
    size: require('gulp-size')
};

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: 'build'
        },
        startPath: 'index.html'
    });
});

gulp.task('pug', function() {
    return gulp.src('dev/templates/index.pug')
        .pipe(pug({
            pretty: '\t'
        }))
        .pipe(gulp.dest('build'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('scripts', function() {
    return gulp.src([
        'dev/js-modules/*.js'
    ])
        .pipe(size({
            showFiles: true
        }))
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(size({
            showFiles: true
        }))
        .pipe(size({
            showFiles: true,
            gzip: true
        }))
        .pipe(gulp.dest('build/js'))
});

gulp.task('svgSprite', function () {
    return gulp.src('dev/icons-svg/*.svg')
        .pipe($.svgSprite({
            shape: {
                spacing: {
                    padding: 5
                }
            },
            mode: {
                css: {
                    dest: "./",
                    layout: "diagonal",
                    sprite: "../img-src/sprite.svg",
                    bust: false,
                    render: {
                        scss: {
                            dest: "../sass/global/sprite-svg.scss",
                            template: "dev/sass/templates/_sprite_template.scss"
                        }
                    }
                }
            },
            variables: {
                mapname: "icons"
            }
        }))
        .pipe(gulp.dest('build/img/'))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task('sass', function(){
    return gulp.src('dev/sass/main.scss')
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(
            ['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }
        ))
        .pipe(combineMq({beautify: false}))
        .pipe(size({
            showFiles: true
        }))
        .pipe(gulp.dest('build/css'))
        .pipe(csso())
        .pipe(rename({suffix: '.min'}))
        .pipe(size({
            showFiles: true
        }))
        .pipe(size({
            showFiles: true,
            gzip: true
        }))
        .pipe(gulp.dest('build/css'))
});




gulp.task('watch', ['sass', 'scripts', 'pug'], function () {
    gulp.watch('dev/sass/**/*.scss', ['sass', browserSync.reload]);
    gulp.watch('dev/js-modules/*.js', ['scripts']);
    gulp.watch('dev/templates/*.pug', ['pug']);
    gulp.watch('build/*.html', browserSync.reload);
});


gulp.task('build', ['sass', 'scripts', 'pug', 'svgSprite'], function() {

    gulp.src('dev/fonts/**/*')
        .pipe(gulp.dest('build/fonts'));

    gulp.src('dev/img-src/*.*')
        .pipe(gulp.dest('build/img'));

});


gulp.task('default', ['watch', 'build', 'browser-sync']);

