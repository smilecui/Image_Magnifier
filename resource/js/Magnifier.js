!function(w,d){
    //兼容性处理requestAnimationFrame
    w.requestAnimationFrame=w.requestAnimationFrame||w.webkitRequestAnimationFrame||function(calllback){return (setTimeout(calllback, 1000/60)) };
    w.cancelAnimationFrame=w.cancelAnimationFrame||w.webkitCancelAnimationFrame||clearTimeout;
    var AddEvent=(function(window, undefined) {        
        var _eventCompat = function(event) {
            var type = event.type;
            if (type == 'DOMMouseScroll' || type == 'mousewheel') {
                event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
            }
            //alert(event.delta);
            if (event.srcElement && !event.target) {
                event.target = event.srcElement;    
            }
            if (!event.preventDefault && event.returnValue !== undefined) {
                event.preventDefault = function() {
                    event.returnValue = false;
                };
            }
            /* 
               ......其他一些兼容性处理 */
            return event;
        };
        if (window.addEventListener) {
            return function(el, type, fn, capture) {
                if (type === "mousewheel" && document.mozFullScreen !== undefined) {
                    type = "DOMMouseScroll";
                }
                el.addEventListener(type, function(event) {
                    fn.call(this, _eventCompat(event));
                }, capture || false);
            }
        } else if (window.attachEvent) {
            return function(el, type, fn, capture) {
                el.attachEvent("on" + type, function(event) {
                    event = event || window.event;
                    fn.call(el, _eventCompat(event));    
                });
            }
        }
        return function() {};    
    })(window);
    __inline("/resource/js/transform.js");
    __inline("/resource/js/AlloyFinger.js");
    __inline("/resource/js/sentinel.min.js");    
    //定义原型对象
    function Magnifier(option){        
            //存储原型数据
            //存储顶端数据
             this.DOM=document.createElement("div");//最外层元素节点             
             this.Magnifier_Img_Class="_img_magnifier_view";//配置放大镜图片类名 
             this.OriginDom_Model={};//原始DOM模型
             this.OriginDom_Arr=[];//原始DOM集合
             this.CurrentModel={};//当前浏览模型            
                        
                //默认的配置
                var defaultOption={
                    el:"img",//所有的img元素
                    attr:"src",//img元素的src属性
                    spaceWidth:100,//设置两边最大滑动距离
                    minScale:0.1,//设置最小缩放率
                    triggerSwipeWidth:window.innerWidth*0.3,//滑动多长的距离触发翻页(默认屏幕的30%)
                    sweelSpeed:0.05,//鼠标滚轮的速率
                };
                //格式化配置               
                if(typeof option=="object"){
                    for(var item in defaultOption){                      
                        defaultOption[item]=option[item]||defaultOption[item];
                    }
                };  
                this.SpaceWidth=defaultOption.spaceWidth;
                this.MinScale=defaultOption.minScale;                
                this.TriggerSwipeWidth=Object.prototype.toString.call(defaultOption.triggerSwipeWidth)=="[object Number]"?defaultOption.triggerSwipeWidth:window.innerWidth*0.3;
                this.SweelSpeed=Object.prototype.toString.call(defaultOption.triggerSwipeWidth)=="[object Number]"?defaultOption.sweelSpeed:0.05;
                //插入DOM元素
                this.DOM.innerHTML=__inline("/resource/template/magnifier.html");
                this.DOM.className="_img_magnifier_wrapper";
                this.ImageBox=this.DOM.querySelector("._img_magnifier_box");//图片容器              
                this.TipDom=this.DOM.querySelector("._img_magnifier_count_tip");//当前页码提示容器
                Transform(this.TipDom);
                this.LoadingDom=this.DOM.querySelector("._img_magnifier_spinner");//loading容器
                Transform(this.ImageBox);      
                var current_evt_deltaX=0,initScale=1;//用来存储滑动距离
                //外层容器手势事件
                this.DOMFinger=new AlloyFinger(this.DOM,{
                    //多个手指触摸屏幕
                    multipointStart:function(){
                        if(this.CurrentModel.Image){
                            initScale=this.CurrentModel.Image.scaleX;
                        }
                    }.bind(this),
                    //缩放事件
                    pinch:function(evt){
                        if(this.CurrentModel==null||(this.CurrentModel&&this.CurrentModel.Error)) return;                  
                        if(this.CurrentModel.Image==null||(this.CurrentModel.Image&&this.CurrentModel.Image.scaleX==null)) return;
                        this.CurrentModel.Image.scaleX=this.CurrentModel.Image.scaleY=initScale*evt.zoom;
                    }.bind(this),
                    //点击事件
                    tap:function(){
                        this.DOM.style.transform="scale(0)";
                        this.DOM.style.webkitTransform="scale(0)";
                        document.querySelector("html").classList.remove("_no_scroll_");
                    }.bind(this),
                    touchMove:function(event){
                        event.preventDefault();
                    },
                    //手指离开
                    touchEnd:function(){                                    
                        var _windth_=window.innerWidth;
                        var translateX=this.ImageBox.translateX;                
                        var _Index_=parseInt(Math.abs(translateX)/_windth_);
                        var _Over_=Math.abs(translateX)%_windth_;                         
                        if(_Over_<5){
                            return;
                        }                        
                        var next_index=(function(){                            
                            //右滑动
                            if(current_evt_deltaX>0){
                                if(_windth_-_Over_>=this.TriggerSwipeWidth){
                                    return _Index_;
                                }else{
                                    return _Index_+1;
                                }
                            }else{
                                if(_Over_>=this.TriggerSwipeWidth){
                                    return _Index_+1;
                                }else{
                                    return _Index_;
                                }
                            }
                        }.bind(this))();
                        if(next_index>=this.OriginDom_Arr.length){
                            next_index=this.OriginDom_Arr.length-1;
                        }
                        //改变当前模型                        
                        setCurrentViewModel.bind(this)(next_index);
                    }.bind(this),
                    //触摸事件
                    touchStart:function(){                       
                        //预加载数据
                         preload.bind(this)(this.CurrentModel?this.CurrentModel.Index:0);
                    }.bind(this),
                    //滑动
                    pressMove:function(evt){                       
                        //存储移动距离
                        current_evt_deltaX=evt.deltaX;
                        if(this.CurrentModel&&this.CurrentModel.Image&&this.CurrentModel.Image.scaleX>1) return;
                        if(Math.abs(evt.deltaX)<=Math.abs(evt.deltaY)) return;                    
                        //右滑动
                         if(evt.deltaX > 0){
                            //判断是否是最左侧了                          
                             if(this.ImageBox.translateX>=this.SpaceWidth){
                               return;
                             }               
                          //左滑动
                         }else if(evt.deltaX<0){                           
                            //是否是最右侧
                          if(Math.abs(this.ImageBox.translateX)>(window.innerWidth*(this.OriginDom_Arr.length)-(window.innerWidth-this.SpaceWidth))){
                            return;
                          }
                         }                        
                         this.ImageBox.translateX += evt.deltaX;                                
                    }.bind(this)
                });
               

                document.body.appendChild(this.DOM);
                //插入样式
                var style=document.createElement("style");
                style.type="text/css";
                style.innerHTML=__inline("/resource/css/magnifier.css")+("._img_magnifier_item"+"{width:"+window.innerWidth+"px}");
                document.head.appendChild(style); 

                //模板字符串
                var TemplateString="";
                //初始化数据
                [].map.call(document.querySelectorAll(defaultOption.el),function(element,index){                               
                    //获取要显示的链接                 
                    var url=element.getAttribute(defaultOption.attr)||"";
                    //判断是否是图片
                    if(!/(png|jpg|jpeg|bmp)/.test(url.match(/\.([^\.]+)$/i)&&url.match(/\.([^\.]+)$/i).length>1?(url.match(/\.([^\.]+)$/i)[1].toLowerCase()):"1234")||element.classList.contains(this.Magnifier_Img_Class)) return;
                   
                    //生成标识符
                    var autoId="_magnifier"+Math.random().toString(16).slice(2);
                    element.dataset._magnifier_identifiers=autoId;

                    TemplateString+="<div class='_img_magnifier_item' data-_magnifier_view='"+autoId+"'></div>";

                    var finger=new AlloyFinger(element,{});
                    //存储原始数据
                    var model={
                        Url:url,//链接
                        Finger:finger,//事件源
                        Index:index,//下标
                        AutoId:autoId,//标识符
                        Element:element,//元素
                        Loaded:false,//是否加载过
                    };
                    
                    this.OriginDom_Model[autoId]=model;
                    this.OriginDom_Arr.push(model);
                    //绑定tap事件
                    finger.on("tap",function(){
                        var clickModel=this.Magnifier.OriginDom_Model[this.DOM.dataset._magnifier_identifiers];
                        show.bind(this.Magnifier)(clickModel);
                    }.bind({DOM:element,Magnifier:this}));
                }.bind(this));

                this.ImageBox.innerHTML=TemplateString;

                //监听动态拼接的元素
                sentinel.on(defaultOption.el,function(el){
                    var url=el.getAttribute(defaultOption.attr)||"";
                    //判断数据是否合法
                    if(!/(png|jpg|jpeg|bmp)/.test(url.match(/\.([^\.]+)$/i)&&url.match(/\.([^\.]+)$/i).length>1?(url.match(/\.([^\.]+)$/i)[1].toLowerCase()):"1234")||el.classList.contains(this.Magnifier_Img_Class)) return;
                    //判断是否是原来的数据
                    var mark=el.dataset._magnifier_identifiers||"";
                    if(mark!=""&&this.OriginDom_Model[mark]) return;

                    //判断是否需要重新排列数据
                    var currentEl_TOP=el.getBoundingClientRect().top||0;
                    var lastetEl_TOP=this.OriginDom_Arr[this.OriginDom_Arr.length-1].Element.getBoundingClientRect().top||10000000;

                                                                                              
                    //不需要重新排列
                    if(currentEl_TOP>=lastetEl_TOP){
                        var finger=new AlloyFinger(element,{});
                          //生成标识符 
                        var autoId="_magnifier"+Math.random().toString(16).slice(2);
                        el.dataset._magnifier_identifiers=autoId;

                        var model={
                           Url:url,//链接
                           Finger:finger,//事件源                      
                           AutoId:autoId,//标识符
                           Element:el,//元素
                           Loaded:false,//是否加载过
                       };
                        //生成新的浏览模型
                        var view_template=document.createElement("div");
                        view_template.className="_img_magnifier_item";
                        view_template.dataset._magnifier_view=autoId;
                        //模型拼接最后面
                        this.ImageBox.appendChild(view_template);

                        //直接缓存数据模型
                        model.Index=this.OriginDom_Arr.length;
                        this.OriginDom_Model[autoId]=model;
                        this.OriginDom_Arr.push(model);

                        //绑定tap事件
                        finger.on("tap",function(){
                            var clickModel=this.Magnifier.OriginDom_Model[this.DOM.dataset._magnifier_identifiers];
                            show.bind(this.Magnifier)(clickModel);
                        }.bind({DOM:el,Magnifier:this}));
                    }else{
                        var temp_Model=JSON.parse(JSON.stringify(this.OriginDom_Model));//存放临时模型
                        //格式化数据模型
                        this.OriginDom_Arr=[];
                        this.OriginDom_Model={};

                        //重新排列数据
                        [].map.call(document.querySelectorAll(defaultOption.el),function(element,index){                               
                            //获取要显示的链接
                            var url=element.getAttribute(defaultOption.attr)||"";
                            //判断是否是图片                            
                            if(!/(png|jpg|jpeg|bmp)/.test(url.match(/\.([^\.]+)$/i)&&url.match(/\.([^\.]+)$/i).length>1?(url.match(/\.([^\.]+)$/i)[1].toLowerCase()):"1234")||element.classList.contains(this.Magnifier_Img_Class)) return;
                            var mark=element.dataset._magnifier_identifiers||"";

                            var model_current={};
                            if(mark!=""&&temp_Model[mark]){                                                            
                                //缓存数据直接拿过来用                                 
                                model_current=temp_Model[mark];                                                          
                                model_current.Index=index;

                                this.OriginDom_Model[model_current.AutoId]=model_current;
                                this.OriginDom_Arr.push(model_current);                               
                            }else{                                
                                var temp_finger=new AlloyFinger(element,{});
                                var autoId="_magnifier"+Math.random().toString(16).slice(2);
                                element.dataset._magnifier_identifiers=autoId;

                                model_current={
                                    Url:url,//链接
                                    Index:index,//下标
                                    Finger:temp_finger,//事件源                      
                                    AutoId:autoId,//标识符
                                    Element:element,//元素
                                    Loaded:false,//是否加载过                                    
                                }
                                this.OriginDom_Model[model_current.AutoId]=model_current;
                                this.OriginDom_Arr.push(model_current);  
                                //绑定点击事件
                                temp_finger.on("tap",function(){                                  
                                    var clickModel=this.Magnifier.OriginDom_Model[this.DOM.dataset._magnifier_identifiers];
                                    show.bind(this.Magnifier)(clickModel);
                                }.bind({DOM:element,Magnifier:this}));
                            }
                                                                                                                              
                        }.bind(this));

                        //重新排列浏览模型
                        this.OriginDom_Arr.map(function(item,index){
                           
                            var viewDom=this.ImageBox.querySelector("._img_magnifier_item[data-_magnifier_view='"+item.AutoId+"']");
                            //拼接浏览模型
                            if(viewDom==null){
                                 //生成新的浏览模型
                                var view_template=document.createElement("div");
                                view_template.className="_img_magnifier_item";
                                view_template.dataset._magnifier_view=item.AutoId;
                                //插入最前面
                                if(index<1){
                                    this.ImageBox.insertBefore(view_template, this.ImageBox.firstChild);
                                }else{
                                    //插入前面或者后面
                                    var insert_autoId=this.OriginDom_Arr[index-1].AutoId||Math.random().toString(16).splice(2);
                                    var insertDom=this.ImageBox.querySelector("._img_magnifier_item[data-_magnifier_view='"+insert_autoId+"']");
                                    //查找前面一个元素节点
                                    if(insertDom&&insertDom.parentNode&&insertDom.nextSibling){
                                        insertDom.parentNode.insertBefore(view_template,insertDom.nextSibling);
                                    }else{
                                        //如果没有找到直接插入最后面
                                        this.ImageBox.appendChild(view_template);
                                    }
                                }
                            }
                            
                        }.bind(this));
                        console.log(this.OriginDom_Model); 
                    }                                         
                }.bind(this));
                
                //显示               
                function show(currentModel){                                     
                    if(currentModel==null) return;
                    this.DOM.style.transform="scale(1)";
                    this.DOM.style.webkitTransform="scale(1)";
                    //不让全局滚动
                    document.querySelector("html").classList.add("_no_scroll_");

                    setCurrentViewModel.bind(this)(currentModel.Index);
                    
                }

                //改变当前浏览模型
                function setCurrentViewModel(index){                                                               
                    if(Object.prototype.toString.call(index)!="[object Number]") return;
                    if(index<0||index>=this.OriginDom_Arr.length) return;
                    //改变文字提示第几项
                    this.TipDom.innerText=index+1+"/"+this.OriginDom_Arr.length;
                    //还原上一项图片的样式
                    var beforeDomModel=this.CurrentModel;
                    if(beforeDomModel.Image&&beforeDomModel.Image.scaleX){
                        beforeDomModel.Image.scaleX=beforeDomModel.Image.scaleY=1;
                    }  
                    this.ImageBox.style.width=this.OriginDom_Arr.length*window.innerWidth+"px";
                    this.CurrentModel=this.OriginDom_Arr[index]||{};                    
                    //判断当前项目是否加载过
                    if(this.CurrentModel.Loaded){
                        //隐藏loading
                        this.LoadingDom.style.display="none";
                    }else{
                        //显示loading
                        this.LoadingDom.style.display="block";
                        //没有存放过图片
                        if(this.CurrentModel.Image==null){
                            var _img_=document.createElement("img"); 
                            _img_.className=this.Magnifier_Img_Class;                         
                            Transform(_img_);
                            //存放原始数据源
                            this.OriginDom_Model[this.CurrentModel.AutoId].Image=this.OriginDom_Arr[this.CurrentModel.Index].Image=_img_;
                            //图片手势事件源
                            this.OriginDom_Model[this.CurrentModel.AutoId].ImageFinger=this.OriginDom_Arr[this.CurrentModel.Index].ImageFinger=new AlloyFinger(_img_,{

                            });
                            

                            var _image_=new Image();
                            _img_.src=this.CurrentModel.Url;
                            _image_.src=this.CurrentModel.Url;
                            _image_.onload=_image_.onerror=function(Event){   
                                if(Event.type=="error"){
                                    this.OriginDom_Model[this.CurrentModel.AutoId].Error=this.OriginDom_Arr[this.CurrentModel.Index].Error=this.CurrentModel.Error=true;
                                }
                                //隐藏loading
                                this.LoadingDom.style.display="none";
                                //设置属性
                                this.OriginDom_Model[this.CurrentModel.AutoId].Loaded=this.OriginDom_Arr[this.CurrentModel.Index].Loaded=this.CurrentModel.Loaded=true;                                
                                //填充数据
                                var parent_dom=this.ImageBox.querySelector("._img_magnifier_item[data-_magnifier_view='"+this.CurrentModel.AutoId+"']");
                                if(parent_dom) parent_dom.appendChild(_img_);
                            }.bind(this);
                        }else{
                            //存放了,但是没有加载完成
                            var _image_=new Image();                       
                            _image_.src=this.CurrentModel.Url;
                            _image_.onload=_image_.onerror=function(Event){
                                if(Event.type=="error"){
                                    this.OriginDom_Model[this.CurrentModel.AutoId].Error=this.OriginDom_Arr[this.CurrentModel.Index].Error=this.CurrentModel.Error=true;
                                }
                                //隐藏loading
                                this.LoadingDom.style.display="none";
                                //设置属性
                                this.OriginDom_Model[this.CurrentModel.AutoId].Loaded=this.OriginDom_Arr[this.CurrentModel.Index].Loaded=this.CurrentModel.Loaded=true;                              
                            }.bind(this);
                        }
                    }

                    //重新设置当前模型，因为有可能Imageyi以及相关属性为null
                    this.CurrentModel=this.OriginDom_Arr[index]||{}; 

                    //判断是初始化显示还是滑动显示
                    var currentOver=Math.abs(this.DOM.translateX||0)%window.innerWidth;
                    var IntNumer=parseInt(Math.abs(this.DOM.translateX||0)/window.innerWidth);
                    //初始化显示的时候
                    if(currentOver<=5){                                              
                        this.ImageBox.translateX=index==0?0:(-index*window.innerWidth);
                    }else{

                    }                                       
                   
                    //预加载数据
                    preload.bind(this)(index);
                }

                //隐藏
                function hide(){
                    this.DOM.scaleX=this.DOM.scaleY=0;
                }

                //预加载
                function preload(index){                   
                    //传入当前页数预加载上一页或者下一页
                    if(Object.prototype.toString.call(index)!="[object Number]") return;
                    var Previous_Model=index-1>-1&&index-1<this.OriginDom_Arr.length?(this.OriginDom_Arr[index-1]):null;
                    var Next_Model=index+1>-1&&index+1<this.OriginDom_Arr.length?(this.OriginDom_Arr[index+1]):null;                    
                    load.bind(this)(Previous_Model);
                    load.bind(this)(Next_Model);
                    //load载入数据
                    function load(model){
                        if(Object.prototype.toString.call(model)!="[object Object]") return;
                        if(model.Loaded) return;//已经加载过

                        //没有存放过图片
                        if(model.Image==null){
                            var _img_=document.createElement("img");
                            _img_.className=this.Magnifier_Img_Class;
                            Transform(_img_)
                            //存放原始数据源
                            this.OriginDom_Model[model.AutoId].Image=this.OriginDom_Arr[model.Index].Image=_img_;                            
                            //图片手势事件源
                            this.OriginDom_Model[model.AutoId].ImageFinger=this.OriginDom_Arr[model.Index].ImageFinger=new AlloyFinger(_img_,{
                                
                            });
                            var _image_=new Image();
                            _img_.src=model.Url;
                            _image_.src=model.Url;
                            _image_.onload=_image_.onerror=function(Event){
                                if(Event.type=="error"){
                                    this.OriginDom_Model[this.CurrentModel.AutoId].Error=this.OriginDom_Arr[this.CurrentModel.Index].Error=true;
                                }
                                //隐藏loading
                                this.LoadingDom.style.display="none";
                                //设置属性
                                this.OriginDom_Model[this.CurrentModel.AutoId].Loaded=this.OriginDom_Arr[model.Index].Loaded=true;
                                //填充数据
                                var parent_dom=this.ImageBox.querySelector("._img_magnifier_item[data-_magnifier_view='"+model.AutoId+"']");
                                if(parent_dom) parent_dom.appendChild(_img_);
                            }.bind(this);
                        }else{
                            //存放了,但是没有加载完成
                            var _image_=new Image();                          
                            _image_.src=model.Url;
                            _image_.onload=_image_.onerror=function(Event){ 
                                if(Event.type=="error"){
                                    this.OriginDom_Model[this.CurrentModel.AutoId].Error=this.OriginDom_Arr[this.CurrentModel.Index].Error=true;
                                }                               
                                //隐藏loading
                                this.LoadingDom.style.display="none";
                                //设置属性
                                this.OriginDom_Model[model.AutoId].Loaded=this.OriginDom_Arr[model.Index].Loaded=true;                              
                            }.bind(this);
                        }
                    }                                          
                }

                //滚轮事件
                AddEvent(this.DOM,"mousewheel",function(event){ 
                                                     
                    if(this.CurrentModel==null||(this.CurrentModel&&this.CurrentModel.Error)) return;                  
                    if(this.CurrentModel.Image==null||(this.CurrentModel.Image&&this.CurrentModel.Image.scaleX==null)) return;
                    //缩小 
                    if(event.delta<0){
                        //达到最小缩放
                        if(this.CurrentModel.Image.scaleX<=this.MinScale) return;
                        this.CurrentModel.Image.scaleX=this.CurrentModel.Image.scaleY=this.CurrentModel.Image.scaleX-this.SweelSpeed;
                    }else if(event.delta>0){

                        //放大
                        this.CurrentModel.Image.scaleX=this.CurrentModel.Image.scaleY=this.CurrentModel.Image.scaleX+this.SweelSpeed;
                    }
                }.bind(this));
    }    
    new Magnifier({      
      
    });
}(window,document);