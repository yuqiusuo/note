> 《ECMAScript 6 入门》读书笔记

- Number

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

