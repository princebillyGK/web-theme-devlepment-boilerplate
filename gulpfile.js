const {dest, parallel, series, src, watch} = require('gulp'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    sass = require('postcss-node-sass'),
    uncss = require('postcss-uncss'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    del = require('delete'),
    connect = require('gulp-connect'),
    {join: pathJoin} = require('path')


const BUILD_DIR = "./build"

function getPath(path) {
    path = pathJoin(BUILD_DIR, path)
    return path
}


function buildHtml(cb) {
    src(["./**/*.html", "!build/**/*"])
        .pipe(dest(getPath("./")))
        .pipe(connect.reload())
    cb()
}

function copyVendors(cb) {
    src("./vendors/**/*")
        .pipe(dest(getPath("./vendors")))
        .pipe(connect.reload())
    cb()
}

function buildScripts(cb) {
    src('./assets/scripts/**/*.js')
        .pipe(babel())
        .pipe(dest(getPath("./assets/scripts")))
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(dest(getPath("./assets/scripts")))
        .pipe(connect.reload())
    cb()
}

function buildStyles(cb) {
    src("./assets/styles/*.scss")
        .pipe(postcss([
            sass(),
            autoprefixer(),
            uncss({
                html: ['./**/*.html']
            })
        ]))
        .pipe(dest(getPath("./assets/styles/")))
        .pipe(cssnano())
        .pipe(rename({extname: ".min.css"}))
        .pipe(dest(getPath("./assets/styles/")))
        .pipe(connect.reload())
    cb()
}

function optimizeImages(cb) {
    src(["./assets/images/**/*.{jpg,png,svg,gif,jpeg}"])
        .pipe(imagemin())
        .pipe(dest(getPath("./assets/images")))
        .pipe(connect.reload())
    cb()
}


function clean(cb) {
    del([BUILD_DIR])
    cb()
}

const build= series(
    clean,
    parallel(
        copyVendors,
        buildStyles,
        buildScripts,
        optimizeImages,
        buildHtml
    ),
)


function watchForChanges() {
    build()
    watch("./assets/scripts/**/*.js", buildScripts)
    watch(["./assets/styles/**/*.css", "./assets/styles/**/*.scss"], buildStyles)
    watch("./assets/images/**/*", optimizeImages)
    watch(["./**/*.html", "!build/**/*"], buildHtml)
    watch("./vendors/**/*", copyVendors)
}


function liveBrowser() {
    connect.server({
        livereload: true,
        root: "build",
        port: 3000
    })
    console.log("Site is live: https://localhost:3000")
    watchForChanges()
}

exports.default = build
exports.dev = liveBrowser
exports.clean = clean