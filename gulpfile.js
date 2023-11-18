'use strict'

const gulp = require('gulp')
const path = require('path')
const pkg = require('./package.json')
const zip = require('gulp-zip')
const imagemin = require('gulp-imagemin')
const jsonEditor = require('gulp-json-editor')
const { exec } = require('child_process')
const cheerio = require('gulp-cheerio')
const gulpIf = require('gulp-if')

function logMessage (message) {
  console.log(`${message}`)
}

gulp.task('update-version', function (cb) {
  const manifestPath = path.join(__dirname, 'src', 'manifest.json')
  const manifest = require(manifestPath)
  const version = manifest.version

  return gulp.src('./package.json')
    .pipe(jsonEditor({ version }))
    .pipe(gulp.dest('./'))
    .on('end', function () {
      exec('npm install', { cwd: './' }, function (error) {
        if (error) {
          logMessage('Error running npm install: ' + error)
          return
        }
        cb()
      })
    })
    .on('error', function (error) {
      logMessage('Error updating version in package.json: ' + error.toString())
    })
})

gulp.task('build-chrome', function () {
  const manifestPath = path.join(__dirname, 'src', 'manifest.json')
  const manifest = require(manifestPath)
  const version = manifest.version

  return gulp.src(['src/**'])
    .pipe(imagemin([imagemin.optipng({ optimizationLevel: 5 })]))
    .pipe(gulpIf('*.html', cheerio(($) => {
      $('body').removeAttr('class').addClass('chrome')
    })))
    .pipe(zip(`${pkg.name}-v${version}-chrome.zip`))
    .pipe(gulp.dest('build'))
    .on('end', function () {
      console.log(`Built: ${pkg.name}-v${version}-chrome.zip`)
    })
})

gulp.task('build-edge', function () {
  const manifestPath = path.join(__dirname, 'src', 'manifest.json')
  const manifest = require(manifestPath)
  const version = manifest.version

  return gulp.src(['src/**'])
    .pipe(imagemin([imagemin.optipng({ optimizationLevel: 5 })]))
    .pipe(gulpIf('*.html', cheerio(($) => {
      $('body').removeAttr('class').addClass('edge')
    })))
    .pipe(zip(`${pkg.name}-v${version}-edge.zip`))
    .pipe(gulp.dest('build'))
    .on('end', function () {
      console.log(`Built: ${pkg.name}-v${version}-edge.zip`)
    })
})

gulp.task('build', gulp.series('update-version', 'build-chrome', 'build-edge'))
