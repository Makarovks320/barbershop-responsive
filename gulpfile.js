'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');  /*запирает все ошибки*/
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglifyEs = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');


sass.compiler = require('node-sass');

function styles() {
    return gulp.src('./sass/style.scss')
                .pipe(plumber())
                .pipe(sass({
                    includePaths: require('node-normalize-scss').includePaths
                }).on('error', sass.logError))
                .pipe(autoprefixer({
                    /*browsers: ['last 2 versions'], - убрал в package.json в "browserslist"*/
                    cascade: false
                }))
                .pipe(gulp.dest('./build/css'))
                .pipe(cleanCSS({level: 2}))
                .pipe(rename('syle-min.css'))
                .pipe(gulp.dest('./build/css'))
                .pipe(browserSync.stream()); /*Команда перезагрузки сервера в браузере*/
}


const jsFiles = ['./js/menu.js'];
function scripts() {
    return gulp.src(jsFiles)
                .pipe(concat('scripts.js'))
                .pipe(gulp.dest('./build/js'))
                .pipe(rename('scripts-min.js'))
                .pipe(uglifyEs({
                    toplevel: true
                }))
                .pipe(gulp.dest('./build/js'))
                .pipe(browserSync.stream());
}

function watch() {
    browserSync.init({ /*запустит локальный сервак на node.js*/
        server: "./", /*указывает, где искать html-файлы*/
    });
    gulp.watch('./sass/**/*.scss', styles).on('change', browserSync.reload);
    gulp.watch('./js/**/*.js', scripts).on('change', browserSync.reload);
    gulp.watch('./*.html').on('change', browserSync.reload);
}

function clean() {
    return del(['./build/*']);  /*требуется return, иначе ошибка: The following tasks did not complete: clean*/
}

function copy() {
    return gulp.src(['./fonts/**/*.{woff, woff2}', './img/**'],
                     {base: "./"})
                .pipe(gulp.dest('./build'))
}

function sprite() {
    return
}
// добавить webp, svgstore
function images() {
    return gulp.src('./build/img/*.{png,jpg,gif}') /*берем любой .png, .jpg, .gif файл в любой подпапке папки img*/
      .pipe(imagemin([      /*imagemin сам по себе содержит в себе множество плагинов (работа с png,svg,jpg и тд)*/
        imagemin.optipng({optimizationLevel: 3}), /* 1 - максимальное сжатие, 3 - безопасное сжатие, 10 - без сжатия*/
        imagemin.mozjpeg({progressive: true}),   /*прогрессивная загрузка jpg (сначала пиксельная, позже проявляется)*/
        ]))
      .pipe(gulp.dest('./build/img'));
  };

gulp.task('clean', clean);
gulp.task('watch', watch);
gulp.task('build', gulp.series(clean, /*gulp.series синхронно и последовательно запускает функции*/
                                gulp.parallel(styles, scripts, copy), /*асинхронно*/
                                images
                                ));








