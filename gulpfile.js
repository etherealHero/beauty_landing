const { src, dest, watch, series, parallel } = require("gulp");
const del = require("del");
const size = require("gulp-size");
const htmlmin = require("gulp-htmlmin");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const newer = require("gulp-newer");
const imagemin = require("gulp-imagemin");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const bs = require("browser-sync").create();
const gulpif = require("gulp-if");

const clean = () => del(["dist"]);

const htmlTask = () =>
  src("src/**/*.html")
    .pipe(size({ showFiles: true }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest("dist"))
    .pipe(bs.stream());

const scssTask = () =>
  src("src/**/*.scss")
    .pipe(size({ showFiles: true }))
    .pipe(gulpif(isDevMode, sourcemaps.init()))
    .pipe(sass.sync({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(gulpif(isDevMode, sourcemaps.write()))
    .pipe(dest("dist"))
    .pipe(bs.stream());

const imgTask = () =>
  src("src/img/*")
    .pipe(newer("dist/img"))
    .pipe(imagemin({ verbose: true }))
    .pipe(dest("dist/img"));

const scriptTask = () =>
  src("src/js/**/*.js")
    .pipe(gulpif(isDevMode, sourcemaps.init()))
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(uglify())
    .pipe(gulpif(isDevMode, sourcemaps.write()))
    .pipe(size({ showFiles: true }))
    .pipe(dest("dist/js"));

const server = () => {
  bs.init({
    server: {
      baseDir: "./dist"
    }
  });

  watch("src/js/**/*.js", scriptTask);
  watch("src/**/*.html", htmlTask);
  watch("src/**/*.scss", scssTask);
  watch("src/img/**", imgTask);
};

let isDevMode = false;
const setDevMode = (cb) => {
  isDevMode = true;
  cb();
};

const build = series(clean, parallel(htmlTask, scssTask, imgTask, scriptTask));

exports.build = build;
exports.default = series(setDevMode, build, server);
