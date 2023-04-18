//https://nodejs.org/download/release/v10.15.0/node-v10.15.0-x64.msi
//Install gulp 4.0.2 first
// Include Gulp
const {
    task,
    watch,
    series,
    parallel,
    dest,
    src
  } = require('gulp');
  
  // Include Lib
  // const gulp = require('gulp');
  const sass = require('gulp-sass')(require('sass')),
    imagemin = require('gulp-imagemin'),
    browsersync = require('browser-sync').create(),
    hbs = require('gulp-compile-handlebars'),
    data = require('gulp-data'),
    fs = require('fs'),
    helpers = require('handlebars-helpers')({
      handlebarsv: hbs
    }),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    autoprefix = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify-es').default,
    purify = require('gulp-purifycss'),
    concat = require('gulp-concat'),
    inject = require('gulp-inject-string');
  
    let paths_code = {
    root: ['./build/'],
    src_sass: ['./src/sass/**/*.scss'],
    src_json: './src/json/wiken-mobile.json',
    src_partials: ['./src/handlebars/partials'],
    src_hbs: './src/handlebars/**/*.handlebars',
    src_img: './src/images/**/*',
    src_js: './src/js/*.js',
    dest_hbs: './build/',
    dest_img: './build/images',
    dest_sass: './build/css',
    dest_js: './build/js',
  };
  // project actives
  let paths = paths_code;
  
  function browserSync(done) {
    browsersync.init({
      // host: "bayu",
      // port: 80,
      ghostMode: true,
      open: false,
      server: {
        baseDir: paths.root
      },
    })
    done();
  };
  
  function browserSyncReload(done) {
    browsersync.reload();
    done();
  }
  // Handlebars compiler
  function hbars(done) {
    let templateData = {
        author: 'byprakoso'
      },
      options = {
        ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false 
        batch: paths.src_partials
      }
  
    src(paths.src_hbs)
      .pipe(hbs(templateData, options))
      .pipe(rename(function (path) {
        path.extname = '.html';
      }))
      .pipe(dest(paths.dest_hbs))
      .pipe(browsersync.reload({
        stream: true
      }))
    done();
  };
  
  function hbsjson(done) {
    let templateData = {
        author: 'Bayu Adi Prakoso'
      },
      options = {
        ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false 
        batch: paths.src_partials
      }
  
    src(paths.src_hbs)
      .pipe(data(function (file) {
        return JSON.parse(
          fs.readFileSync(paths.src_json)
        );
      }))
      .pipe(hbs(templateData, options))
      .pipe(rename(function (path) {
        path.extname = '.html';
      }))
      .pipe(dest(paths.dest_hbs))
      .pipe(browsersync.reload({
        stream: true
      }))
    done();
  };
  
  // SASS
  function style(done) {
    src(paths.src_sass)
      .pipe(sass({
        errorLogToConsole: true,
        outputStyle: 'compressed'
      }))
      .on('error', console.error.bind(console))
      .pipe(autoprefix({
        browsers: ['last 2 versions'],
        cascade: false
      }))
      .pipe(browsersync.reload({
        stream: true
      }))
      .pipe(dest(paths.dest_sass));
    done();
  };
  // SASS MIN
  function stylemin(done) {
    src(paths.src_sass)
      .pipe(sourcemaps.init())
      .pipe(sass({
        errorLogToConsole: true,
        outputStyle: 'compressed'
      }))
      .on('error', console.error.bind(console))
      .pipe(autoprefix({
        browsers: ['last 2 versions'],
        cascade: false
      }))
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(browsersync.reload({
        stream: true
      }))
      .pipe(dest(paths.dest_sass));
    done();
  };
  
  //Minify JS
  function scriptsmin(done) {
    src(paths.src_js)
      // .pipe(concat('main.js'))
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(uglify())
      .on('error', onError)
      .pipe(dest(paths.dest_js));
    done();
  };

  //Images min
  function imagesmin(done){
    src(paths.src_img)
      .pipe(imagemin())
      .pipe(dest(paths.dest_img))
    done();
  }
  //bundlecss
  function bundleCss(done) {
    src(paths.dest_sass + '/*.css')
      .pipe(concat('style-bundle.css'))
      .pipe(autoprefix({
        browsers: ['last 2 versions'],
        cascade: false
      }))
      .pipe(rename({
        basename: 'style-bundle',
        suffix: '.min',
      }))
      .pipe(dest(paths.dest_sass))
    done();
  };
  
  function ampInject(done){
    var cssContent = fs.readFileSync(paths.dest_css, "utf8");
    src(paths.dest_html)
        .pipe(inject.after('style amp-custom>', cssContent))
        .pipe(dest(paths.root))
        .pipe(browsersync.reload({
          stream: true
        }))
    done();
  };
  
  //amp validator
  function ampValidator(done) {
    src(paths.root)
      // Validate the input and attach the validation result to the "amp" property
      // of the file object. 
      .pipe(gulpAmpValidator.validate())
      // Print the validation results to the console.
      .pipe(gulpAmpValidator.format())
      // Exit the process with error code (1) if an AMP validation error
      // occurred.
      .pipe(gulpAmpValidator.failAfterError());
    done();
  };
  
  
  function watchFile(done) {
    // Watch .js files
    watch(paths.src_js, series(scriptsmin));
    // Watch .scss files
    watch(paths.src_sass, series(stylemin));
    // Watch Handlebars file
    watch(paths.src_hbs, series(hbars));
    // Watch Imagesmin file
    watch(paths.src_img, series(imagesmin));
    series(browserSyncReload);
    done();
  };
  
  function watchJson(done) {
    // Watch .js files
    watch(paths.src_js, series(scriptsmin));
    // Watch .scss files
    watch(paths.src_sass, series(stylemin));
    // // Watch Handlebars file
    watch(paths.src_hbs, series(hbsjson));
    series(browserSyncReload);
    done();
  };
  
  function watchNoscript(done) {
    // Watch .scss files
    watch(paths.src_sass, series(stylemin));
    // Watch Handlebars file
    watch(paths.src_hbs, series(hbars));
    series(browserSyncReload);
    done();
  };
  
  function watchNoscriptJson(done) {
    // Watch .scss files
    watch(paths.src_sass, series(stylemin));
    // Watch Handlebars file
    watch(paths.src_hbs, series(hbsjson));
    series(browserSyncReload);
    done();
  };
  
  // My Task
  task('default', series(stylemin, scriptsmin, hbars, imagesmin, parallel(browserSync, watchFile)), function (done) {
    gulp.src('./index.js')
      .pipe(wait(1500))
    done();
  });
  
  task('json', series(stylemin, scriptsmin, hbsjson, parallel(browserSync, watchJson)), function () {
    gulp.src('./index.js')
      .pipe(wait(1500))
  });
  
  task('amp', series(browserSync, style, hbars, ampInject, (done) => {
      watch(paths.src_sass, series(style));
      watch(paths.src_hbs_watch, series(hbars));
      watch(paths.dest_css, series(ampInject));
        watch(paths.dest_html, series(ampInject));
    done();
  }));
  
  task('noscript', series(stylemin, hbars, parallel(browserSync, watchNoscript)), function (done) {
    gulp.src('./index.js')
      .pipe(wait(1500))
    done();
  });
  task('noscript-json', series(stylemin, hbsjson, parallel(browserSync, watchNoscriptJson)), function (done) {
    done();
  });
  
  task('bundlecss', series(bundleCss));
  
  function onError(err) {
    console.log(err);
    this.emit('end');
  }