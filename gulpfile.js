// gulp
const gulp = require('gulp')
// gulp.task  (任务名称,任务处理函数) => 基于流的任务
// gulp.src (路径信息) => 找源文件
// .pipe()  管道函数,所有的gulp Api 都是基于流 **接收当前流,进入下一个流的管道函数**
// gulp.src.pipe(压缩任务).pipe(转码).pipe(gulp.dest('abc'))
// gulp.dest (路径) => 放入指定目录下
gulp.task('html', function () {
    return gulp.src('src/pages/*.html').pipe(gulp.dest('dist'))
})
// gulp.watch (路径信息,任务名称) 监控指定目录下的文件,一旦发生变化,执行后面的任务   
// gulp.watch('./src/index.html', function () {
//     return 'html'
// })
// gulp.series (任务1,任务2,任务3,....)    => 逐个执行多个任务
gulp.series('html')
// gulp.parallel (任务1,任务2,任务3,....)  => 并行开始执行任务
gulp.parallel('html')



//  cssmin 文件压缩        
const cssmin = require('gulp-cssmin');
//  rename 文件重命名
const rename = require('gulp-rename');
//  autoprefixer css 兼容前缀  package.json  browserslist:['']
// https://github.com/browserslist/browserslist#readme
// https://twitter.com/browserslist
const autoprefixer = require('gulp-autoprefixer')
//  sass 转码 css 
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
//  js 压缩
const uglify = require('gulp-uglify');
//  1-3-0
const pipeline = require('readable-stream').pipeline;
//  1-3-1  cnpm install --save-dev gulp-babel babel-core babel-preset-env
const babel = require('gulp-babel');

//  html 压缩    
const htmlMin = require('gulp-htmlmin')

//  images  gulp-imagemin  无损压缩
const imagemin = require('gulp-imagemin');

// del 删除 dist 
const del = require('del')

//  webserver  打包处理   cnpm install --save-dev gulp-webserver
const webserver = require('gulp-webserver')

//   导入组件
const fileinclude = require('gulp-file-include');

// gulp@3
// gulp.task('default', function () {
//     // 需要捕获到该任务的结束,需要把这个流return 出去, task 就会处理流
//     return gulp.src('./src/styles/*.css')
//         .pipe(cssmin())
//         .pipe(rename({ suffix: '.min' }))
//         .pipe(gulp.dest('./dist/css/'));
// });

// gulp@4
// 1-1 css 
const cssHandle = function () {
    return gulp.src('./src/styles/*.css')
        // .pipe(autoprefixer({browsers:["last 2 versions"]}))
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./dist/css/'));
}

// 1-2 sass 
const sassHandle = function () {
    return gulp.src('./src/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        // .pipe(autoprefixer({browsers:["last 2 versions"]}))
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./dist/sass/'));
}

// 1-3-0 js 
// const jsHandle = function () {
//     return pipeline(gulp.src('./src/js/*.js'), uglify(), gulp.dest('./dist/js/'))
// }

// 1-3-1 js 
const jsHandle = function () {
    return gulp.src('./src/js/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js/'))
}
// 1-4 html 
const htmlHandle = function () {
    return gulp.src('./src/pages/*.html')
        // 1-13
        .pipe(fileinclude({
            prefix: '@-@', // 自定义标识符
            basepath: './src/components', //组件目录
        }))
        .pipe(htmlMin(
            {
                collapseWhitespace: true,// 移除空格
                removeEmptyAttributes: true, // 移除空格的属性(仅限于原生)
                collapseBooleanAttributes: true, //  移除CheckBox 类似的布尔值属性
                removeAttributeQuotes: true, //  移除属性上的双引号
                minifyCSS: true, //  压缩内嵌式css 代码(只能是基本压缩, 不能添加前缀)
                minifyJS: true, //   压缩内嵌式Js代码 (不能进行转码)
                removeStyleLinkTypeAttributes: true, // 移除 style/link type 属性
                removeScriptTypeAttributes: true, // 移除  Script    Type 属性
            }
        ))
        .pipe(gulp.dest('./dist/pages/'))
}

//  1-5 imgHandle 
const imgHandle = function () {
    return gulp.src('./src/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/images'))
}

//  1-6 videosHandle 
// const videosHandle = function () {
//     return gulp.src('./src/videos/*')
//         .pipe(gulp.dest('./dist/videos/'))
// }

//  1-7 audiosHandle 
// const audiosHandle = function () {
//     return gulp.src('./src/audios/*')
//         .pipe(gulp.dest('./dist/audios/'))
// }

//  1-8 打包第三方 
// const libHandle = function () {
//     return gulp.src('./src/lib/**/**')
//         .pipe(gulp.dest('./dist/lib/'))
// }

//  1-9 fonts 
// const fontsHandle = function () {
//     return gulp.src('./src/fonts/**/**')
//         .pipe(gulp.dest('./dist/fonts/'))
// }

//  1-10  打包之前删除del 
const delHandle = function () {
    return del(['./dist'])
}
// 1-11  启动服务器
const webHandle = function () {
    return gulp.src('./dist')
        .pipe(
            webserver(
                {
                    host: 'www.KLJ.com', //域名(可以配置自定义域名)
                    port: '8080', // 端口号
                    livereload: true, // 当文件修改时候,是否自动刷新页面
                    open: './pages/login.html',// 默认打开哪一个文件(从dist 目录以后的目录打开)
                    proxies: [ //代理地址
                        // 一个对象一个代理地址,没有不写
                        {
                            //代理标识符
                            source: '/dt',
                            // 代理地址
                            target: 'https://www.duitang.com/napi/blog/list/by_filter_id/'
                        }
                    ]
                }
            )
        )
}

//  1-12  watch 实时刷新
const watchHandle = function () {
    gulp.watch('./src/styles/*.css', cssHandle)
    gulp.watch('./src/sass/*.scss', sassHandle)
    gulp.watch('./src/js/*.js', jsHandle)
    gulp.watch('./src/pages/*.html', htmlHandle)
    gulp.watch('./src/images/*', imgHandle)
}



// module.exports = {
//     cssHandle,
//     sassHandle,
//     jsHandle,
//     htmlHandle,
//     imgHandle,
//     // videosHandle,
//     // audiosHandle,
//     // libHandle,
//     // fontsHandle,
//     delHandle
// }

// 2.配置默认任务  执行所有任务   它们的返回值是函数  
// gulp.series('html')
// gulp.parallel('html')
// gulp.task('default',()=>{})
// module.exports.default = () => { }

// const res = gulp.parallel(cssHandle,
//     sassHandle,
//     jsHandle,
//     htmlHandle,
//     imgHandle)
// module.exports.default = res


// 为什么使用default   **gulp**  默认执行 default 任务 

// module.exports.default =
//     gulp.series(
//         cssHandle,
//         sassHandle,
//         jsHandle,
//         htmlHandle,
//         imgHandle
//     )


// module.exports.default = gulp.series(
//     delHandle,
//     cssHandle,
//     sassHandle,
//     jsHandle,
//     htmlHandle,
//     imgHandle,
//     // videosHandle,
//     // audiosHandle,
//     // libHandle,
//     // fontsHandle,
// )

// 如果修改文件名称  会存在问题  存在就覆盖 不存在就创建   所以就会出现两个文件   **打包之前删除dist文件**  gulp.series  del

// 3.**利用 gulp 启动一个服务器**     **node**
/*
    1).sass 文件处理 src 路径处理  **dist目录**
*/
module.exports.default = gulp.series(
    delHandle,
    gulp.parallel(
        cssHandle,
        sassHandle,
        jsHandle,
        htmlHandle,
        imgHandle,
    ),
    webHandle,
    watchHandle,
)






