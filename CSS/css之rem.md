## css-rem

在移动端飞速发展的当下，移动端页面的适配越来越成了大家所关注的问题，当我们把PC端的`px`拿到移动端，发现越来越不适用，媒体查询实在是太繁琐了。进而出现了`em、rem、vw`等单位来帮助我们实现移动端的自适应布局。

在`W3C`规范中，对于`1rem`的定义时

> 1rem 与等于根元素 `font-size` 的计算值。当明确规定根元素的 `font-size` 时，rem 单位以该属性的初始值作参照。

由此看出，`rem`是和`html`元素的字体大小相匹配的。当然我们在很多时候实现`rem`自适应是，也都是在`style`中插入`html`的`font-size`来制定参照值的。

#### rem和像素值的关系

那么问题就来了，我们知道了`rem`是和`font-size`相关的单位，而且我们也知道最终页面上的计量单位一定也是像素(`px`)，那么他们俩的关系又是什么样的呢？其实当我们使用`rem`时，每rem转换为多少像素，取决于`html`字体大小，即`html`字体大小乘以`rem`的值。例如，如果根元素的字体为`14px`，`10rem`就为`140px`

#### html font-size如何计算

我们知道了rem和像素值的关系，那么我们该把`html`的`font-size`设置成多少呢？因为移动端的显示屏比例错综复杂，我们是需要根据不同的屏幕设置不同的根节点字体大小的，以下我们提供两种方式

* 第一种是通过JS（推荐）

  ```javascript
  (function (doc, win) {
          var docEl = doc.documentElement,
              resizeEvt = 'onorientationchange' in window ? 'onorientationchange' : 'resize',
              recalc = function () {
                  var clientWidth = docEl.clientWidth;
                  if (!clientWidth) return;
                  if(clientWidth>=750){
                      docEl.style.fontSize = '100px';
                  }else{
                      docEl.style.fontSize = 100 * (clientWidth / 750) + 'px';
                  }
              };

          if (!doc.addEventListener) return;
          win.addEventListener(resizeEvt, recalc, false);
          doc.addEventListener('DOMContentLoaded', recalc, false);
      })(document, window);
  ```

* 媒体查询（不推荐）

  ```css
  html {
             font-size : 20px;
      }
      @media only screen and (min-width: 401px){
          html {
              font-size: 25px !important;
          }
      }
      @media only screen and (min-width: 428px){
          html {
              font-size: 26.75px !important;
          }
      }
      @media only screen and (min-width: 481px){
          html {
              font-size: 30px !important; 
          }
      }
      @media only screen and (min-width: 569px){
          html {
              font-size: 35px !important; 
          }
      }
      @media only screen and (min-width: 641px){
          html {
              font-size: 40px !important; 
          }
      }
  ```

以上~