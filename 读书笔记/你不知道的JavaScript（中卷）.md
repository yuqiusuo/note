## 你不知道的JavaScript（中卷）

#### 一、类型

* JS内置其中类型：null、undefined、boolean、number、string、object、symbol

* 除对象之外，其他统称为基本类型

* ```javascript
  typeof null === "object";	// true
  // 如何检测null
  var a = null;
  (!a && typeof a === "object");	// true
  ```

* 变量是没有类型的，只有值才有。类型定义了值的行为特征。

* 在对变量执行typeof操作时，得到的结果并不是该变量的类型，而是该变量持有的值的类型，因为JS中变量没有类型

  ```javascript
  var a = 42;
  typeof a;	// "number"

  a = true;
  typeof a; 	// "boolean"
  ```

* 在JS中，undefined和undeclared是两码事。undefined是值的一种，undeclared表示变量还没有被声明过。我们在试图访问"undeclared"变量时这样报错：ReferenceError: a is not defined，并且typeof对undefined和undeclared变量都返回"undefined"

* 通过"typeof"的安全防范机制（阻止报错）来检查undeclared变量，有时是个不错的办法

  ​

#### 二、值

* JS中的数组是通过数字索引的一组任意类型的值。字符串和数组类似，但是他们的行为特征不同，在将字符作为数组来处理时需要特别小心。
* JS中的数字包括"整数"和"浮点数"
* null类型只有一个值null，undefined类型也只有一个值undefined。所有变量在赋值之前默认值都是undefined。void运算符返回undefined。
* 数字类型有几个特殊值，包括NaN、+Infinity、-Infinity和-0
* 简单标量基本类型值（字符串和数字等）通过值复制来赋值/传递，而复合值（对象等）通过引用复制来赋值/传递。JS中的引用和其他语言中的引用/指针不同，他们不能指向别的变量/引用，只能指向值。



#### 三、原生函数

* 常用的原生函数：
  * String()
  * Number()
  * Boolean()
  * Array()
  * Object()
  * Function()
  * RegExp()
  * Date()
  * Error()
  * Symbol()



#### 四、强制类型转换

* 将值从一种类型转换为另一种类型通常称为类型转换，这是显式的情况；隐式的情况称为强制类型转换。

* 类型转换发生在静态类型语言的编译阶段，而强制类型转换则发生在动态类型语言的运行时

  ```javascript
  var a = 42;
  var b = a + "";	// 隐式强制类型转换
  var c = String(a);	// 显式强制类型转换
  ```

* JSON.stringify(...)并不是强制类型转换。

  * 字符串、数字、布尔值和null的JSON.stringify(...)规则与ToString基本相同
  * 如果传递给JSON.stringify(...)的对象中定义了toJSON()方法，那么该方法会在字符串化前调用，以便将对象转换为安全的JSON值

* JS中的值可以分为以下两类：

  * 可以被强制类型转换为false的值（undefined/null/false/+0/-0/NaN/""）
  * 其他（被强制类型转换为true的值）

* ES5 Date提供了新方法：`Date.now()`

  ```javascript
  // Date.now() polyfill
  if(!Date.now){
    Date.now = function(){
      return +new Date();
    }
  }
  ```

* `>= 0`和`== -1`这样的写法不是很好，称为抽象渗漏，意思是在代码中暴露了底层的实现细节，这里是指用-1作为失败时的返回值，这些细节应该被屏蔽掉

  ```javascript
  var a = "hello";

  // bad
  if(a.indexOf('lo')){
    	console.log(true);
  }	// true

  if(a.indexOf('ol')){
    	console.log(false);
  }	// false

  // good
  if(~a.indexOf("lo")){
    	console.log(true);
  }	// true

  if(!a.indexOf("ol")){
    	console.log(false);
  }	// false

  ```

* ~~可以用来截除数字值的小数部分，第一个~执行ToInt并翻转字位，然后第二个~再一次反转字位，即将所有字位翻转回原值，最后得到的仍然是ToInt的结果

  * 只适用于32位数字
  * 对负数的处理和Math.floor()不同

  ```javascript
  Math.floor(-49.6);	// -50
  ~~-49.6	// -49
  ```

* 数字字符串的解析和转换有明显的区别。解析允许字符串中含有非数字字符，解析按从左到右的顺序，如果遇到非数字字符就停止。而转换不允许出现非数字字符，否则会失败并返回NaN

  ```javascript
  var a = "42";
  var b = "42px";

  Number(a);	// 42
  parseInt(a);	// 42

  Number(b);	// NaN
  parseInt(b);	// 42
  ```

* &&和||运算符返回值并不一定是布尔类型，而是两个操作数其中一个的值

  * ||和&&首先会对第一个操作数执行条件判断。如果其不是布尔值就先进行`ToBoolean`强制类型转换，然后再执行条件判断；

  * 对于||来说，如果条件判断结果为true就返回第一个操作数的值，如果为false就返回第二个操作数的值

  * 对于&&来说，如果条件判断为true就返回第二个操作数的值，如果为false就返回第一个操作数的值

    ```javascript
    var a = 42,
        b = "abc",
        c = null;

    a || b;	// 42
    a && b;	// "abc"

    c || b;	// "abc"
    c && b;	// null

    // && 特殊使用场景
    function foo() {
        console.log(a);
    }

    var a = 42;
    a && foo();	// 42
    ```

* ==允许在相等比较中进行强制类型转换，而===不允许（他俩不存在性能差距问题）。

  * NaN不等于NaN，+0等于-0；

  * ```javascript
    var a = "42";
    var b = true;
    var c = false;

    a == b;	// false
    a == c;	// false

    // 如果b是布尔类型，返回ToNumber(b) == a的结果，变成 1 == 42，所以是false，同理0 == 42；
    ```

  * 建议无论什么情况下都不要使用 == true 和 == false；

    ```javascript
    var a == "42";

    // 建议方法
    if(!!a) {
        // ...
    }
    ```

  * ```javascript
    var a = null;
    var b;

    a == b;	// true
    a == null; 	// true
    b == null;	// true

    a == false;	// false
    b == false;	// false
    a == "";	// false
    b == "";	// false
    a == 0;		// false
    b == 0;		// false
    ```


#### 五、语法

* 语句和表达式

  * 语句都有一个结果值；
  * 不要使用`eval`；
  * `var a = b = 42;`不会对变量b进行声明；
  * 注意让代码更简洁；

* 运算符优先级

  * `&&`优先级高于`||`；

* 自动分号

  * 只在换行符处起作用，不会在代码行的中间插入分号
  * 应当在需要的地方加上分号，不要省略

* 错误

  * 变量应该先被初始化

  * ES6中，对于参数默认值而言，参数被省略或者被赋值为undefined效果都一样，都是取该参数的默认值，但是某些情况下，他们之间会有区别的：

    ```javascript
    function foo( a = 42, b = a + 1 ) {
        console.log(
        	arguments.length, a, b, arguments[0], arguments[1]
        );
    }

    foo();				// 0 42 43 undefined undefined
    foo(10);			// 1 10 11 10 undefined
    foo(10, undefined);	// 2 10 11 10 undefined
    foo(10, null);		// 2 10 null 10 null
    ```

* try...finally

  * finally中的代码总会在try之后执行，如果有catch的话，则在catch之后执行。可以将finally中的代码看做一个回调函数，无论出现什么情况一定会被调用；

  * 如果finally中抛出异常，函数就会在此处终止；

  * finally中的return会覆盖try和catch中return的返回值

    ```javascript
    function foo() {
        try{
    		return 42;
        } finally {
          	// 没有返回语句，所以没有覆盖
        }
    }

    function bar() {
        try {
    		return 42;
        } finally {
          	return;	// 覆盖前面的return 42;
        }
    }

    function baz() {
        try {
          	return 42;
        } finally {
          	return "hello";	// 覆盖前面的return 42;
        }
    }

    foo();	// 42
    bar();	// undefined
    baz();	// hello
    ```

* ​

  * switch语句中，case表达式与变量的匹配算法与===相同；

  * switch中true和true之间仍然是严格相等比较。即如果case表达式的结果为真值，但不是严格意义上的true，则条件不成立。

    ```javascript
    var a = "hello world";
    var b = 10;

    switch (true) {
      	case (a || b == 10):
        	break;	// 永远执行不到这里
        defaule: 
        	console.log('Oops');
    }	// Oops
    // 因为(a || b == 10)的结果是"hello world"而非true，所以严格相等比较不成立
    ```

  * arguments和arguments.caller均已被废止，所以尽量不使用它们，也不要使用它们的别名；

  * 由于浏览器演进的历史遗留问题，在创建带有id属性的DOM元素时也会创建同名的全局变量。

    ```javascript
    // <div id="foo"></div>

    if (type foo == "undefined") {
      	foo = 42;	// 永远也不会执行
    }

    console.log(foo);	// HTML 元素
    ```

  * 不要扩展原生原型，因为你永远不能确信代码在运行环境中不会有冲突，有太多的情况可能会扩展原生类型（JS更新、插件扩展等）；

  * 内联JS代码中不可以出现`</script>`字符串，一旦出现即视为代码块结束；

  * JS的一些限制（需要注意的地方）

    * 字符串中允许的最大字符数（并非只是针对字符串值）
    * 可以作为参数传递到函数中的数据大小（也称栈大小，以字节为单位）
    * 函数声明中的参数个数
    * 未经优化的调用栈（例如递归）的最大层数，即函数调用链的最大长度
    * JS程序以阻塞方式在浏览器中运行的最长时间（秒）
    * 变量名的最大长度




#### 六、异步：现在与将来

* 严格来说，`setTimeout(..0)`并不直接把项目插入到事件循环队列。定时器会在有机会的时候插入事件。举例来说，两个连续的`setTimeout(..0)`调用不能保证会严格按照调用顺序处理，说一个种情况都有可能出现。尽管他们使用方便，但是并没有直接的方法可以适应所有环境来确保异步事件的顺序。

* 实际上，JS程序总是至少分为两块，一块现在运行，下一块将来运行，以响应某个事件。尽管程序是一块一块执行的，但是所有的这些块共享对程序作用域和状态的访问，所以对状态的修改都是在之前积累的修改上进行的；

* 尽量少用嵌套，防止生成回调地狱；

* 回调表达程序异步和管理并发的两个主要缺陷：缺乏顺序性和可信任性；

* Promise.all([ .. ])接受一个promise数组并返回一个新的promise，这个新promise等待数组中的所有promise完成；

* Promise的链式函数

  ```javascript
  var p = Promise.resolve( 21 );

  p.then(function(v) {
      console.log(v);	// 21
      return new Promise(function(resolve, reject) {
          resolve( v * 2 );
      })
  }).then(function(v) {
      console.log(v);	// 42
  })
  ```

  * 调用Promise的then(...)会自动创建一个新的Promise从调用返回；
  * 在完成或拒绝处理函数内部，如果返回一个值或抛出一个异常，新返回的（可链接的）Promise就相应的决议；
  * 如果完成或拒绝处理函数返回一个Promise，它将会被展开，这样一来，不管它的决议是什么，都会成为当前then(...)返回的链接Promise的决议值；
  * 决议（resolve）、完成（fulfill）、拒绝（reject）

* Promise.all：Promise.all(`[...]`) 方法需要一个参数（数组），通常有Promise组成，也可以是`thenable`或者立即值，返回一个 Promise。当数组参数中所有的 Promise 都返回完成(resolve), 或者当参数不包含 Promise 时, 该方法返回完成(resolve),。当有一个 Promise 返回拒绝(reject)时, 该方法返回拒绝(reject)；

* Promise.race([...])：接受单个参数数组。返回数组中第一个执行完成的结果；

* Promise.none([...])：所有的Promise都要被拒绝，即拒绝转换为完成值；

* Promise.any([...])：只需要完成一个而不是全部；

* Promise.first([...])：只要第一个Promise完成，他就会忽略后续的任何拒绝和完成。如果所有的promise都拒绝的话，他不会拒绝，只会挂住；

* Promise.last([...])：只有最后一个完成，他就会忽略后续的任何拒绝和完成；

* Promise的局限性：

  * 顺序错误处理：由于一个Promise链仅仅是连接到一起的成员Promise，没有把整个链标识为一个个体的实体，这意味着没有外部方法可以用于观察可能发生的错误，则链中任何地方的错误都会在链中一直传播下去，知道被查看；
  * 单一值：Promise只能有一个完成值或一个拒绝理由。



#### 生成器

*   生成器是一类特殊的函数，可以一次或多次启动和停止，并不一定非得要完成。

    ```javascript
    var x = 1;
    function *foo() {
        x++;
        yield;	// 暂停
        console.log("x:", x);
    }

    function bar() {
        x++;
    }

    // 构造一个迭代器it来控制这个生成器，此处并未执行生成器*foo()，只是构造
    var it = foo();

    it.next();	// 启动foo()，并运行了*foo()第一行的x++
    x;			// 2；此时*foo()在yield语句处暂停，x为2
    bar();		// 调用bar()，通过x++再次递增x
    x;			//	3；此时x为3
    it.next();	// x: 3	最后的it.next()调用从暂停处恢复了生成器*foo()的执行，并打印信息
    ```

*   生成器仍然是一个函数，仍然接受参数，也能够返回值；

*   迭代消息传递

    ```javascript
    function *foo(x) {
        var y = x * (yield);
        return y;
    }

    var it = foo(6);

    it.next();
    var res = it.next(7);

    res.value;	// 42
    ```

    ​

