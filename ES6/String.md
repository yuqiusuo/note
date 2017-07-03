> 《ECMAScript 6 入门》读书笔记

- String

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

  ​