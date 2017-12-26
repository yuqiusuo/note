## CSS BEM 命名简介

1. BEM是一种CSS命名规范，旨在使用严格的命名约定，使得CSS类的命名更加透明，能直接了解上下文含义。BEM分别代表块（Block）、元素（Element）、修饰符（Modifier）。

   * 页面由多个[ 块 ]构成
   * [ 元素 ]是[ 块 ]的组成部分，他们是上下层级的关系
   * [ 修饰符 ]表示[ 块 ]或[ 元素 ]某一种状态或修饰
   * [ 元素 ]用双下划线表示，如`.block__element {...}`
   * [ 修饰符 ]用双中划线表示，如`.block--modifier {...}`
   * 可以用中划线链接前缀与块，如`js-block {...}`
     * 关于前缀，通常有这些：`l-`表示布局相关的元素、`c-`表示组件、`u-`表示工具类、`js-`表示JS需要获取的元素，不会出现在CSS样式文件中

2. 命名的基本原则

   * CSS中只能使用类名

   * 每一个块名应该有一个命名空间（前缀）

   * 每一天CSS规则必须属于一个块

   * 一个块中元素的类名必须用父级块的名称作为前缀

     ```css
     // 普通CSS
     .list{}
     .list .item{}

     // BEM
     .list {}
     .list__item{}
     ```

3. 书写原则

   * 原则上不会出现**两层以上**选择器嵌套，用命名代替CSS嵌套的复杂性

   * 两层选择器嵌套出现在出现子元素的情况，示例

     ```html
     <ul class="xxx">
         <li class="xxx__item">第一项
             <div class="xxx__product-name">我是名称</div>
             <span class="xxx__ming-zi-ke-yi-hen-chang">看类名</span>
             <a href="#" class="xxx__link">我是link</a>
         <li>
         <li class="xxx__item xxx__item_current">第二项 且 当前选择项
             <div class="xxx__product-name">我是名称</div>
             <a href="#" class="xxx__item-link">我是link</a>
         <li>
         <li class="xxx__item xxx__item_hightlight">第三项 且 特殊高亮
              <div class="xxx__product-name">我是名称</div>
             <a href="#" class="xxx__item-link">我是link</a>
         <li>
     </ul>
     ```

     ```scss
     .xxx{}
     .xxx__item{}
     .xxx__item_hightlight{}
     .xxx__product-name{}
     .xxx__link{}
     .xxx__ming-zi-ke-yi-hen-chang{}

     // 嵌套写法
     .xxx__item_current{
         .xxx__link{}
     }
     ```



参考：

* [[规范] CSS BEM 书写规范](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%9B-%5B%E8%A7%84%E8%8C%83%5D--CSS-BEM-%E4%B9%A6%E5%86%99%E8%A7%84%E8%8C%83)
* [BEM —— 一种 CSS 命名方式](https://github.com/FrankFang/githublog/blob/master/%E6%8A%80%E6%9C%AF/BEMCSS.md)

