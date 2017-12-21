## nodejs开发指南

#### Node.js简介

1. 简介：Node.js是一个为实时Web应用开发而诞生的平台，从诞生之初就充分考虑了实时响应、超大规模数据要求下架构的扩展性。

2. 特点：单线程、异步式I/O、事件驱动式的程序设计模型

3. 部分实现遵循了[CommomJS规范](http://javascript.ruanyifeng.com/nodejs/module.html)

4. Node.js能做什么：

   * 具有复杂逻辑的网站
   * 基于社交网络的大规模Web应用
   * Web Socket服务器
   * TCP/UDP套接字应用程序
   * 命令行工具
   * 交互式终端程序
   * 带有图形用户界面的本地应用程序
   * 单元测试工具
   * 客户端JavaScript编译器

5. 最大的特点就是采用异步式I/O与事件驱动的架构设计，使用单线程模型，对于所有I/O都采用异步式的请求方式，避免了频繁的上下文切换

6. 采用**回调函数**等待结果返回

7. Node.js的异步机制是基于事件的

8. 弊端：

   * 不符合开发者的常规线性思路，往往需要把一个完整的逻辑拆分为一个个事件，增加了开发和调试难度

9. 阻塞：线程在执行过程中如果遇到磁盘读写或者网络通信(统称I/O操作)，通常要耗费较长的事件，这时操作系统会剥夺这个线程的CPU控制权，使其暂停执行，同时将资源让给其他的工作线程，这种线程调度方式成为**阻塞**

10. 单线程事件驱动的异步式I/O比传统的多线程阻塞式I/O好在少了多线程的开销

  | 同步式I/O(阻塞式)         | 异步式I/O(非阻塞式)   |
  | :------------------ | -------------- |
  | 利用多线程提供吞吐量          | 单线程即可实现高吞吐量    |
  | 通过事件片分割和线程调度利用多核CPU | 通过功能划分利用多核CPU  |
  | 需要由操作系统调度多线程使用多核CPU | 可以将单进程绑定到单核CPU |
  | 难以充分利用CPU资源         | 可以充分利用CPU资源    |
  | 内存轨迹大，数据局部性弱        | 内存轨迹小，数据局部性强   |
  | 符合线性的编程思维           | 不符合传统编程思维      |

11. Node.js不鼓励使用同步I/O

12. Node.js程序由事件循环开始，到时间循环结束，所有的逻辑都是事件的回调函数

13. 模块(Module)和包(Package)是Node.js最重要的支柱

14. 模块是Node.js应用程序的基本组成部分，文件和模块是一一对应的，一个Node.js文件就是一个模块

15. 包是在模块基础上更深一步的抽象

16. 他将某个独立的功能封装起来，用于发布、更新、依赖管理和版本控制

17. 包应该具备以下特征：

    * package.json必须在包的顶层目录下
    * 二进制文件应该在bin目录下
    * Javascript代码应该在lib目录下
    * 文档应该在doc目录下
    * 单元测试应该在test目录下

18. package.json字段：

    * name : 包的名称，必须是唯一的，由小写英文字母、数字和下划线组成，不能包含空格
    * description : 包的简要说明
    * version : 符合语义化版本识别规范的版本字符串
    * keywords : 关键字数组，通常用于搜索
    * maintainers : 维护者数组，每个元素要包含name、email(可选)、web(可选)字段
    * contributors : 贡献者数组，格式与maintainers 相同。包的作者应该是贡献者数组的第一个元素
    * bugs : 提交bug的地址，可以是网址或者电子邮件地址
    * licenses : 许可证数组，每个元素要包含type(许可证名称)和url(连接到许可证文本的地址)
    * repositories : 仓库托管地址数组，每个元素要包含type(仓库的类型，如git)、url(仓库的地址)和path(相对于仓库的路径，可选)字段
    * dependencies : 包的依赖，一个关联数组，由包名称和版本号组成



#### Node.js 核心模块

* 全局对象
* 常用工具
* 事件机制
* 文件访问系统
* HTTP服务器与客户端

1. 全局对象(global) : 它及所有属性都可以在程序的任何地方访问

2. 全局变量 : 

   * 在最外层定义的变量

   * 全局对象的属性

   * 隐式定义的变量(未定义直接赋值的变量)

     tips : 

   * 永远使用var定义变量以避免引入全局变量，因为全局变量会污染命名空间，提高代码的耦合风险

   1. process : 用于描述当前Node.js进程状态的对象，提供了一个与操作系统的简单接口*
      * process.argv : 命令行参数数组
      * process.stdout : 标准输出流
      * process.stdin : 标准输入流
      * process.nextTick(callback) : 为事件循环设置一项任务
   2. console : 用于提供控制台标准输出

3. util : 提供常用函数的集合

   * util.inherits(constructor, superConstructor) : 一个思想对象间原型继承的函数
   * util.inspect(object, [showHidden], [depth], [colors]) : 一个将任意对象转换为字符串的方法，通常用于调试和错误输出

4. events : 事件驱动

   1. events.EventEmitter : 事件发射与事件监听器功能的封装
      * EventEmitter.on(event, listener) : 为指定事件注册一个监听器，接受一个字符串event和一个回调函数listener
      * EventEmitter.emit(event, [arg1], [arg2], [...]) : 发射event事件，传递若干可选参数到事件监听器的参数表
      * EventEmitter.once(event, listener) : 为指定事件注册一个单次监听器，即监听器最多只会触发一次，触发后立刻接触该监听器
      * EventEmitter.removeListener(event, listener) : 移除指定事件的某个监听器，listener必须是该事件已经注册过的监听器
   2. error事件
   3. 继承EventEmitter : 大多数时候我们不会直接使用EventEmitter，而是在对象中继承它。包括fs、net、http

5. 文件系统fs

   1. fs.readFile(filename, [encoding], [callback(err, data)])
   2. fs.readFileSync(filename, [encoding])
   3. fs.open(path, flags, [mode], [callback(err, fd)])
   4. fs.read(fd, buffer, offset, length, position, [callback(err, bytesRead, buffer)])
      * 一般来说，除非必要，否则不要使用这种方式读取文件

6. HTTP服务器与客户端

   * Node.js标准库提供了http模块，其中封装了一个高效的HTTP服务器和一个简易的HTTP客户端

   1. http.Server是http模块中的HTTP服务器对象

   2. http.Server的事件

      * request : 当客户端请求到来时，该事件触发，提供两个参数req和res，分别是http.ServerRequest和http.ServerResponse的实例，表示请求和响应信息
      * connection : 当TCP连接建立时，该事件被触发，提供一个参数socket，为net.Socket的实例
      * close : 当服务器关闭时，该事件被触发

   3. http.ServerRequest : HTTP请求的信息

      * data : 当请求体数据到来时，该事件被触发。该事件提供一个参数chunk，表示接收到的数据
      * end : 当请求体数据传输完成时，该事件被触发，伺候不会再有数据到来
      * close : 用户当前请求结束时，该事件被触发

   4. http.ServerResponse : 返回给客户端的信息

      * response.writeHead(statusCode, [headers]) : 向请求的客户端发送响应头
      * respinse.write(data, [encoding]) : 向请求的客户端发送响应内容
      * response.end([data], [encoding]) : 响应结束，告知客户端所有发送已经完成

   5. HTTP客户端

      * http模块提供了`http.request`和`http.get`，作为客户端向HTTP服务器发起请求

      1. http.request(options, callback)，options : 

         * host : 请求网站的域名或IP地址
         * port : 请求网站的端口，默认80
         * method : 请求方法，默认GET
         * path : 请求的相对于根的路径，默认'/'
         * headers : 一个关联数组对象，为请求头的内容

      2. http.get(options, callback) : 简化便方法处理GET请求

      3. http.ClientRequest : 由`http.request`和`http.get`返回产生的对象，表示一个已经产生且正在进行中的HTTP请求

      4. http.ClientResponse : 提供了三个事件`data`、`end`和`close`

         ClientResponse的属性

         | 名称          | 含义                   |
         | ----------- | -------------------- |
         | statusCode  | HTTP状态码，如200/404/500 |
         | httpVersion | HTTP协议版本，通常是1.0或1.1  |
         | headers     | HTTP请求头              |
         | trailers    | HTTP请求尾              |

      5. response.setEncoding([encoding]) : 设置默认的编码，当data事件被触发时，数据将会以encoding编码，默认值null

      6. response.pause() : 暂停接收数据和发送事件。方便实现下载功能

      7. response.resume() : 从暂停的状态中恢复



#### Node.js 开发

1. Web开发架构对比

   | 特性     | 模板为中心架构           | MVC架构             |
   | ------ | ----------------- | ----------------- |
   | 页面产生方式 | 执行并替换标签中的语句       | 由模板引擎生成HTML页面     |
   | 路径解析   | 对应到文件系统           | 由控制器定义            |
   | 数据访问   | 通过SQL语句查询或访问文件系统  | 对象关系模型            |
   | 架构中心   | 脚本语言是静态HTTP服务器的扩展 | 静态HTTP服务器是脚本语言的补充 |
   | 适用范围   | 小规模网站             | 大规模网站             |
   | 学习难度   | 容易                | 较难                |

2. REST : 表征状态转移，他是一种基于HTTP协议的网络应用的接口风格，充分利用HTTP的方法实现统一风格接口的服务

   * GET : 请求获取指定资源（常用，获取）
   * HEAD : 请求指定资源的响应头
   * POST : 向指定资源提交数据（常用，新增）
   * PUT : 请求服务器存储一个资源（常用，更新）
   * DELETE : 请求服务器删除指定资源（常用，删除）
   * TRACE : 回显服务器收到的请求，主要用于测试或诊断
   * CONNECT : HTTP/1.1协议中预留给能够将连接改为管道方式的代理服务器
   * OPTIONS : 返回服务器支持的HTTP请求方法 

3. 幂等 : 重复请求多次与一次请求的效果是一样的

   | 请求方式   | 安全   | 幂等   |
   | ------ | ---- | ---- |
   | GET    | 是    | 是    |
   | POST   | 否    | 否    |
   | PUT    | 否    | 是    |
   | DELETE | 否    | 是    |

   * 安全 : 指没有附作用，即请求不会对资源产生变动，连续多次访问所获得的结果不受访问者影响

4. 当你访问任何被上面两条同样的规则匹配到的路径时，会发现请求总是被前一条路由规则捕获，后面的规则会被忽略，Express提供了路由控制权转移的方法，即回调函数的第三个参数next

5. 模板引擎 : 一个从页面模板根据一定的规则生成HTML的工具

   问题 : 

   * 页面功能逻辑与页面布局样式耦合，网站规模变大以后逐渐难以维护
   * 语法复杂，对于非技术的网页设计者来说门槛较高，难以学习
   * 功能过于全面，页面设计者可以在页面上编程，不利于功能划分，也使模板解析效率降低

#### Node.js 进阶

* 模块加载机制
* 异步编程模式下的控制流
* Node.js 应用部署
* Node.js 的一些劣势

1. Node.js的模块可以分为两大类 : 核心模块（fs、http、net、vm等），文件模块（JS代码、JSON等）
2. Node.js不会被重复加载，这是因为Node.js通过文件名缓存所有加载过得文件模块
3. Node.js应用部署缺陷 : 
   * 不支持故障恢复
   * 没有日志
   * 无法利用多核提高性能
   * 独占端口
   * 需要手动启动
4. Node.js不适合做什么 : 
   * 计算密集型程序
   * 单用户多任务型应用
   * 逻辑十分复杂的事务
   * Unicode与国际化