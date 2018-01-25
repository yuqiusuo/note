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





