"use strict"

var gulp = require('gulp');
var addsrc = require('gulp-add-src');
var concat = require("gulp-concat")
var ts = require('gulp-typescript');
var merge = require('merge2')

var tsProject = ts.createProject('tsconfig.json');

gulp.task("default", function() {
	gulp.watch("src/**/*.ts", ["compile"])
	return compile()
})

gulp.task("compile", function() {
	return compile()
})

function compile() {
	var tsResult = tsProject.src().pipe(ts(tsProject));
	return merge([
	tsResult.js.pipe(gulp.dest('target')),
	tsResult.dts
	.pipe(addsrc("src/typings.d.ts"))
	.pipe(concat("typings.d.ts"))
	.pipe(gulp.dest("target"))
  ])
}





