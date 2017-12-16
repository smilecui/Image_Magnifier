!(function(w, d) {
  require("/resource/js/sentinel.min.js");
  require("/resource/js/alloy-finger.js")
  class Magnifier {
    constructor(config) {
      this.AutoIdArr = []; //存放随机码
      this.img_box = [];
      this.Auto_model = {}; //存放autoId对应的模型

      if (Object.prototype.toString.call(config) !== "[object Object]") {
        return;
      }
      //没有传el就默认为所有的img
      config.el = config.el || "img";
      this.option = config;
      document.body.insertAdjacentHTML(
        "afterbegin",
        __inline("/resource/template/magnifier.html")
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
       var timer=setTimeout(() => {
          this.refreshStyle();
        
        }, (100));      
      });
      //绑定滑动事件
      new AlloyFinger(document.querySelector("._img_magnifier_wrapper"), (     
      ()=>{
        var deltaX=0;
        return{ 
          multipointEnd: function () {
              
          },      
          pressMove:  (evt)=> {
              //evt.deltaX和evt.deltaY代表在屏幕上移动的距离
              deltaX=evt.deltaX;
             this.imgWraperSwip(deltaX);
          },       
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
      console.log(this.img_box);
      if (this.boxDOm == null || this.img_box.length < 1) return;
      this.boxDOm.style.width = window.innerWidth * this.img_box.length + "px";
    }
    //图片容器滚动
    imgWraperSwip(deltaX){           
        this.boxDOm.style.transform="translate3d("+deltaX+"px,0,0)";
        this.boxDOm.style.webkitTransform="translate3d("+deltaX+"px,0,0)";
        this.transformX=deltaX;
    }
  }
  var a = new Magnifier({});
})(window, document);
