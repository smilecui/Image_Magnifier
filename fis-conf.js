



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
    isMod: false, 
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

//设置发布
fis.set('new date', Date.now());


//所有文件支持相对路径
fis.hook('relative');
fis.match('**', {
    relative: true
});

fis.config.set('modules.preprocessor.html', 'components,inline-deps'); 






