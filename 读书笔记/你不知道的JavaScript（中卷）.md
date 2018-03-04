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

