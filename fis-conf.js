
fis
.hook('commonjs', {
    extList: ['.js', '.jsx', '.es', '.ts', '.tsx', ".html", ".vue",".es6"],
    packages: [
        {
            name: 'vue',
            location: '/node_modules/vue/dist/',
            main:(fis.media()._media==="production"?"vue.min.js":"vue.js"),
        }
    ],
})
.hook('node_modules')
.unhook('components');

fis.config.set("modules.optimizer", {
html: "minify-html"
});

fis.set('project.fileType.text', 'vue,json,es6');

fis
.match("*.{css,styl,{vue,html}:{css,stylus}}", {
    preprocessor: fis.plugin('autoprefixer', {
        "browsers": ["Android >= 4.0", "iOS >= 7", "IE>8", "Chrome>35", "Firefox>40"],
        "cascade": true
    })
})
.match("*.{js,css,svg,vue}", {
    useHash: true
})
.match("*.{html,vue}",{
    postprocessor: fis.plugin('extras_uri')
})
.match("*.{js,es6}", {        
    isMod: true, 
    preprocessor: fis.plugin('js-require-file')       
})
.match("mod.js",{
    isMod:false
}) 
.match("*,styl", {
    parser: fis.plugin('stylus', {
        sourcemap: true
    }),
    rExt: '.css'
})
.match("*.vue:stylus",{
    parser: fis.plugin('stylus', {
        sourcemap: true
    })
})
.match("*.{vue:js,es6}",{
    parser: fis.plugin('babel-6.x-fork'),
    preprocessor: [fis.plugin('js-require-file'),fis.plugin('js-require-css',{
        mode:"inline"
    })]
})
.match("*.es6",{
    rExt:".js"
})
.match("*.vue", {
    rExt: 'js',
    isMod: true,
    useMap: true,
    useSameNameRequire: true,
    umd2commonjs: true,
    useHash: true,
    parser: [
        fis.plugin('vue-component', {
            // vue@2.x runtimeOnly
            runtimeOnly: true,          // vue@2.x 有runtimeOnly模式，为true时，template会在构建时转为render方法    
            // styleNameJoin
            styleNameJoin: '',          // 样式文件命名连接符 `component-xx-a.css`    
            extractCSS: false,           // 是否将css生成新的文件, 如果为false, 则会内联到js中    
            // css scoped
            cssScopedIdPrefix: '_v-',   // hash前缀：_v-23j232jj
            cssScopedHashType: 'sum',   // hash生成模式，num：使用`hash-sum`, md5: 使用`fis.util.md5`
            cssScopedHashLength: 4,     // hash 长度，cssScopedHashType为md5时有效    
            cssScopedFlag: '__vuec__',  // 兼容旧的ccs scoped模式而存在，此例子会将组件中所有的`__vuec__`替换为 `scoped id`，不需要设为空
        })
    ],
})
.match('::package', {
    postpackager: fis.plugin('loader', {
        allInOne: true,
        resourceType: "mod",
        useInlineMap: true,
        sourceMap: true,
    })
});

fis.media("production")
.match("*.{js,vue:js}", {
    //压缩js插件，已内置
    optimizer: fis.plugin("uglify-js")
})
.match("*.css", {
    //压缩css插件，已内置
    optimizer: fis.plugin("clean-css")
})
.match("*.html", {
    //压缩html内联css和js
    optimizer: fis.plugin("minify-html")
});
