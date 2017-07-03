- 函数的扩展

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

  ​