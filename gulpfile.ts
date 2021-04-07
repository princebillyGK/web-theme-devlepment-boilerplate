import {dest, parallel, series, src, watch} from 'gulp'

import postcss from 'gulp-postcss'
import * as autoprefixer from 'autoprefixer'
import sass from 'postcss-node-sass'
import uncss from 'postcss-uncss'
import cssnano from 'gulp-cssnano'

import uglify from 'gulp-uglify'
import babel from 'gulp-babel'

import imagemin from 'gulp-imagemin'

import rename from 'gulp-rename'
import del from 'delete'

import connect from 'gulp-connect'
import {join as pathJoin} from 'path'
import {existsSync, mkdirSync} from 'fs'


const BUILD_DIR = "./build"

function getPath(path: string): string {
    path = pathJoin(BUILD_DIR, path)
    if (!existsSync(path)) {
        mkdirSync(path)
    }
    return path
}

export async function liveBrowser() {
    connect.server({
        livereload: true,
        root: "build",
        port: 3000
    })
    await watchForChanges()
}

export async function buildHtml() {
    console.log("building HTML...")
    src(["/**/*.html", "!build/**/*"])
        .pipe(dest(getPath("/")))
    console.log("building HTML finished")
}

export async function copyVendors() {
    console.log("copying vendor files...")
    src("./vendors/**/*")
        .pipe(dest(getPath("./vendors")))
    console.log("copying vendor files finished")
}

export async function buildScripts() {
    console.log("building scripts...")
    src('./assets/scripts/**/*.js')
        .pipe(babel)
        .pipe(dest(getPath("./assets/scripts")))
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(dest(getPath("./assets/scripts")))
    console.log("building scripts finished")
}

export async function buildStyles() {
    console.log("building styles...")
    src("./assets/styles/main.scss")
        .pipe(postcss([
            sass(),
            autoprefixer(),
            uncss({
                html: ['/**/*.html']
            })
        ]))
        .pipe(dest(getPath("./assets/styles/")))
        .pipe(cssnano())
        .pipe(rename({extname: ".min.css"}))
        .pipe(dest(getPath("./assets/styles/")))
    console.log("building styles finished")
}

export async function optimizeImages() {
    console.log("optimizing images...")
    src("./assets/images/**/*")
        .pipe(imagemin())
        .pipe(dest(getPath("assets/images")))
    console.log("image optimization finished")
}

export function clean() {
    console.log("removing previous build")
    del([BUILD_DIR])
    console.log("previous builds removed")
}


export async function watchForChanges() {
    await build()
    watch("./assets/scripts/**/*.js", buildScripts)
    watch(["./assets/styles/**/*.css", "./assets/styles/**/*.scss"], buildStyles)
    watch("./assets/images/**/*", optimizeImages)
    watch(["./**/*.html", "!build/**/*"], buildHtml)
    watch("./vendors/**/*", copyVendors)
}

export const build = async () => series(
    clean,
    parallel(
        copyVendors,
        buildStyles,
        buildScripts,
        optimizeImages,
        buildHtml
    ),
)

export {build as default}