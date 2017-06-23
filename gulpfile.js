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
        .pipe(gulp.dest('frontend/build/css'))
        .pipe(csso())
        .pipe(rename({suffix: '.min'}))
        .pipe(size({
            showFiles: true
        }))
        .pipe(size({
            showFiles: true,
            gzip: true
        }))
        .pipe(gulp.dest('frontend/build/css'))
});

// Создание SVG спрайта
gulp.task('svgSprite', function () {
    return gulp.src('frontend/src/img-src/icons-svg/*.svg')
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
                    sprite: "../../../build/img/sprite.svg",
                    bust: false,
                    render: {
                        scss: {
                            dest: "../../src/sass/global/sprite-svg.scss",
                            template: "frontend/src/sass/templates/_sprite_template.scss"
                        }
                    }
                }
            },
            variables: {
                mapname: "icons"
            }
        }))
        .pipe(gulp.dest('frontend/build/img/'))
});




// Минификация JS
gulp.task('scripts', function() {
    return gulp.src([
        'frontend/src/js-modules/*.js'
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
        .pipe(gulp.dest('frontend/build/js'))
});

// gulp.task('html', function(){
//     gulp.src('frontend/build/index.html')
//         .pipe(browserSync.reload({stream:true}));
// });

gulp.task('views:render', function() {
    return gulp.src('frontend/src/templates/index.pug')
        .pipe(pug({ }))
        .pipe(gulp.dest('frontend/build'))
});

// Сборка
gulp.task('build', ['views:render', 'sass', 'scripts'], function() {

    gulp.src('frontend/src/fonts/**/*')
        .pipe(gulp.dest('frontend/build/fonts'));

    gulp.src('frontend/src/img-src/products/*.*')
        .pipe(gulp.dest('frontend/build/img'));

    gulp.src('frontend/src/img-src/background/*.*')
        .pipe(gulp.dest('frontend/build/img'));
});

// Вся работа в фоне
gulp.task('watch', ['sass', 'svgSprite', 'views:render'], function() {
    browserSync.init({
        server: {
            baseDir: 'frontend/build'
        },
        notify: false
    });
    gulp.watch('frontend/src/sass/**/*.scss', ['sass']);
    gulp.watch('frontend/src/img/**/*.svg', ['svgSprite']);
    gulp.watch('frontend/src/js-modules/*.js', ['scripts']);
    gulp.watch('frontend/src/templates/*.pug', ['views:render']);
    //gulp.watch('frontend/build/*.html', ['html']);
    gulp.watch("frontend/build/*.html").on('change', browserSync.reload);
});

// --> Перенос проекта в продакшн --> //
// Очистка папки build
gulp.task('clean', function() {
    return del.sync('build');
});


//Сжатие загружаемых изображений
gulp.task('img', function() {
    return gulp.src('src/img/**/*.{png,svg,jpg,gif}')
        .pipe(cache(imagemin({
            interlaced: true,
            optimizationlevel: 3,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('build/img'))
        .pipe(gulp.dest('docs/img'));
});



gulp.task('GitHubPages', ['clean', 'img', 'sass', 'scripts'], function() {

    gulp.src([
        'src/css/main.min.css'
    ])
        .pipe(gulp.dest('docs/css'));

    gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('docs/fonts'));

    gulp.src('src/js/**/*')
        .pipe(gulp.dest('docs/js'));

    gulp.src('src/*.html')
        .pipe(gulp.dest('docs'));

    gulp.src('src/img/**/*.svg')
        .pipe(gulp.dest('docs/img'));
});


// Task по умолчнаию
gulp.task('default', ['watch', 'build']);