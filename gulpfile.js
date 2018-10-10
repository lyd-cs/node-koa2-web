const gulp = require('gulp');
const stylus = require('gulp-stylus');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const pugify = require('pugify').pug({ pretty: false });
const stripDebug = require('gulp-strip-debug');
// const babelify = require('babelify');

const paths = {
  styl: ['src/styl/*.styl'],
  mobile: [
    'static/lib/jquery-2.1.4.js',
    'static/lib/underscore.js',
    'static/lib/fastclick.js',
    'static/lib/jquery.fullpage.js',
    'static/lib/jquery.validate.js',
    'static/lib/jquery.easing.min.js',
    'static/lib/jquery.rotate.js'
  ],
  lib: [
    'src/lib/jquery-1.11.3.js',
    'src/lib/bootstrap-datepicker.js',
    'src/lib/bootstrap-datepicker.zh-CN.min.js',
    'src/lib/modal.js',
    'src/lib/unslider.js',
    'src/lib/jquery.validate.js',
    'src/lib/countUp.js'
  ]
};

gulp.task('stylus', function() {
  gulp
    .src(paths.styl)
    .pipe(
      stylus({
        compress: true,
        url: {
          name: 'url',
          limit: 10000,
          paths: ['static']
        }
      })
    )
    .pipe(gulp.dest('./static/css'));
});

gulp.task('stylus-dev', function() {
  gulp
    .src(paths.styl)
    .pipe(
      stylus({
        linenos: true,
        url: {
          name: 'url',
          limit: 10000,
          paths: ['static']
        }
      })
    )
    .pipe(gulp.dest('./static/css'));
});

gulp.task('js', function() {
  const src = 'src/js/index.js';
  const dest = 'static/js/app.js';
  const b = browserify({
    entries: src,
    transform: [pugify],
    debug: false
  });

  return b
    .bundle()
    .pipe(source(dest))
    .pipe(buffer())
    .pipe(stripDebug())
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(gulp.dest('./'));
});

// build browserify
gulp.task('js-dev', function() {
  const src = 'src/js/index.js';
  const dest = 'static/js/app.js';
  const b = browserify({
    entries: src,
    transform: [pugify],
    debug: true
  });

  return b
    .bundle()
    .pipe(source(dest))
    .pipe(buffer())
    .on('error', gutil.log)
    .pipe(gulp.dest('./'));
});

// build browserify
gulp.task('babel', function() {
  var src = 'src/babel/mobile.js';
  var dest = 'static/js/mobile.js';
  var b = browserify({
    entries: src,
    transform: [['babelify', { presets: ['es2015'] }]],
    debug: false
  });

  return (
    b
      .bundle()
      .pipe(source(dest))
      .pipe(buffer())
      .pipe(stripDebug())
      //.pipe(sourcemaps.init({loadMaps: true}))
      // Add transformation tasks to the pipeline here.
      .pipe(uglify())
      .on('error', gutil.log)
      //.pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./'))
  );
});

// build browserify
gulp.task('babel-dev', function() {
  var src = 'src/babel/mobile.js';
  var dest = 'static/js/mobile.js';
  var b = browserify({
    entries: src,
    transform: [['babelify', { presets: ['es2015'] }]],
    debug: true
  });

  return (
    b
      .bundle()
      .pipe(source(dest))
      .pipe(buffer())
      //.pipe(sourcemaps.init({loadMaps: true}))
      // Add transformation tasks to the pipeline here.
      //.pipe(uglify())
      .on('error', gutil.log)
      //.pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./'))
  );
});

// build lib
gulp.task('mobileLib', function() {
  // mobile lib
  gulp
    .src(paths.mobile)
    .pipe(uglify())
    .pipe(concat('mobile.lib.js'))
    .pipe(gulp.dest('static/js'));
  // web lib
  gulp
    .src(paths.lib)
    .pipe(uglify())
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('static/js'));
});

// build lib
gulp.task('lib', function() {
  // web lib
  gulp
    .src(paths.lib)
    .pipe(uglify())
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*.styl', 'static/img/*'], ['stylus-dev']);
  gulp.watch(['src/lib/*'], ['js-dev', 'lib', 'babel-dev']);
  gulp.watch(['src/js/**/*.*', 'tpl/*.pug'], ['js-dev']);
  gulp.watch('src/babel/**/*.*', ['babel-dev']);
});

gulp.task('build', ['stylus', 'js', 'lib', 'babel', 'mobileLib']);

gulp.task('default', ['stylus', 'js', 'lib']);
