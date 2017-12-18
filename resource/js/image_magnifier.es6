!(function(w, d) {
  require("/resource/js/sentinel.min.js");
  require("/resource/js/alloy_touch.js");
  require("/resource/js/transform.js");
  require("/resource/js/alloy-crop.js");
  var VConsole = require('/resource/js/vconsole.min.js');
  var vConsole = new VConsole();
  vConsole.show();
  w.requestAnimationFrame=w.requestAnimationFrame||w.webkitRequestAnimationFrame||function(fun){setTimeout(fun(), 1000/60);};
  w.cancelAnimationFrame=w.cancelAnimationFrame||w.webkitCancelAnimationFrame||w.clearTimeout;
  class Magnifier {
    constructor(config) {
      this.AutoIdArr = []; //存放随机码
      this.img_box = [];
      this.Auto_model = {}; //存放autoId对应的模型
      this.winWidth=window.innerWidth;
      this.currentIndex=1;//当前第几个
      this.currentImg;//当前image
      if (Object.prototype.toString.call(config) !== "[object Object]") {
        return;
      }
      //没有传el就默认为所有的img
      config.el = config.el || "img";
      this.option = config;
      document.body.insertAdjacentHTML(
        "afterbegin",
        __inline("/resource/template/magnifier.html")
          .replace(
            /\/resource\/img\/img2.jpg/g,
            __uri("../resource/img/img2.jpg")
          )
          .replace(
            /\/resource\/img\/img3.jpg/g,
            __uri("../resource/img/img3.jpg")
          )
      );
      this.loadingDom = document.querySelector("._img_magnifier_spinner");
      this.boxDOm = document.querySelector("._img_magnifier_box");
      var style = document.createElement("style");
      style.id = "_img_magnifier_style";
      style.innerHTML =
        __inline("/resource/css/magnifier.css") +
        "._img_magnifier_item{width:" +
        window.innerWidth +
        "px}";
      document.head.appendChild(style);
      require("/resource/css/magnifier.css");
      [].map.call(
        document.querySelectorAll(config.el),
        (() => {
          var isConfigAttr = config.attr && config.attr != "";
          return (Element, index) => {
            if (Element.classList.contains("_img_magnifier_view")) return;
            var autoId =
              "magnifier_" +
              Math.random()
                .toString(16)
                .slice(2);
            var currentEleModel = {};
            var image_url = Element.getAttribute(
              isConfigAttr ? config.attr : "src"
            );
            //判断是否是有效链接
            if (
              !/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i.test(
                image_url
              )
            ) {
              return;
            }
            Element.dataset.magnifier_index = autoId;

            currentEleModel.url = image_url;
            currentEleModel.sign = autoId;
            currentEleModel.loaded = false;
            this.img_box.push(currentEleModel);
            this.AutoIdArr.push(autoId);
          };
        })()
      );
      //刷新样式
      this.refreshStyle();
      //监听动态拼接的DOM
      sentinel.on(config.el, Element => {
        var autoId = Element.dataset.magnifier_index;
        if (this.AutoIdArr.indexOf(autoId) > -1) return;
        //重新遍历DOM(避免拼接的DOM处于中间的位置导致顺序错乱)
        this.img_box = [];
        var template_Img_box = this.img_box; //存放临时数据，用来复用
        [].map.call(document.querySelectorAll(config.el), item => {
          if (item.classList.contains("_img_magnifier_view")) return;
          var autoId = item.dataset.magnifier_index;
          if (
            autoId != null &&
            autoId !== "" &&
            this.AutoIdArr.indexOf(autoId) > -1 &&
            this.Auto_model[autoId]
          ) {
            //复用数据
            this.img_box.push(this.Auto_model[autoId]);
          } else {
            //重新组织数据
            var autoId =
              "magnifier_" +
              Math.random()
                .toString(16)
                .slice(2);
            var currentEleModel = {};
            var image_url = item.getAttribute(
              config.attr && config.attr != "" ? config.attr : "src"
            );
            //判断是否是有效链接
            if (
              !/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i.test(
                image_url
              )
            ) {
              return;
            }
            item.dataset.magnifier_index = autoId;

            currentEleModel.url = image_url;
            currentEleModel.sign = autoId;
            currentEleModel.loaded = false;
            this.img_box.push(currentEleModel);
            this.AutoIdArr.push(autoId);
          }
        });
        var timer = setTimeout(() => {
          this.refreshStyle();
        }, 100);
      });     
      //绑定滑动事件
      this.touch=new AlloyTouch((()=>{
        var box = this.boxDOm;
        Transform(box);
        var currentTranslateX = 0;
        var leftBack_timer;
        //最左侧回退
        function backLeft(){                      
           if(currentTranslateX<=0.5){                     
            if(leftBack_timer) {
              cancelAnimationFrame(leftBack_timer);           
            }
            return;
           }else{            
              box.translateX -= currentTranslateX/2;
              currentTranslateX = box.translateX;
           }
           leftBack_timer=requestAnimationFrame(backLeft);
        }
        //翻页
        var turnItem=(()=>{
          var timer,timer1,NumerDelay=0;
          var current=this;
          function turnLeft(){
            if(NumerDelay<=0.5){   
              //计算当前页数
              current.currentIndex=parseInt(Math.abs(currentTranslateX)/current.winWidth)+1;              
              if(timer) {
                cancelAnimationFrame(timer);           
              }              
              return;
             }else{            
                box.translateX -= NumerDelay/2;
                currentTranslateX=box.transformX;
                NumerDelay -= NumerDelay/2;
             }
             timer=requestAnimationFrame(turnLeft);
          };
          function turnRight(){
            if(NumerDelay<=0.5){  
              current.currentIndex=parseInt(Math.abs(currentTranslateX)/current.winWidth)+1;                   
              if(timer1) {
                cancelAnimationFrame(timer1);           
              }
              return;
             }else{            
                box.translateX += NumerDelay/2;
                currentTranslateX=box.transformX;
                NumerDelay -= NumerDelay/2;
             }
             timer1=requestAnimationFrame(turnRight);
          };
          return (page,over)=>{
            //左翻页
             if(over>=this.winWidth/2){
                NumerDelay=this.winWidth-over;
                turnLeft();
               
             }else{
                NumerDelay=over;
                turnRight();

             }
          }
        })();               
        return {
          touch: box,                      
          touchEnd: ()=> {              
            if(this.currentImg&&this.currentImg.scaleX>1) return;                 
            //最左侧
            if (currentTranslateX >= 100||(currentTranslateX>=0&&currentTranslateX<100)) {
              backLeft();
              this.currentIndex=1;
            }else{
                var over=Math.abs(currentTranslateX)%this.winWidth;
                var count=parseInt(Math.abs(currentTranslateX)/this.winWidth);
                turnItem(count,over);
            }
          },
          pressMove: (evt)=> {             
            if(this.currentImg&&this.currentImg.scaleX>1) return;
            if(Math.abs(evt.deltaX)<=Math.abs(evt.deltaY)) return;                    
             //右滑动
             if(evt.deltaX > 0){
                //判断是否是最左侧了,最多150
                 if(currentTranslateX>=100){
                   return;
                 }               
              //左滑动
             }else if(evt.deltaX<0){
               
                //是否是最右侧
              if(Math.abs(currentTranslateX)>(this.winWidth*(this.img_box.length)-(this.winWidth-100))){
                return;
              }
             }  
             
             box.translateX += evt.deltaX;         
            currentTranslateX = box.translateX;          
          }
        }
      })());
      //注册手势事件
     
      var af = new AlloyFinger(this.boxDOm,(()=>{
        var initScale = 1,currentIndex;
        return { 
          multipointStart:()=>{
             if(this.currentImg){
               initScale=this.currentImg.scaleX;
             }
          },                  
          pinch:  (evt)=> {
            //缓存当前DOM                    
            if(this.currentImg==null||currentIndex!==this.currentIndex){
              [].map.call(document.querySelector("._img_magnifier_box").querySelectorAll("._img_magnifier_view"),(element,index)=>{
                   if(index+1==this.currentIndex){
                     currentIndex=this.currentIndex;
                     this.currentImg=element;
                     Transform(this.currentImg);
                     initScale =this.currentImg.scaleX;
                   }
              })
            }           
            if(this.currentImg){              
               this.currentImg.scaleX = this.currentImg.scaleY = initScale * evt.zoom;
            }
          }       
      }
      })());
    }
    //显示Loading
    showLoading() {
      this.loadingDom.style.display = "block";
    }
    //隐藏Loading
    closeLoading() {
      this.loadingDom.style.display = "none";
    }
    //刷新DOM的样式
    refreshStyle() {   
      if (this.boxDOm == null || this.img_box.length < 1) return;
      this.boxDOm.style.width = window.innerWidth * this.img_box.length + "px";
    }
    //图片容器滚动
    imgWraperSwip(deltaX) {
      this.boxDOm.style.transform = "translate3d(" + deltaX + "px,0,0)";
      this.boxDOm.style.webkitTransform = "translate3d(" + deltaX + "px,0,0)";
      this.transformX = deltaX;
    }
  }
  var a = new Magnifier({attr:"data-src"});
})(window, document);
