const {dest, parallel, series, src, watch} = require('gulp')

const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const sass = require('postcss-node-sass')
const uncss = require('postcss-uncss')
const cssnano = require('gulp-cssnano')

const uglify = require('gulp-uglify')
const babel = require('gulp-babel')

const imagemin = require('gulp-imagemin')

const rename = require('gulp-rename')
const del = require('delete')

const connect = 'gulp-connect'
const {join: pathJoin} = require('path')
const {existsSync, mkdirSync} = require('fs')


const BUILD_DIR = "./build"

function getPath(path) {
    path = pathJoin(BUILD_DIR, path)
    return path
}


function buildHtml(cb) {
    console.log("building HTML...")
    src(["./**/*.html", "!build/**/*"])
        .pipe(dest(getPath("./")))
    console.log("build HTML files")
    cb()
}

function copyVendors(cb) {
    console.log("copying vendor files...")
    src("./vendors/**/*")
        .pipe(dest(getPath("./vendors")))
    console.log("copied vendor files")
    cb()
}

function buildScripts(cb) {
    console.log("building scripts...")
    src('./assets/scripts/**/*.js')
        .pipe(babel())
        .pipe(dest(getPath("./assets/scripts")))
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(dest(getPath("./assets/scripts")))
    console.log("build scripts")
    cb()
}

function buildStyles(cb) {
    console.log("building styles...")
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
    console.log("building styles finished")
    cb()
}

function optimizeImages(cb) {
    console.log("optimizing images...")
    src( ["./assets/images/**/*.{jpg,png,svg,gif,jpeg}"]  )
        .pipe(imagemin())
        .pipe(dest(getPath("./assets/images")))
    console.log("image optimization finished")
    cb()
}


function clean(cb) {
    console.log("removing previous build")
    del([BUILD_DIR])
    console.log("previous builds removed")
    cb()
}


function watchForChanges(cb) {
    build()
    watch("./assets/scripts/**/*.js", buildScripts)
    watch(["./assets/styles/**/*.css", "./assets/styles/**/*.scss"], buildStyles)
    watch("./assets/images/**/*", optimizeImages)
    watch(["./**/*.html", "!build/**/*"], buildHtml)
    watch("./vendors/**/*", copyVendors)
    cb()
}


function liveBrowser() {
    connect.server({
        livereload: true,
        root: "build",
        port: 3000
    })
    watchForChanges()
}

exports.default = series(
    clean,
    parallel(
        copyVendors,
        buildStyles,
        buildScripts,
        optimizeImages,
        buildHtml
    ),
)

exports.dev = liveBrowser
exports.clean = clean