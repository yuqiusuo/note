- 数组的扩展

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

  ​