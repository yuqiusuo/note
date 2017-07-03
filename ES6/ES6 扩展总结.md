### ES6 扩展总结

* String
  1. includes(str,n) : 返回布尔值，表示是否找到了参数字符串

  2. startsWith(str,n) : 返回布尔值，表示参数字符串是否在源字符串的头部

  3. endsWith(str,n) : 返回布尔值，表示参数字符串是否在源字符串的尾部

     ```javascript
     var s = "hello world!";

     s.includes('o') //true
     s.startsWith('hello') //true
     s.endsWith('!') //true

     //上述三个方法都支持第二个参数n，表示搜索的位置

     s.includes('hello',6) //false 从第n个位置开始
     s.startsWith('hello',5) //true 从第n个位置开始
     s.endsWith('hello',6) //true 从第0个字符到第n个字符
     ```

  4. repeat(n) : 返回一个新字符串，表示将原文字重复n次

     ```javascript
      /**	repeat方法
       **    参数 n : 表示字符串被重复n次. 小数(向下取整 2.9=2)/负数、Infinity报错/NaN=0/字   
       **    符串转换为数字("2"=2,"na"=0)
       **/

     'hello'.repeat(3) //"xxx"
     'hello'.repeat("2") //xx

     'hello'.repeat(0) //''
     'hello'.repeat(NaN) //''
     'hello'.repeat(-0.9) //'' -1-0之间的数字会转换为0
     'hello'.repeat('na') //''

     'hello'.repeat('Infinity') //RangeError
     'hello'.repeat('-1')  //RangeError

     ```

  5. padStart(n,str) : 从头部补全字符串

  6. padEnd(n,str) : 从尾部补全字符串

     ```javascript
     /** padStart/padEnd
      ** n:字符串最小长度/str:用来补全的字符串(默认为空格)
      **/
     'x'.padStart(5,'ab') //'ababx'
     'x'.padStart(4,'ab') //'abax'
     'x'.padEnd(5,'ab') //'xabab'
     'x.'padEnd(4,'ab') //'xaba'
     '09-12'.padStart(10,'YYYY-MM-DD') //"YYYY-09-12"
     ```

  7. 模板字符串

     ```javascript
     // ${}内可以放置JS变量及表达式
     var name = "Bob", time = "today";
     `Hello ${name}, how are you ${time}` //"Hello Bob, how are you today"

     var x = 1, y = 2;
     `${x} + ${y} = ${x + y}`//"1 + 2 = 3"

     var obj = {x:1, y:2};
     `${obj.x + obj.y}` //3
     ```

* Number

  1. 二进制和八进制表示法

     ```javascript
     //ES6提供了二进制(0b/0B开头)和八进制(0o/0O开头)数值的写法
     0b111110111 === 503 //true
     0o767 === 503 //true
     ```

  2. Number.isFinite()：判断一个数值时候是有限的

  3. Number.isNaN()：检查一个数值是否为NaN

     ```javascript
     //两种方法与传统的全局方法的区别在于，传统方法先调用Number()将非数值转换为数值，再判断
     //这两种方法只对数值有效
     Number.isFinite(15) //true
     Number.isFinite(0.8) //true
     Number.isFinite(NaN) //false
     Number.isFinite(Infinity) //false
     Number.isFinite('foo') //false
     Number.isFinite('15') //false
     Number.isFinite(true) //false

     Number.isNaN(NaN) //true
     Number.isNaN(15) //false
     Number.isNaN('15') //false
     Number.isNaN(true) //false
     Number.isNaN(9/NaN) //true
     Number.isNaN('true'/0) //true
     Number.isNaN('true'/'true') //true
     ```

  4. Number.parseInt()：将数值转换为Int

  5. Number.parseFloat()：将数值转换为Float

     ```javascript
     //只是将全局方法parseInt()和parseFloat()移植到Number对象上，行为不变
     //意义在于减少全局方法，使语言逐步模块化
     parseInt("12.34") //12
     Number.parseInt('12.34') //12

     parseFloat('12.345#') //12.345
     Number.parseFloat('12.345#') //12.345

     Number.parseInt === parseInt //true
     Number.parseFloat === parseFloat //true
     ```

  6. Number.isInteger()：判断一个值是否为整数

     ```javascript
     //JS内部，整数和浮点数是同样的存储方法，3和3.0视为同一值
     Number.isInteger(25) //true
     Number.isInteger(25.0) //true
     Number.isInteger(25.1) //false
     Number.isInteger("15") //false
     Number.isInteger(true) //false
     ```

  7. Number.EPSILON()：极小的常量

     ```javascript
     //引入一个极小的常量，在于为浮点数的计算，设置一个误差范围，因为JS浮点数计算不精确
     //如果误差小于Number.EPSILON，就认为得到了正确结果
     Number.EPSILON //2.220446049250313e-16
     Number.EPSILON.toFixed(20) //"0.00000000000000022204"

     0.1 + 0.2 //0.30000000000000004
     0.1 + 0.2 -0.3 //5.551115123125783e-17
     5.551115123125783e-17.toFixed(20) //'0.00000000000000005551'

     5.551115123125783e-17 < Number.EPSILON //true
     ```

  8. 安全整数和Number.isSafeInteger()

     ```javascript
     //JS能正确表示的整数范围在-2^53和2^53之间(不含该两个端点)，超过这个范围，这无法精确表示
     Math.pow(2,53) //9007199254740992
     9007199254740992  // 9007199254740992
     9007199254740993  // 9007199254740992
     Math.pow(2, 53) === Math.pow(2, 53) + 1 //true

     Number.MAX_SAFE_INTEGER === Math.pow(2, 53) - 1 //true
     Nunber.MAX_SAFE_INTEGER === 9007199254740991 //true

     Number.MIN_SAFE_INTEGET === -Number.MAX_SAFE_INTEGER //true
     Number.MIN_SAFE_INTEGET === 9007199254740991 //true

     Number.isSafeInteger('a') //false
     Number.isSafeInteger(null) //false
     Number.isSafeInteger(NaN) //false
     Number.isSafeInteger(Infinity) //false
     Number.isSafeInteger(-Infinity) //false

     Number.isSafeInteger(3) //true
     Number.isSafeInteget(1.3) //false
     Number.isSafeInteger(9007199254740990) //true
     Number.isSafeInteger(9007199254740992) //false

     Number.isSafeInteger(Number.MIN_SAFE_INTEGER - 1) //false
     Number.isSafeInteger(Number.MIN_SAFE_INTEGER) //true
     Number.isSafeInteger(Number.MAX_SAFE_INTEGER) //true
     Number.isSafeInteger(Number.MAX_SAFE_INTEGER + 1) //false 
     ```

  9. Math.trunc()：去除一个数的小数部分，返回整数部分

     ```javascript
     //非数值:先使用Number方法转换为数值/空值或无法截取整数的值:返回NaN
     Math.trunc(4.1) //4
     Math.trunc(4.9) //4
     Math.trunc(-4.1) //-4
     Math.trunc(-4.9) //-4
     Math.trunc(-0.1234) //-0

     Math.trunc('123.456') //123

     Math.trunc(NaN) //NaN
     Math.trunc('foo') //NaN
     math.trunc() //NaN
     ```

  10. Math.sign()：判断一个数到底是正数、负数、还是零

    ```javascript
    //返回值:正数(+1)/负数(-1)/0(0)/-0(-0)/其他值(NaN)
    Math.sign(-5) //-1
    Math.sign(5) //+1
    Math.sign(0) //+0
    Math.sign(-0) //-0
    Math.sign(NaN) //NaN
    Math.sign('foo')//NaN
    Math.sign() //NaN
    ```

  11. Math.cbrt()：计算一个数的立方根

      ```javascript
      //非数值邮箱使用Number方法将其转为数值
      Math.cbrt(-1) //-1
      Math.cbrt(0) //0
      Math.cbrt(1) //1
      Math.cbrt(2) //1.25599210498948734

      Math.cbrt('8') //2
      Math.cbrt('hello') //NaN
      ```

  12. Math.hypot()：返回所有参数的平方和的平方根

      ```javascript
      Math.hypot(3, 4) //5
      Math.hypot(3, 4, 5) //7.0710678118654755
      Math.hypot() //0
      Math.hypot(NaN) //NaN
      Math.hypot(3, 4, 'foo') //NaN
      Math.hypot(3,'4') //5
      Math.hypot(-3) //3
      ```

  13. Math.expm1(n)：返回e^n-1 (e：自然底数)

  14. Math.log1p(n)：返回(1+n)的自然对数，集Math.log(1 + n)

  15. Math.log10(n)：返回以10为底的n的对数

  16. Math.log2(n)：返回以2为底的n的对数

  17. Math.sinh(x)：返回x的双曲正弦

  18. Math.cosh(x)：返回x的双曲余弦

  19. Math.tanh(x)：返回x的双曲正弦

  20. Math.asinh(x)：返回x的反双曲正弦

  21. Math.acosh(x)：返回x的反双曲余弦

  22. Math.atanh(x)：返回x的反双曲正切

  23. Math.signbit(x)：判断一个值的正负

      ```javascript
      //NaN--false/-0--true/负值--true/其他--false
      Math.signbit(2) //false
      Math.signbit(-2) //true
      Math.signbit(0) //false
      Math.signbit(-0) //true
      ```

  24. 指数运算符：**

      ```javascript
      2 ** 2 //4
      2 ** 3 //8
      a **= 2 //a = a * a
      b **= 3 //b = b * b * b
      ```

* 数组的扩展

  1. Array.from(arr,function)：将两类对象转为真正的数组，类似数组的对象和可遍历的对象

     ```javascript
     //第一个参数:待转换对象;第二个参数:类似于数组的map方法,对每个元素进行处理，将处理后的值放入返
     //回的数组
     let arrayLike = {
       	'0':'a',
       	'1':'b',
       	'2':'c',
       	length:3
     };

     //ES5的写法
     var arr1 = [].slice.call(arrayLike); //['a','b','c']

     //ES6的写法
     let arr2 = Array.from(arrayLike); //['a','b','c']

     //只要是部署了Iterator接口的数据接口，Array.from都能将其转为数组
     Array.from('hello') //['h','e','l','l','o']

     let namesSet = new Set(['a','b']);
     Array.from(namesSet) //['a','b']

     Array.from([1, 2, 3],(x) => x * x) // [1, 4, 9]
     ```

  2. Array.of()：将一组值转换为数组

     ```javascript
     Array.of(3, 11, 8) //[3, 11, 8]
     Array.of(3) // [3]

     Array.of() //[]
     Array.of(undefined) // [undefined]
     Array.of(1) //[1]
     Array.of(1, 2) //[1, 2]
     ```

  3. Array.copyWithin(target, start, end)：在当前数组内部，将指定位置的成员复制到其他位置，返回当前数组，该方法会修改当前数组

     ```javascript
     //target(必需):从该位置开始替换数据
     //start(可选):从该位置开始读取数据，默认为0。如果为负值，表示倒数
     //end(可选):从该位置前停止读取数据，默认等于数组长度。如果为负值，表示倒是

     [1, 2, 3, 4, 5].copyWithin(0, 3) //[4, 5, 3, 4, 5]
     [1, 2, 3, 4, 5].copyWithin(0, 3, 4) //[4, 2, 3, 4, 5]
     [1, 2, 3, 4, 5].copyWithin(0, -2, -1) //[4, 2, 3, 4, 5]
     ```

  4. 数组实例的find()和findIndex()

     ```javascript
     //find(value,index,arr):找出第一个符合条件的数组成员,value-当前值/index-当前位置/arr-原数组
     //findIndex():找出第一个符合条件的数组成员的位置
     [1, 4, -5, 10].find((n) => n < 0) //-5
     [1, 5, 10 ,15].find(function(value, index, arr){
       	return value > 9;
     }) //10

     [1, 5, 10, 15].findIndex(function(value, index, arr) {
       return value > 9;
     }) //2
     [NaN].findIndex(y => Object.is(NaN, y)) //0
     ```

  5. 数组实例的fill()

     ```javascript
     //fill(value, start, end):使用给定值，填充一个数组，会抹去数组中的已有元素
     //value-填充值/start-起始位置/end-结束位置
     ['a', 'b', 'c'].fill(7) //[7, 7, 7]
     ['a', 'b', 'c'].fill(7, 1, 2) //['a', 7, 'c']
     ```

  6. entries()，keys()，values()

     ```javascript
     //三者均用于遍历数组，都返回一个遍历对象，可以用for...of循环进行遍历
     //entries():对键值对的遍历
     //keys():对键名的遍历
     //values():对键值的遍历
     for (let index of ['a', 'b'].keys()) {
       	console.log(index);
     } //0 1

     for (let elem of ['a', 'b'].values()) {
       	console.log(elem);
     } //'a' 'b'

     for (let [index, elem] of ['a', 'b'].entries()) {
       	console.log(index, elem);
     } // 0 "a"    1 "b"
     ```

  7. includes(val, start)：判断某个数组时候包含某个给定的值

     ```javascript
     //val-查找的值/start-搜索的起始位置(负数表示倒数的位置)
     [1, 2, 3].includes(2) //true
     [1, 2, 3].includes(4) //false

     [1, 2, 3].includes(3, 3) //false
     [1, 2, 3].includes(3, -1) //true
     ```

* 函数的扩展

  1. 函数参数的默认值

     ```javascript
     function Point(x = 0, y = 0) {
       this.x = x;
       this.y = y;
     }
     ```

  2. 与解构赋值默认值结合使用

     ```javascript
     function foo({x, y = 5}) {
       console.log(x, y);
     }
     foo({}) //undefined, 5
     foo({x: 1}) //1, 5
     foo({x: 1, y: 2}) //1, 2
     foo() //TypeError: Cannot read property 'x' of undefined

     //下面两种写法有什么差别？
     function m1({x = 0, y = 0} = {}) {
       return [x, y];
     }

     function m2({x, y} = {x: 0, y: 0}) {
       return [x, y];
     }

     //上面两种写法都对函数的参数设定了默认值
     //写法一函数参数的默认值是空对象，但是设置了对象解构赋值的默认值
     //写法二函数参数的默认值是一个有具体属性的对象，但是没有设置对象解构赋值的默认值
     m1() //[0, 0]
     m2() //[0, 0]

     m1({x: 3, y: 3}) //[3, 3]
     m2({x: 3, y: 3}) //[3, 3]

     m1({x: 3}) //[3, 0]
     m2({x: 3}) //[3, undefined]

     m1({}) //[0, 0]
     m2({}) //[undefined, undefined]

     m1({z: 3}) //[0, 0]
     m2({z, 3}) //[undefined, undefined]
     ```

  3. rest参数

     ```javascript
     //rest(...变量名)参数用于获取函数的多余参数，rest参数搭配的变量是一个数组，将多余的参数放入数
     //组中
     function add(...values) {
       let sum = 0;
       for (var val of values) {
         sum += val;
       }
       return sum;
     }

     add(2, 5, 3) //10
     ```

  4. 扩展运算符(...)

     ```javascript
     //将一个数组转为逗号分隔的参数序列
     console.log(...[1, 2, 3]) //1 2 3
     console.log(1, ...[2, 3, 4], 5) //1 2 3 4 5

     //合并数组
     [1, 2].concat(more) //ES5
     [1, 2, ...more] //ES6

     var arr1 = ['a', 'b'];
     var arr2 = ['c'];
     var arr3 = ['d', 'e'];
     arr1.concat(arr2, arr3) //ES5 ['a', 'b', 'c', 'd', 'e']
     [...arr1, ...arr2, ...arr3] //ES6 ['a', 'b', 'c', 'd', 'e']

     //与解构赋值结合，如果将扩展运算符用于数组赋值，只能放在参数的最后一位
     const [first, ...rest] = [1, 2, 3, 4, 5];
     first //1
     rest //[2, 3, 4, 5]

     //函数的返回值
     var dateFields = readDateFields(database);
     var d = new Date(...dateFields);

     //字符串
     [...'hello'] //["h", "e", "l", "l", "o"]

     //实现了Iterator接口的对象，任何Iterator接口的对象，都可以用扩展运算符转为真正的数组
     var nodeList = document.querySelectorAll('div');
     var array = [...nodeList];

     //Map和Set结构，Generator函数
     let map = new Map([
       [1, 'one'],
       [2, 'two'],
       [3, 'three']
     ]);
     let arr = [...map.keys()]; //[1, 2, 3]

     var go = function*(){
       yield 1;
       yield 2;
       yield 3;
     };
     [...go()] //[1, 2, 3]
     ```

  5. name属性: 返回该函数的函数名

     ```javascript
     function foo(){}
     foo.name //"foo"
     ```

  6. 箭头函数

     ```javascript
     //注意
     //1.函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象
     //2.不可以当做构造函数，也就是说，不可以使用new命令，否则会抛出一个错误
     //3.不可以使用arguments对象，该对象在函数体内不存在，如果要用，可以使用rest参数
     //4.不可以使用yield命令，因此箭头函数不能用作Generator函数
     var f = v => v; //ES6
     var f = function(v) { return v; } //ES5

     var sum = (num1, num2) => num1 + num2; //ES6
     var sum = function(num1, num2) {
       return num1 + num2;
     } //ES5

     var getTempItem = id => ({id: id, name: "Temp"}) //ES6 返回对象需要用括号包起来

     const full = ({first, last}) => first + ' ' + last; //ES6
     function full(person) {
       return person.first + ' ' + person.last;
     }

     const isEven = n => n % 2 === 0;
     const square = n => n * n;

     const numbers = (...nums) => nums;
     numbers(1, 2, 3, 4, 5) //[1, 2, 3, 4, 5]

     const headAndTail = (head, ...tail) => [head, tail];
     headAndTail(1, 2, 3, 4, 5) //[1, [2, 3, 4, 5]]
     ```

* 对象的扩展

  1. 属性的简洁表示法

     ```javascript
     //ES6允许直接写入变量和函数，作为对象的属性和方法
     //ES6 对象中可以直接写属性名
     var a = 'bar'; var baz = {a}; baz //{a: "bar"}
     //ES5
     var a = 'bar'; var baz = {a: a}; baz //{a: "bar"}

     //方法也可以简写
     //ES6
     var o = {
       method() {
         return "Hello!";
       }
     }

     //ES5
     var o = {
       method: function() {
         return "Hello!";
       }
     }
     ```

  2. 属性名表达式

     ```javascript
     //ES6
     obj.foo = true;	//方式一
     obj['a' + 'bc'] = 123;	//方式二
     //ES5
     var obj = {
       foo: true,
       abc: 123
     }
     ```

  3. 方法的name属性

     ```javascript
     //bind方法创造的函数，name属性返回bound加上原函数的名字
     //Function构造函数创造的函数，name属性返回anonymous
     //如果对象的方法是一个Symbol值，namename属性返回的是这个Symbol的描述
     const person = {
       sayName() {
         console.log('hello!');
       }
     }
     person.sayName.name //"sayName"

     (new Function()).name //"anonymous"

     var doSomething = function() {/* ... */}
     doSomething.bind().name //"bound doSomething"

     const key1 = Symbol('description');
     const key2 = Symbol();
     let obj = {
       [key1]() {};
       [key2]() {}
     };
     obi[key1].name //"[description]"
     obj[key2].name //""
     ```

  4. Object.is() : 用来比较两个值时候严格相等，与(===)的行为值基本一致

     ```javascript
     //(==)的缺点会自动转换数据类型
     //(===)的缺点是NaN不等于自身，以及+0等于-0
     +0 === -0 //true
     NaN === NaN //false

     Object.is(+0, -0) //false
     Object.is(NaN, NaN) //true
     ```

  5. Object.assign() : 用于对象的合并，将源对象的所有可枚举属性，复制到目标对象

     ```javascript
     var target = { a: 1 };
     var source1 = { b: 2 };
     var source2 = { c: 3 };
     Object.assign(target, source1, source2);
     target //{a: 1, b: 2, c: 3}

     //如果目标对象与源对象有同名属性，或者多个源对象有同名属性，后面的属性覆盖前面的
     var target = { a: 1, b: 2 };
     var source1 = { b: 2, c: 3 };
     var source2 = { c: 3 };
     Object.assign(target, source1, source2);
     target //{a: 1, b: 2, c: 3}

     //其他类型的值(数值、字符串和布尔值)不在首参数，不会报错，但也不会有效果
     var v1 = 'abc';
     var v2 = true;
     var v3 = 10;
     var obj = Object.assign({}, v1, v2, v3);
     console.log(obj); //{ "0": "a", "1": "b", "2": "c"}/

     //Object.assign方法是新的是浅拷贝
     var obj1 = {a: {b: 1}};
     var obj2 = Object.assign({}, obj1);

     obj1.a.b = 2;
     obj2.a.b //2

     //用途1 为对象添加属性
       class Point{
         constructor(x, y) {
           Object.assign(this, {x, y});	//将x属性和y属性添加到Point类的对象实例
         }
       }

     //用途2 为对象添加方法
       Object.assign(SomeClass.prototype, {
         someMethod(arg1, arg2) {
           ...
         },
         anotherMethod() {
           ...
         }
       });

       //ES5 
       SomeClass.prototype.someMethod = function (arg1, arg2) {
         ...
       }
       SomeClass.prototype.anotherMethod = function () {
         ...
       }
       
     //用途3 克隆对象
       function clone(origin) {
         return Object.assign({}, origin)
       }	//将原始对象拷贝到一个空对象，得到原始对象的克隆
         
       function clone(origin) {
         let originProto = Object.getPrototypeOf(origin);
         return Object.assign(Object.create(originProto), origin);
       }
         
     //用途4 合并多个对象
       const merge = (...sources) => Object.assign({}, ...sources);
         
     //用途5 为属性指定默认值 由于存在浅拷贝的问题，DEFAULTS和options对象所有属性的值最好都是简单  //类型，不要指向另一个对象，否则可能不起作用
       const DEFAULTS = {
         logLevel: 0,
         outputFormat: 'html'
       };
         
       function processContent(options) {
         options = Object.assign({}, DEFAULTS, options);
         console.log(options);
       }
     ```

  6. 属性的可枚举性

     ```javascript
     //对象的每个属性都有一个描述对象(Descriptor)，用来禁止该属性的行为
     //Object.getOwnPropertyDescriptor方法可以获取该属性的描述对象
     let obj = { foo: 123 };
     Object.getOwnPropertyDescriptor(obj, 'foo')

     /*
     **	描述对象的enumerable属性，称为“可枚举性”，如果该属性为false，就表示某些操作
     **	会忽略当前属性
     **	{
     **   	value: 123,
     **		writable: true,
     **		enumerable: true,
     **		configurable: true
     **	}
     */

     //ES5有三个操作会忽略enumerable为false属性
     // for...in循环: 之便利对象自身和继承的可枚举的属性
     // Object.keys(): 返回对象自身的所有可枚举的属性的键名
     // JSON.stringify(): 只串行化对象自身的可枚举的属性

     //ES6新增了一个操作Object.assign()，会忽略enumerable为false的属性，只拷贝对象自身
     //可枚举的属性

     //ES6规定，所有Class的原型的方法都是不可枚举的
     ```

  7. 属性的遍历

     ```javascript
     /*	
     **	ES6一共有5中可以遍历对象的属性
     **	1. for...in: 循环遍历对象自身的和继承的可枚举属性(不含Symbol属性)
     **	2. Object.keys(obj): 返回一个数组，包括对象自身的(不含继承的)所有可枚举属性
     **			(不含Sumbol属性)
     **	3. Object.getOwnPropertyNames(obj): 返回一个数组，包括对象自身的所有属性(不含Symbol
     **			属性，但是包括不可枚举属性)
     **	4. Object.getOwnPropettySymbols(obj): 返回一个数组，包含对象自身的所有Symbol属性
     **	5. Reflect.ownKeys(obj): 返回一个数组，包含对象自身的所有属性，不管属性名是Symbol
     **			或字符串，也不管时候可枚举
     **
     **	以上5种方法遍历对象的属性，都遵守同样的属性遍历的次序规则
     **	- 首先遍历所有属性名为数值的属性，按照数字排序
     **	- 其次遍历所有属性名为字符串的属性，按照生成时间排序
     **	- 最后遍历所有属性名为Symbol值的属性，按照生成时间排序
     */
     ```

  8. Object.keys() : 返回一个数组，成员是参数对象自身(不含继承的)所有可遍历(enumerable)属性的键名；

     Object.values() : 返回一个数组，成员是参数对象自身的(不含继承的)所有可遍历(enumerable)属性的键值；

     Object.entries() : 返回一个数组，成员是参数对象自身的(不含继承的)所有可遍历(enumerable)属性的数值对数组；

     ```javascript

     ```

     ​

