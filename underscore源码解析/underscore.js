//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

// 最外层为一立即执行函数(IIFE)，IIFE主要特征:
// 1.使用函数表达式声明一个函数
// 2.在其后使用括号直接调用，本方式是使用.call(this)的方法调用
// 作用: 防止函数作用域被污染
(function() {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `exports` on the server.
    // 该this为最外层IIFE传入，代表全局对象，在浏览器环境下为window，服务器环境下为exports
    var root = this;

    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;

    // Save bytes in the minified (but not gzipped) version:
    // 保存原型对象
    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;

    // Create quick reference variables for speed access to core prototypes.
    // 保存常用方法
    var
        push = ArrayProto.push,
        slice = ArrayProto.slice,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    // 保存常用方法
    var
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind,
        nativeCreate = Object.create;

    // Naked function reference for surrogate-prototype-swapping.
    // 1. 用于代理原型转换的空函数，用法详见baseCreate
    // 2. 和baseCreate组合在一起看，他们主要是为了解决Object.create()的浏览器兼容性，
    //    因为原型是无法直接实例化的，因此通过先创建一个空对象Ctor，然后将其原型指向我
    //    们想要实例化的原型，最后返回该原型
    var Ctor = function() {};

    // Create a safe reference to the Underscore object for use below.
    // 初始化，为_对象创建一个安全的引用
    var _ = function(obj) {
        if (obj instanceof _) return obj; // 如果参数obj是underscore的一个实例，则直接返回该参数
        if (!(this instanceof _)) return new _(obj); // 实例化
        this._wrapped = obj; // 保存该参数
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object.
    // 以下一段代码是为了在NODE环境下，将underscore作为一个模块使用，将_暴露到全局
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _; // 如果在浏览器下，则暴露给window对象
    }

    // Current version. 版本号
    _.VERSION = '1.8.3';

    // Internal function that returns an efficient (for current engines) version
    // of the passed-in callback, to be repeatedly applied in other Underscore functions.
    // underscore中有大量的回调函数，它对于回调函数做了一定的处理
    /**
     * optimizeCb对于传入的函数做了一层封装，用于更好地重复调用，保证this传递的正确
     * @param {*} func      需要处理的函数
     * @param {*} context   函数的上下文(this)
     * @param {*} argCount  参数的数量
     */
    var optimizeCb = function(func, context, argCount) {
        // void 0是undefined的一种表现形式,可以避免undefined被重写，如果未传入上下文，则直接返回函数
        if (context === void 0) return func;
        // 当未传入参数数量时，按参数数量为3处理
        switch (argCount == null ? 3 : argCount) {
            case 1:
                return function(value) { // 一个参数，只需要传递当前值
                    return func.call(context, value);
                };
            case 2:
                return function(value, other) { // 两个参数，传递值、索引、其他参数
                    return func.call(context, value, other);
                };
            case 3:
                return function(value, index, collection) { // 3个参数，值、索引、整个集合
                    return func.call(context, value, index, collection);
                };
            case 4:
                return function(accumulator, value, index, collection) { // 4个参数，累计值、当前值、索引、整个集合
                    return func.call(context, accumulator, value, index, collection);
                };
        }
        // 如果不是上面的条件，直接调用传入函数
        return function() {
            return func.apply(context, arguments);
        };
    };

    // A mostly-internal function to generate callbacks that can be applied
    // to each element in a collection, returning the desired result — either
    // identity, an arbitrary callback, a property matcher, or a property accessor.
    // 翻译：一个基本的内部函数，用于生成可以应用于集合中的每个元素的回调函数，返回所需的结果——要么是标识，
    //      要么是任意回调，要么是属性匹配器，要么是属性访问器。
    /**
     * 针对集合迭代的回调处理
     * @param {*} value     当前值
     * @param {*} context   上下文
     * @param {*} argCount  参数数量
     */
    var cb = function(value, context, argCount) {
        if (value == null) return _.identity; // 如果没传value，则返回等价的自身
        if (_.isFunction(value)) return optimizeCb(value, context, argCount); // 如果value是一个函数，返回该函数的回调
        if (_.isObject(value)) return _.matcher(value); // 如果value是对象，寻找匹配的属性值
        return _.property(value); // 如果都不是，返回相应的属性访问器
    };

    /**
     * 默认的迭代器，认为参数的数量是无穷的，调用cb
     * @param {*} value 
     * @param {*} context 
     */
    _.iteratee = function(value, context) {
        return cb(value, context, Infinity);
    };

    // An internal function for creating assigner functions.
    // 翻译: 用于创建分配函数的内部函数
    // 此函数为很典型的闭包，该函数与3个方法有关联:
    // _.extend() = createAssigner(_.allKeys)
    // _.extendOwn() = createAssigner(_.keys)
    // _.defaults() = createAssigner(_.allKeys, true)
    var createAssigner = function(keysFunc, undefinedOnly) {
        return function(obj) {
            var length = arguments.length; // 获取参数的数量
            if (length < 2 || obj == null) return obj; // 如果参数的数量小于2或者传入的对象为null，直接返回传入的对象
            for (var index = 1; index < length; index++) {
                var source = arguments[index], // 获取当前参数
                    keys = keysFunc(source), // 获取当前参数的keys
                    l = keys.length; // 获取当前参数key的长度
                for (var i = 0; i < l; i++) {
                    var key = keys[i]; // 获取当前key
                    if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key]; // 进行obj的key值操作
                }
            }
            return obj;
        };
    };

    // An internal function for creating a new object that inherits from another.
    // 创建新对象的内部函数，该对象继承自另一个对象
    var baseCreate = function(prototype) {
        // 如果参数不是对象，则返回空对象
        if (!_.isObject(prototype)) return {};
        // 如果支持Object.create()方法，则返回Object.create()方法创建的原型对象
        if (nativeCreate) return nativeCreate(prototype);
        // 如果浏览器不支持Object.create()方法，执行以下步骤:
        Ctor.prototype = prototype; // 1. 将传入的原型赋值给Ctor
        var result = new Ctor; // 2. 创建一个新的Ctor实例
        Ctor.prototype = null; // 3. 恢复Ctor以备下次使用
        return result; // 4. 返回创建的新实例
    };

    // 该参数用于获取一个对象的key值
    var property = function(key) {
        return function(obj) {
            return obj == null ? void 0 : obj[key];
        };
    };

    // Helper for collection methods to determine whether a collection
    // should be iterated as an array or as an object
    // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
    // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var getLength = property('length'); // 获取length属性的方法暂存
    // 类似组: 拥有 length 属性并且 length 属性值为 Number 类型的元素，例如数组、arguments、HTMLCollection以及NodeList等
    // 判断是否为类数组
    var isArrayLike = function(collection) {
        var length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };

    // Collection Functions
    // --------------------

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles raw objects in addition to array-likes. Treats all
    // sparse array-likes as if they were dense.
    _.each = _.forEach = function(obj, iteratee, context) {
        // 处理迭代函数iteratee，如果没有context，则直接使用iteratee作为函数遍历，否则迭代函数将以当前值、当前索引、完整集合作为参数进行调用
        iteratee = optimizeCb(iteratee, context);
        var i, length;
        // 判断是否为类函数
        if (isArrayLike(obj)) {
            // 如果为类数组，遍历每个位置
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        } else {
            // 如果不是类数组，遍历每个键值对
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }
        return obj;
    };

    // Return the results of applying the iteratee to each element.
    _.map = _.collect = function(obj, iteratee, context) {
        // 处理迭代函数iteratee，如果iteratee是函数，则用optimizeCb处理
        iteratee = cb(iteratee, context);
        // 如果是类数组对象，获取keys、length，创建一个length长度的数组
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length,
            results = Array(length);
        for (var index = 0; index < length; index++) {
            // 判断当前的键或者index，循环执行函数
            var currentKey = keys ? keys[index] : index;
            results[index] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    };

    // Create a reducing function iterating left or right.
    /**
     *  _.reduce()和 _.reduceRight()依赖函数，dir用于区分两个函数
     * @param {*} dir 
     */
    function createReduce(dir) {
        // Optimized iterator function as using arguments.length
        // in the main function will deoptimize the, see #1991.
        // 定义迭代器函数
        function iterator(obj, iteratee, memo, keys, index, length) {
            // 遍历index至length之间的元素，执行迭代方法
            for (; index >= 0 && index < length; index += dir) {
                var currentKey = keys ? keys[index] : index;
                // 每次迭代，memo都为新的结果
                memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
        }

        return function(obj, iteratee, memo, context) {
            // 处理迭代方法，生成新的迭代函数
            iteratee = optimizeCb(iteratee, context, 4);
            var keys = !isArrayLike(obj) && _.keys(obj),
                length = (keys || obj).length,
                index = dir > 0 ? 0 : length - 1; // index表示遍历方向(左/右)
            // Determine the initial value if none is provided.
            // 如果没有初始值，先确定初始值
            if (arguments.length < 3) {
                memo = obj[keys ? keys[index] : index];
                index += dir;
            }
            return iterator(obj, iteratee, memo, keys, index, length);
        };
    }

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`.
    _.reduce = _.foldl = _.inject = createReduce(1);

    // The right-associative version of reduce, also known as `foldr`.
    _.reduceRight = _.foldr = createReduce(-1);

    // Return the first value which passes a truth test. Aliased as `detect`.
    // find别名detect
    /**
     * @param predicate 迭代函数
     */
    _.find = _.detect = function(obj, predicate, context) {
        var key;
        // 判断是否为类函数
        if (isArrayLike(obj)) {
            // 如果是类函数，则调用findIndex寻找index
            key = _.findIndex(obj, predicate, context);
        } else {
            // 否则通过findKey寻找key值
            key = _.findKey(obj, predicate, context);
        }
        // 如果找到，返回该值，找不到这返回undefined
        if (key !== void 0 && key !== -1) return obj[key];
    };

    // Return all the elements that pass a truth test.
    // Aliased as `select`.
    /**
     * @param predicate 过滤函数
     */
    _.filter = _.select = function(obj, predicate, context) {
        var results = []; // 定义一个空结果数组
        // 通过cb和optimizeCb处理过滤函数
        predicate = cb(predicate, context);
        // each过滤每一个值，通过的push进结果数组
        _.each(obj, function(value, index, list) {
            if (predicate(value, index, list)) results.push(value);
        });
        return results;
    };

    // Return all the elements for which a truth test fails.
    // _.negate: 返回一个新的predicate函数的否定版本
    _.reject = function(obj, predicate, context) {
        return _.filter(obj, _.negate(cb(predicate)), context);
    };

    // Determine whether all of the elements match a truth test.
    // Aliased as `all`.
    _.every = _.all = function(obj, predicate, context) {
        // 处理过滤函数
        predicate = cb(predicate, context);
        // 判断对象是否为类数组对象，如果是，获取所有key值
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            // 遍历数组元素，如果有一个值不通过过滤函数，返回false
            var currentKey = keys ? keys[index] : index;
            if (!predicate(obj[currentKey], currentKey, obj)) return false;
        }
        return true;
    };

    // Determine if at least one element in the object matches a truth test.
    // Aliased as `any`.
    // 同_.every，如果有一个值通过过滤函数，返回true
    _.some = _.any = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (predicate(obj[currentKey], currentKey, obj)) return true;
        }
        return false;
    };

    // Determine if the array or object contains a given item (using `===`).
    // Aliased as `includes` and `include`.
    _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
        // 如果obj是类数组对象，提取obj的值组成一个新的数组
        if (!isArrayLike(obj)) obj = _.values(obj);
        // 查找起始位置确定
        if (typeof fromIndex != 'number' || guard) fromIndex = 0;
        // 利用_.indexOf 确定查找的值在数组中的位置，如果位置>=0则表示存在该值
        return _.indexOf(obj, item, fromIndex) >= 0;
    };

    // Invoke a method (with arguments) on every item in a collection.
    // 在list的每个元素上执行method方法
    _.invoke = function(obj, method) {
        // 提取arguments
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method); // 判断传入的method是不是方法
        // 遍历obj中的值。针对每一个值都做一个处理
        return _.map(obj, function(value) {
            // 如果method是方法，在用方法处理每个值，否则用value原型下的method方法处理每个值
            var func = isFunc ? method : value[method];
            // 如果func不存在，直接返回func，存在的话调用改方法处理每个值
            return func == null ? func : func.apply(value, args);
        });
    };

    // Convenience version of a common use case of `map`: fetching a property.
    // map简化版本  萃取对象数组中的某个属性时，返回一个数组
    _.pluck = function(obj, key) {
        return _.map(obj, _.property(key));
    };

    // Convenience version of a common use case of `filter`: selecting only objects
    // containing specific `key:value` pairs.
    // 遍历list中的每一个值，返回一个数组，这个数组包含包含properties所列出的属性的所有的键 - 值对
    // _.where([{a: 1, b: 2}, {b: 2, c: 3}], {a: 1}); => [{a: 1,b: 2}]
    _.where = function(obj, attrs) {
        return _.filter(obj, _.matcher(attrs));
    };

    // Convenience version of a common use case of `find`: getting the first object
    // containing specific `key:value` pairs.
    // 与_.where类似，但是只返回第一个值
    _.findWhere = function(obj, attrs) {
        return _.find(obj, _.matcher(attrs));
    };

    // Return the maximum element (or element-based computation).
    // 返回list中的最大值，list为空则返回-Infinity
    _.max = function(obj, iteratee, context) {
        // 初始化定义为list为空的情况
        var result = -Infinity,
            lastComputed = -Infinity,
            value, computed;
        // 判断list存在但迭代函数不存在的情况
        if (iteratee == null && obj != null) {
            // 确定obj是否为类数组对象，不是这提取obj的值数组
            obj = isArrayLike(obj) ? obj : _.values(obj);
            // 冒泡取得最大值
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value > result) {
                    result = value;
                }
            }
        } else {
            // 处理迭代函数
            iteratee = cb(iteratee, context);
            // 迭代函数对每个值进行处理
            _.each(obj, function(value, index, list) {
                // 每次获取一个新的结果值
                computed = iteratee(value, index, list);
                // 与前一次作比较，如果当前值更大，则结果为当前对象，保存当前对象的结果值
                if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                    result = value;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };

    // Return the minimum element (or element-based computation).
    // 与_.max 一致
    _.min = function(obj, iteratee, context) {
        var result = Infinity,
            lastComputed = Infinity,
            value, computed;
        if (iteratee == null && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value < result) {
                    result = value;
                }
            }
        } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function(value, index, list) {
                computed = iteratee(value, index, list);
                if (computed < lastComputed || computed === Infinity && result === Infinity) {
                    result = value;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };

    // Shuffle a collection, using the modern version of the
    // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
    // 生成一个乱序的list
    _.shuffle = function(obj) {
        // 判断是否为类数组对象，不是则提取obj的值组成数组
        var set = isArrayLike(obj) ? obj : _.values(obj);
        var length = set.length;
        var shuffled = Array(length); // 创建一个等长的数组
        for (var index = 0, rand; index < length; index++) {
            // 随机取一个index
            rand = _.random(0, index);
            // 将新生成的shuffled数组打乱，感觉此处的处理挺巧妙的！
            if (rand !== index) shuffled[index] = shuffled[rand];
            shuffled[rand] = set[index];
        }
        return shuffled;
    };

    // Sample **n** random values from a collection.
    // If **n** is not specified, returns a single random element.
    // The internal `guard` argument allows it to work with `map`.
    /**
     * 生成一个乱序的数组，可以指定数组长度
     * @param {*} obj 
     * @param {*} n 指定长度
     * @param {*} guard 
     */
    _.sample = function(obj, n, guard) {
        // 如果没有设置长度n，或者guard设置为true，随机返回一个数值
        if (n == null || guard) {
            if (!isArrayLike(obj)) obj = _.values(obj);
            return obj[_.random(obj.length - 1)];
        }
        // 先生成一个随机数组，然后截出指定长度的数组
        return _.shuffle(obj).slice(0, Math.max(0, n));
    };

    // Sort the object's values by a criterion produced by an iteratee.
    // 返回一个排序后的list拷贝副本
    _.sortBy = function(obj, iteratee, context) {
        // 处理迭代函数
        iteratee = cb(iteratee, context);
        // 1.用_.map针对每个对象用迭代函数生成一个值
        // 2.用_.sort利用1中生成的值进行排序
        // 3.针对_.sort生成的数组，提取value(即原传入list中的值)生成结果
        return _.pluck(_.map(obj, function(value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iteratee(value, index, list)
            };
        }).sort(function(left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === void 0) return 1;
                if (a < b || b === void 0) return -1;
            }
            return left.index - right.index;
        }), 'value');
    };

    // An internal function used for aggregate "group by" operations.
    // _.groupBy内部函数
    var group = function(behavior) {
        // 返回一个闭包
        return function(obj, iteratee, context) {
            // 先定义一个空对象用于存储结果
            var result = {};
            // 处理迭代函数
            iteratee = cb(iteratee, context);
            // 针对每一个值进行处理
            _.each(obj, function(value, index) {
                // 用用户定义的迭代函数处理每个对象
                var key = iteratee(value, index, obj);
                // 调用上一层函数(如_.groupBy)传入的处理函数
                behavior(result, value, key);
            });
            return result;
        };
    };

    // Groups the object's values by a criterion. Pass either a string attribute
    // to group by, or a function that returns the criterion.
    // 把一个集合分组为多个集合，通过 iterator 返回的结果进行分组
    _.groupBy = group(function(result, value, key) {
        // 判断result中是否有key对应的键值
        // 如果有，key针对的键值用塞入value
        if (_.has(result, key)) result[key].push(value);
        // 否则新建一个属性存储该键值
        else result[key] = [value];
    });

    // Indexes the object's values by a criterion, similar to `groupBy`, but for
    // when you know that your index values will be unique.
    // 给定一个list，和 一个用来返回一个在列表中的每个元素键 的iterator 函数（或属性名）， 返回一个每一项索引的对象
    _.indexBy = group(function(result, value, key) {
        // 直接用value当做key保存value
        result[key] = value;
    });

    // Counts instances of an object that group by a certain criterion. Pass
    // either a string attribute to count by, or a function that returns thecriterion.
    // 排序一个列表组成一个组，并且返回各组中的对象的数量的计数
    _.countBy = group(function(result, value, key) {
        // 如果存在该value的key，+1
        if (_.has(result, key)) result[key]++;
        // 否则新建一个key值
        else result[key] = 1;
    });

    // Safely create a real, live array from anything iterable.
    // 把list(任何可以迭代的对象)转换成一个数组
    _.toArray = function(obj) {
        if (!obj) return [];
        // 如果传入一个数组对象，则直接slice处理成数组
        if (_.isArray(obj)) return slice.call(obj);
        // 如果传入一个类数组对象，则直接slice处理成数组
        if (isArrayLike(obj)) return _.map(obj, _.identity);
        // 否则直接返回obj值生成的数组
        return _.values(obj);
    };

    // Return the number of elements in an object.
    _.size = function(obj) {
        // null 则返回0
        if (obj == null) return 0;
        // 类数组则返回length，否则看谁对象key的数量
        return isArrayLike(obj) ? obj.length : _.keys(obj).length;
    };

    // Split a collection into two arrays: one whose elements all satisfy the given
    // predicate, and one whose elements all do not satisfy the predicate.
    // 拆分一个数组（array）为两个数组：  第一个数组其元素都满足predicate迭代函数， 而第二个的所有元素均不能满足
    _.partition = function(obj, predicate, context) {
        // 先处理过滤函数
        predicate = cb(predicate, context);
        var pass = [],
            fail = [];
        // 针对每一个对象做处理，通过过滤函数的push进pass数组，否则push进fail数组
        _.each(obj, function(value, key, obj) {
            (predicate(value, key, obj) ? pass : fail).push(value);
        });
        return [pass, fail];
    };

    // Array Functions
    // ---------------

    // Get the first element of an array. Passing **n** will return the first N
    // values in the array. Aliased as `head` and `take`. The **guard** check
    // allows it to work with `_.map`.
    // 返回array（数组）的第一个元素，传递 n参数将返回数组中从第一个元素开始的n个元素
    _.first = _.head = _.take = function(array, n, guard) {
        // null返回undefined
        if (array == null) return void 0;
        // n为null则返回第一个，n这返回前n个
        if (n == null || guard) return array[0];
        return _.initial(array, array.length - n);
    };

    // Returns everything but the last entry of the array. Especially useful on
    // the arguments object. Passing **n** will return all the values in
    // the array, excluding the last N.
    // 返回数组中除了最后一个元素外的其他全部元素，传递 n参数将从结果中排除从最后一个开始的n个元素
    _.initial = function(array, n, guard) {
        // 利用slice截取数组
        return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
    };

    // Get the last element of an array. Passing **n** will return the last N
    // values in the array.
    // 返回array（数组）的最后一个元素。传递 n参数将返回数组中从最后一个元素开始的n个元素
    // 同_.first
    _.last = function(array, n, guard) {
        if (array == null) return void 0;
        if (n == null || guard) return array[array.length - 1];
        return _.rest(array, Math.max(0, array.length - n));
    };

    // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
    // Especially useful on the arguments object. Passing an **n** will return
    // the rest N values in the array.
    // 返回数组中除了第一个元素外的其他全部元素。传递 index 参数将返回从index开始的剩余所有元素 。
    // 同_.initial
    _.rest = _.tail = _.drop = function(array, n, guard) {
        return slice.call(array, n == null || guard ? 1 : n);
    };

    // Trim out all falsy values from an array.
    // 返回一个除去所有false值的 array副本。 在javascript中, false, null, 0, "", undefined 和 NaN 都是false值.
    _.compact = function(array) {
        return _.filter(array, _.identity);
    };

    // Internal implementation of a recursive `flatten` function.
    var flatten = function(input, shallow, strict, startIndex) {
        // 定义输出数组，index
        var output = [],
            idx = 0;
        for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
            // 获取数组每个值
            var value = input[i];
            // 判断是否为类数组
            if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                //flatten current level of array or arguments object
                // 如果是类数组且设置shallow为true，递归调用flatten
                if (!shallow) value = flatten(value, shallow, strict);
                // 将value塞入到output中
                var j = 0,
                    len = value.length;
                output.length += len;
                while (j < len) {
                    output[idx++] = value[j++];
                }
            } else if (!strict) {
                // 单个值直接塞入output
                output[idx++] = value;
            }
        }
        return output;
    };

    // Flatten out an array, either recursively (by default), or just one level.
    // 将一个嵌套多层的数组 array（数组） (嵌套可以是任何层数)转换为只有一层的数组。 
    // 如果你传递 shallow参数，数组将只减少一维的嵌套。
    _.flatten = function(array, shallow) {
        return flatten(array, shallow, false);
    };

    // Return a version of the array that does not contain the specified value(s).
    // 返回一个删除所有values值后的 array副本。
    _.without = function(array) {
        return _.difference(array, slice.call(arguments, 1));
    };

    // Produce a duplicate-free version of the array. If the array has already
    // been sorted, you have the option of using a faster algorithm.
    // Aliased as `unique`.
    // 返回 array去重后的副本，如果您确定 array 已经排序, 那么给 isSorted 参数传递 true值, 此函数将运行的更快的算法. 
    // 如果要处理对象元素, 传递 iteratee函数来获取要对比的属性.
    _.uniq = _.unique = function(array, isSorted, iteratee, context) {
        // 首先判断是否有序，如果isSorted不是bool值，等于false
        if (!_.isBoolean(isSorted)) {
            context = iteratee;
            iteratee = isSorted;
            isSorted = false;
        }

        if (iteratee != null) iteratee = cb(iteratee, context);
        var result = [];
        var seen = [];
        // 遍历数组
        for (var i = 0, length = getLength(array); i < length; i++) {
            // 获取当前值，如果存在iteratee则用它取得计算值，否则直接用当前索引对应的值
            var value = array[i],
                computed = iteratee ? iteratee(value, i, array) : value;

            if (isSorted) {
                // 如果是第一个值，或者上一个计算值不等于当前计算值则直接加入当前值
                if (!i || seen !== computed) result.push(value);
                seen = computed;
            } else if (iteratee) {
                // 如果有iteratee
                if (!_.contains(seen, computed)) {
                    // 如果已看过的值中没有当前计算值，没有的话push进result
                    seen.push(computed);
                    result.push(value);
                }
            } else if (!_.contains(result, value)) {
                // 否则直接判断结果中是否有当前值
                result.push(value);
            }
        }
        return result;
    };

    // Produce an array that contains the union: each distinct element from all of
    // the passed-in arrays.
    // 先将所有的参数平整化，然后再唯一化
    _.union = function() {
        return _.uniq(flatten(arguments, true, true));
    };

    // Produce an array that contains every item shared between all the
    // passed-in arrays.
    // 返回传入 arrays（数组）交集。结果中的每个值是存在于传入的每个arrays（数组）里。
    /**
     * @param {*[]} array 第一个数组，因为是取交集，只要找出第一个数组中存在于其他数组中的元素即可 
     */
    _.intersection = function(array) {
        // 定义一个结果数组
        var result = [];
        // 获取arguments的长度
        var argsLength = arguments.length;
        // 遍历第一个数组array
        for (var i = 0, length = getLength(array); i < length; i++) {
            var item = array[i];
            // 首先判断当前元素在结果中是否存在，存在则跳过
            if (_.contains(result, item)) continue;
            // 遍历arguments,如果当前元素不存在于某一个数组中,跳过
            for (var j = 1; j < argsLength; j++) {
                if (!_.contains(arguments[j], item)) break;
            }
            // 如果所有的arguments都遍历完了,将当前数组push到结果数组中
            if (j === argsLength) result.push(item);
        }
        return result;
    };

    // Take the difference between one array and a number of other arrays.
    // Only the elements present in just the first array will remain.
    // 类似于without，但返回的值来自array参数数组，并且不存在于other 数组.
    _.difference = function(array) {
        // 将参数合并成一个一维数组
        var rest = flatten(arguments, true, true, 1);
        // 找出存在于合并数组但不在第后续参数中的值
        return _.filter(array, function(value) {
            return !_.contains(rest, value);
        });
    };

    // Zip together multiple lists into a single array -- elements that share
    // an index go together.
    // 将每个arrays中相应位置的值合并在一起。
    _.zip = function() {
        // 针对arguments执行_.unzip
        return _.unzip(arguments);
    };

    // Complement of _.zip. Unzip accepts an array of arrays and groups
    // each array's elements on shared indices
    // 给定若干arrays，返回一串联的新数组，其第一元素个包含所有的输入数组的第一元素，其第二包含了所有的第二元素，依此类推
    _.unzip = function(array) {
        // 获取最长的数组的长度
        var length = array && _.max(array, getLength).length || 0;
        var result = Array(length);

        // 萃取每个数组中第index个元素组成数组
        for (var index = 0; index < length; index++) {
            result[index] = _.pluck(array, index);
        }
        return result;
    };

    // Converts lists into objects. Pass either a single array of `[key, value]`
    // pairs, or two parallel arrays of the same length -- one of keys, and one of
    // the corresponding values.
    // 将数组转换为对象。传递任何一个单独[key, value]对的列表，或者一个键的列表和一个值的列表。 如果存在重复键，最后一个值将被返回。
    _.object = function(list, values) {
        // 定义结果空数组
        var result = {};
        // 遍历每个list
        for (var i = 0, length = getLength(list); i < length; i++) {
            // 如果有values参数，表示前一个数组为键，后一个数组为值，一一对应
            if (values) {
                result[list[i]] = values[i];
            } else {
                // 否则，将每个数组转换为对象的键值，第一个数据为键，第二个为值
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    };

    // Generator function to create the findIndex and findLastIndex functions
    // _.findIndex 和 _.findLastIndex 的底层函数
    function createPredicateIndexFinder(dir) {
        // 闭包,返回一个函数
        return function(array, predicate, context) {
            // 处理迭代函数
            predicate = cb(predicate, context);
            // 获取数组长度
            var length = getLength(array);
            // 判断顺序或者倒序
            var index = dir > 0 ? 0 : length - 1;
            // 遍历数组
            for (; index >= 0 && index < length; index += dir) {
                // 如果校验通过,返回index
                if (predicate(array[index], index, array)) return index;
            }
            return -1;
        };
    }

    // Returns the first index on an array-like that passes a predicate test
    // 类似于_.indexOf，当predicate通过真检查时，返回第一个索引值；否则返回-1
    _.findIndex = createPredicateIndexFinder(1);
    // 和_.findIndex类似，但反向迭代数组，当predicate通过真检查时，最接近末端的索引值将被返回
    _.findLastIndex = createPredicateIndexFinder(-1);

    // Use a comparator function to figure out the smallest index at which
    // an object should be inserted so as to maintain order. Uses binary search.
    // 使用二分查找确定value在list中的位置序号，value按此序号插入能保持list原有的排序
    _.sortedIndex = function(array, obj, iteratee, context) {
        // 处理迭代函数
        iteratee = cb(iteratee, context, 1);

        var value = iteratee(obj);
        var low = 0,
            high = getLength(array);
        while (low < high) {
            var mid = Math.floor((low + high) / 2);
            if (iteratee(array[mid]) < value) low = mid + 1;
            else high = mid;
        }
        return low;
    };

    // Generator function to create the indexOf and lastIndexOf functions
    /**
     * 
     * @param {*} dir 区分_.indexOf 和 _.lastIndexOf
     * @param {*} predicateFind _.findIndex || _.findLastIndex
     * @param {*} sortedIndex _.sortedIndex(list, value, [iteratee], [context]) 
     *              使用二分查找确定value在list中的位置序号
     */
    function createIndexFinder(dir, predicateFind, sortedIndex) {
        return function(array, item, idx) {
            var i = 0,
                length = getLength(array); // 获取传入数组的长度
            // 校验传入的起始位置的参数是否为数值
            if (typeof idx == 'number') {
                // 确定起始位置
                if (dir > 0) {
                    i = idx >= 0 ? idx : Math.max(idx + length, i);
                } else {
                    length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
                }
            } else if (sortedIndex && idx && length) {
                // 如果idx不是数值，则在array中直接寻找item
                idx = sortedIndex(array, item);
                // 再次校验item是否在array中，如果在，返回index
                return array[idx] === item ? idx : -1;
            }
            // 处理item是NaN的情况
            if (item !== item) {
                idx = predicateFind(slice.call(array, i, length), _.isNaN);
                return idx >= 0 ? idx + i : -1;
            }
            // 常规流程，遍历i到length之间的元素，找出需要的元素，返回index
            for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
                if (array[idx] === item) return idx;
            }
            return -1;
        };
    }

    // Return the position of the first occurrence of an item in an array,
    // or -1 if the item is not included in the array.
    // If the array is large and already in sort order, pass `true`
    // for **isSorted** to use binary search.
    _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
    _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](http://docs.python.org/library/functions.html#range).
    _.range = function(start, stop, step) {
        if (stop == null) {
            stop = start || 0;
            start = 0;
        }
        step = step || 1;

        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var range = Array(length);

        for (var idx = 0; idx < length; idx++, start += step) {
            range[idx] = start;
        }

        return range;
    };

    // Function (ahem) Functions
    // ------------------

    // Determines whether to execute a function as a constructor
    // or a normal function with the provided arguments
    var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
        if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
        var self = baseCreate(sourceFunc.prototype);
        var result = sourceFunc.apply(self, args);
        if (_.isObject(result)) return result;
        return self;
    };

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
    // available.
    _.bind = function(func, context) {
        if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
        var args = slice.call(arguments, 2);
        var bound = function() {
            return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
        };
        return bound;
    };

    // Partially apply a function by creating a version that has had some of its
    // arguments pre-filled, without changing its dynamic `this` context. _ acts
    // as a placeholder, allowing any combination of arguments to be pre-filled.
    _.partial = function(func) {
        var boundArgs = slice.call(arguments, 1);
        var bound = function() {
            var position = 0,
                length = boundArgs.length;
            var args = Array(length);
            for (var i = 0; i < length; i++) {
                args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
            }
            while (position < arguments.length) args.push(arguments[position++]);
            return executeBound(func, bound, this, this, args);
        };
        return bound;
    };

    // Bind a number of an object's methods to that object. Remaining arguments
    // are the method names to be bound. Useful for ensuring that all callbacks
    // defined on an object belong to it.  
    // 把methodNames参数指定的一些方法绑定到object上，这些方法就会在对象的上下文环境中执行。 
    _.bindAll = function(obj) {
        // 定义变量，获取参数的长度
        var i, length = arguments.length,
            key;
        // 参数必须为两个个或以上
        if (length <= 1) throw new Error('bindAll must be passed function names');
        // 遍历绑定
        for (i = 1; i < length; i++) {
            key = arguments[i];
            obj[key] = _.bind(obj[key], obj);
        }
        return obj;
    };

    // Memoize an expensive function by storing its results.
    // Memoizes方法可以缓存某函数的计算结果。
    _.memoize = function(func, hasher) {
        // 闭包
        var memoize = function(key) {
            // 获取cache
            var cache = memoize.cache;
            // 如果传入函数hasher，则利用hasher计算出缓存值
            var address = '' + (hasher ? hasher.apply(this, arguments) : key);
            // 如果cache中没有缓存的该值，则通过func计算出来
            if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
            // 返回缓存的值
            return cache[address];
        };
        // 初始化cache
        memoize.cache = {};
        // 返回闭包
        return memoize;
    };

    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    // 类似setTimeout，等待wait毫秒后调用function。
    _.delay = function(func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function() {
            return func.apply(null, args);
        }, wait);
    };

    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    // 延迟调用function直到当前调用栈清空为止，类似使用延时为0的setTimeout方法。
    _.defer = _.partial(_.delay, _, 1);

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    // 创建并返回一个像节流阀一样的函数，当重复调用函数的时候，至少每隔 wait毫秒调用一次该函数。
    _.throttle = function(func, wait, options) {
        // 定义变量及初始化
        var context, args, result; // context: 上下文/ args: 参数 / result: 结果，及调用func
        var timeout = null; // 调用间隔时间
        var previous = 0; // 上一次调用时间
        if (!options) options = {};
        // 调用func
        var later = function() {
            // 调用时，previous清零或者等于此时
            previous = options.leading === false ? 0 : _.now();
            // 清除间隔时间
            timeout = null;
            // 调用func方法
            result = func.apply(context, args);
            // 置空上下文和参数
            if (!timeout) context = args = null;
        };
        // 返回闭包
        return function() {
            // 获得当前时间
            var now = _.now();
            // 保存previous
            if (!previous && options.leading === false) previous = now;
            // 计算等待了多久(等待时间)
            var remaining = wait - (now - previous);
            // 记录上下文和参数
            context = this;
            args = arguments;
            // 初次和等待时间超过wait时触发func
            if (remaining <= 0 || remaining > wait) {
                // 清空timeout
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                // 保存previous
                previous = now;
                // 调用result
                result = func.apply(context, args);
                // 清空上下文和参数
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                // 等待remaining时间再触发
                timeout = setTimeout(later, remaining);
            }
            // 返回闭包
            return result;
        };
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    // 返回 function 函数的防反跳版本, 将延迟函数的执行(真正的执行)在函数最后一次调用时刻的 wait 毫秒之后.
    _.debounce = function(func, wait, immediate) {
        // 定义变量
        var timeout, args, context, timestamp, result;

        // later及待执行的函数
        var later = function() {
            // 判断还有多久执行
            var last = _.now() - timestamp;

            if (last < wait && last >= 0) {
                // 未到时间，延迟
                timeout = setTimeout(later, wait - last);
            } else {
                // 清空时间戳
                timeout = null;
                if (!immediate) {
                    // 创建result函数
                    result = func.apply(context, args);
                    // 清空上下文和参数
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            // 保存上下文和参数、时间戳
            context = this;
            args = arguments;
            timestamp = _.now();
            // 判断是否立即执行
            var callNow = immediate && !timeout;
            // 如果timeout不存在，定时执行later函数
            if (!timeout) timeout = setTimeout(later, wait);
            // 如果立即执行，则创建result函数，重置上下文和参数
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };

    // Returns the first function passed as an argument to the second,
    // allowing you to adjust arguments, run code before and after, and
    // conditionally execute the original function.
    // 将第一个函数 function 封装到函数 wrapper 里面, 并把函数 function 作为第一个参数传给 wrapper. 
    // 这样可以让 wrapper 在 function 运行之前和之后 执行代码, 调整参数然后附有条件地执行.
    _.wrap = function(func, wrapper) {
        return _.partial(wrapper, func);
    };

    // Returns a negated version of the passed-in predicate.
    // 返回一个新的predicate函数的否定版本。
    _.negate = function(predicate) {
        // 闭包
        return function() {
            return !predicate.apply(this, arguments);
        };
    };

    // Returns a function that is the composition of a list of functions, each
    // consuming the return value of the function that follows.
    // 返回函数集 functions 组合后的复合函数, 也就是一个函数执行完之后把返回的结果再作为参数赋给下一个函数来执行. 
    _.compose = function() {
        // 获取arguments
        var args = arguments;
        // 从倒数第一个函数开始执行
        var start = args.length - 1;
        return function() {
            var i = start;
            // 执行倒数第一个函数
            var result = args[start].apply(this, arguments);
            // 把每一段函数执行的结果当做参数传递到下一个函数
            while (i--) result = args[i].call(this, result);
            return result;
        };
    };

    // Returns a function that will only be executed on and after the Nth call.
    // 创建一个函数, 只有在运行了 count 次之后才有效果.
    _.after = function(times, func) {
        // 闭包
        return function() {
            // 当执行到最后一次，才触发真正的效果
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };

    // Returns a function that will only be executed up to (but not including) the Nth call.
    // 创建一个函数,调用不超过count 次。 当count已经达到时，最后一个函数调用的结果将被记住并返回。
    _.before = function(times, func) {
        var memo;
        // 返回闭包
        return function() {
            // 执行times次之前，保存结果
            if (--times > 0) {
                memo = func.apply(this, arguments);
            }
            // 次数达到，函数置空，直接返回结果
            if (times <= 1) func = null;
            return memo;
        };
    };

    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    // 创建一个只能调用一次的函数。重复调用改进的方法也没有效果，只会返回第一次执行时的结果。
    _.once = _.partial(_.before, 2);

    // Object Functions
    // ----------------

    // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
    // IE < 9 下 不能用 for key in ... 来枚举对象的某些 key
    // 比如重写了对象的 `toString` 方法，这个 key 值就不能在 IE < 9 下用 for in 枚举到
    // IE < 9，{toString: null}.propertyIsEnumerable('toString') 返回 false
    // IE < 9，重写的 `toString` 属性被认为不可枚举
    var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
    // IE < 9 下不能用 for in 来枚举的 key 值集合
    var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
        'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'
    ];

    function collectNonEnumProps(obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length;
        var constructor = obj.constructor;
        // proto 是否是继承的 prototype
        var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

        // Constructor is a special case.
        // `constructor` 属性需要特殊处理
        // 如果 obj 有 `constructor` 这个 key
        // 并且该 key 没有在 keys 数组中 存入数组
        var prop = 'constructor';
        if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

        // nonEnumerableProps 数组中的 keys
        while (nonEnumIdx--) {
            prop = nonEnumerableProps[nonEnumIdx];
            // prop in obj 应该肯定返回 true 吧？是否不必要？
            // obj[prop] !== proto[prop] 判断该 key 是否来自于原型链
            if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
                keys.push(prop);
            }
        }
    }

    // Retrieve the names of an object's own properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    // 检索object拥有的所有可枚举属性的名称。
    _.keys = function(obj) {
        // 如果不是对象，返回空对象
        if (!_.isObject(obj)) return [];
        // 原生Object.keys方法
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        // 遍历obj，push key
        for (var key in obj)
            if (_.has(obj, key)) keys.push(key);
            // Ahem, IE < 9.
            // 如果存在IE9不兼容的问题，用兼容方法解决
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };

    // Retrieve all the property names of an object.
    // 检索object拥有的和继承的所有属性的名称。
    _.allKeys = function(obj) {
        if (!_.isObject(obj)) return [];
        var keys = [];
        for (var key in obj) keys.push(key);
        // Ahem, IE < 9.
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };

    // Retrieve the values of an object's properties.
    // 返回object对象所有的属性值。
    _.values = function(obj) {
        // 获取keys集合
        var keys = _.keys(obj);
        // 根据keys 长度获取一个新数组
        var length = keys.length;
        var values = Array(length);
        // 遍历获取所有的value
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    };

    // Returns the results of applying the iteratee to each element of the object
    // In contrast to _.map it returns an object
    _.mapObject = function(obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = _.keys(obj),
            length = keys.length,
            results = {},
            currentKey;
        for (var index = 0; index < length; index++) {
            currentKey = keys[index];
            results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    };

    // Convert an object into a list of `[key, value]` pairs.
    _.pairs = function(obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var pairs = Array(length);
        for (var i = 0; i < length; i++) {
            pairs[i] = [keys[i], obj[keys[i]]];
        }
        return pairs;
    };

    // Invert the keys and values of an object. The values must be serializable.
    _.invert = function(obj) {
        var result = {};
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            result[obj[keys[i]]] = keys[i];
        }
        return result;
    };

    // Return a sorted list of the function names available on the object.
    // Aliased as `methods`
    _.functions = _.methods = function(obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };

    // Extend a given object with all the properties in passed-in object(s).
    _.extend = createAssigner(_.allKeys);

    // Assigns a given object with all the own properties in the passed-in object(s)
    // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
    _.extendOwn = _.assign = createAssigner(_.keys);

    // Returns the first key on an object that passes a predicate test
    _.findKey = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = _.keys(obj),
            key;
        for (var i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            if (predicate(obj[key], key, obj)) return key;
        }
    };

    // Return a copy of the object only containing the whitelisted properties.
    _.pick = function(object, oiteratee, context) {
        var result = {},
            obj = object,
            iteratee, keys;
        if (obj == null) return result;
        if (_.isFunction(oiteratee)) {
            keys = _.allKeys(obj);
            iteratee = optimizeCb(oiteratee, context);
        } else {
            keys = flatten(arguments, false, false, 1);
            iteratee = function(value, key, obj) { return key in obj; };
            obj = Object(obj);
        }
        for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            var value = obj[key];
            if (iteratee(value, key, obj)) result[key] = value;
        }
        return result;
    };

    // Return a copy of the object without the blacklisted properties.
    _.omit = function(obj, iteratee, context) {
        if (_.isFunction(iteratee)) {
            iteratee = _.negate(iteratee);
        } else {
            var keys = _.map(flatten(arguments, false, false, 1), String);
            iteratee = function(value, key) {
                return !_.contains(keys, key);
            };
        }
        return _.pick(obj, iteratee, context);
    };

    // Fill in a given object with default properties.
    _.defaults = createAssigner(_.allKeys, true);

    // Creates an object that inherits from the given prototype object.
    // If additional properties are provided then they will be added to the
    // created object.
    _.create = function(prototype, props) {
        var result = baseCreate(prototype);
        if (props) _.extendOwn(result, props);
        return result;
    };

    // Create a (shallow-cloned) duplicate of an object.
    _.clone = function(obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };

    // Invokes interceptor with the obj, and then returns obj.
    // The primary purpose of this method is to "tap into" a method chain, in
    // order to perform operations on intermediate results within the chain.
    _.tap = function(obj, interceptor) {
        interceptor(obj);
        return obj;
    };

    // Returns whether an object has a given set of `key:value` pairs.
    _.isMatch = function(object, attrs) {
        var keys = _.keys(attrs),
            length = keys.length;
        if (object == null) return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            if (attrs[key] !== obj[key] || !(key in obj)) return false;
        }
        return true;
    };


    // Internal recursive comparison function for `isEqual`.
    var eq = function(a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) return a === b;
        // Unwrap any wrapped objects.
        if (a instanceof _) a = a._wrapped;
        if (b instanceof _) b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, regular expressions, dates, and booleans are compared by value.
            case '[object RegExp]':
                // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return '' + a === '' + b;
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive.
                // Object(NaN) is equivalent to NaN
                if (+a !== +a) return +b !== +b;
                // An `egal` comparison is performed for other numeric values.
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a === +b;
        }

        var areArrays = className === '[object Array]';
        if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object') return false;

            // Objects with different constructors are not equivalent, but `Object`s or `Array`s
            // from different frames are.
            var aCtor = a.constructor,
                bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                    _.isFunction(bCtor) && bCtor instanceof bCtor) &&
                ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a) return bStack[length] === b;
        }

        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);

        // Recursively compare objects and arrays.
        if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length) return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
                if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            // Deep compare objects.
            var keys = _.keys(a),
                key;
            length = keys.length;
            // Ensure that both objects contain the same number of properties before comparing deep equality.
            if (_.keys(b).length !== length) return false;
            while (length--) {
                // Deep compare each member
                key = keys[length];
                if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true;
    };

    // Perform a deep comparison to check if two objects are equal.
    _.isEqual = function(a, b) {
        return eq(a, b);
    };

    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    _.isEmpty = function(obj) {
        if (obj == null) return true;
        if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
        return _.keys(obj).length === 0;
    };

    // Is a given value a DOM element?
    _.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };

    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray
    _.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) === '[object Array]';
    };

    // Is a given variable an object?
    _.isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
    _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
        _['is' + name] = function(obj) {
            return toString.call(obj) === '[object ' + name + ']';
        };
    });

    // Define a fallback version of the method in browsers (ahem, IE < 9), where
    // there isn't any inspectable "Arguments" type.
    if (!_.isArguments(arguments)) {
        _.isArguments = function(obj) {
            return _.has(obj, 'callee');
        };
    }

    // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
    // IE 11 (#1621), and in Safari 8 (#1929).
    if (typeof /./ != 'function' && typeof Int8Array != 'object') {
        _.isFunction = function(obj) {
            return typeof obj == 'function' || false;
        };
    }

    // Is a given object a finite number?
    _.isFinite = function(obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
    };

    // Is the given value `NaN`? (NaN is the only number which does not equal itself).
    _.isNaN = function(obj) {
        return _.isNumber(obj) && obj !== +obj;
    };

    // Is a given value a boolean?
    _.isBoolean = function(obj) {
        return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
    };

    // Is a given value equal to null?
    _.isNull = function(obj) {
        return obj === null;
    };

    // Is a given variable undefined?
    _.isUndefined = function(obj) {
        return obj === void 0;
    };

    // Shortcut function for checking if an object has a given property directly
    // on itself (in other words, not on a prototype).
    _.has = function(obj, key) {
        return obj != null && hasOwnProperty.call(obj, key);
    };

    // Utility Functions
    // -----------------

    // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
    // previous owner. Returns a reference to the Underscore object.
    _.noConflict = function() {
        root._ = previousUnderscore;
        return this;
    };

    // Keep the identity function around for default iteratees.
    _.identity = function(value) {
        return value;
    };

    // Predicate-generating functions. Often useful outside of Underscore.
    _.constant = function(value) {
        return function() {
            return value;
        };
    };

    _.noop = function() {};

    _.property = property;

    // Generates a function for a given object that returns a given property.
    _.propertyOf = function(obj) {
        return obj == null ? function() {} : function(key) {
            return obj[key];
        };
    };

    // Returns a predicate for checking whether an object has a given set of
    // `key:value` pairs.
    _.matcher = _.matches = function(attrs) {
        attrs = _.extendOwn({}, attrs);
        return function(obj) {
            return _.isMatch(obj, attrs);
        };
    };

    // Run a function **n** times.
    _.times = function(n, iteratee, context) {
        var accum = Array(Math.max(0, n));
        iteratee = optimizeCb(iteratee, context, 1);
        for (var i = 0; i < n; i++) accum[i] = iteratee(i);
        return accum;
    };

    // Return a random integer between min and max (inclusive).
    _.random = function(min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    // A (possibly faster) way to get the current timestamp as an integer.
    _.now = Date.now || function() {
        return new Date().getTime();
    };

    // List of HTML entities for escaping.
    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    };
    var unescapeMap = _.invert(escapeMap);

    // Functions for escaping and unescaping strings to/from HTML interpolation.
    var createEscaper = function(map) {
        var escaper = function(match) {
            return map[match];
        };
        // Regexes for identifying a key that needs to be escaped
        var source = '(?:' + _.keys(map).join('|') + ')';
        var testRegexp = RegExp(source);
        var replaceRegexp = RegExp(source, 'g');
        return function(string) {
            string = string == null ? '' : '' + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
    };
    _.escape = createEscaper(escapeMap);
    _.unescape = createEscaper(unescapeMap);

    // If the value of the named `property` is a function then invoke it with the
    // `object` as context; otherwise, return it.
    _.result = function(object, property, fallback) {
        var value = object == null ? void 0 : object[property];
        if (value === void 0) {
            value = fallback;
        }
        return _.isFunction(value) ? value.call(object) : value;
    };

    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

    var escapeChar = function(match) {
        return '\\' + escapes[match];
    };

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    // NB: `oldSettings` only exists for backwards compatibility.
    _.template = function(text, settings, oldSettings) {
        if (!settings && oldSettings) settings = oldSettings;
        settings = _.defaults({}, settings, _.templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, escapeChar);
            index = offset + match.length;

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            } else if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offest.
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + 'return __p;\n';

        try {
            var render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        var template = function(data) {
            return render.call(this, data, _);
        };

        // Provide the compiled source as a convenience for precompilation.
        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';

        return template;
    };

    // Add a "chain" function. Start chaining a wrapped Underscore object.
    _.chain = function(obj) {
        var instance = _(obj);
        instance._chain = true;
        return instance;
    };

    // OOP
    // ---------------
    // If Underscore is called as a function, it returns a wrapped object that
    // can be used OO-style. This wrapper holds altered versions of all the
    // underscore functions. Wrapped objects may be chained.

    // Helper function to continue chaining intermediate results.
    var result = function(instance, obj) {
        return instance._chain ? _(obj).chain() : obj;
    };

    // Add your own custom functions to the Underscore object.
    _.mixin = function(obj) {
        _.each(_.functions(obj), function(name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function() {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return result(this, func.apply(_, args));
            };
        });
    };

    // Add all of the Underscore functions to the wrapper object.
    _.mixin(_);

    // Add all mutator Array functions to the wrapper.
    _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
            return result(this, obj);
        };
    });

    // Add all accessor Array functions to the wrapper.
    _.each(['concat', 'join', 'slice'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            return result(this, method.apply(this._wrapped, arguments));
        };
    });

    // Extracts the result from a wrapped and chained object.
    _.prototype.value = function() {
        return this._wrapped;
    };

    // Provide unwrapping proxy for some methods used in engine operations
    // such as arithmetic and JSON stringification.
    _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

    _.prototype.toString = function() {
        return '' + this._wrapped;
    };

    // AMD registration happens at the end for compatibility with AMD loaders
    // that may not enforce next-turn semantics on modules. Even though general
    // practice for AMD registration is to be anonymous, underscore registers
    // as a named module because, like jQuery, it is a base library that is
    // popular enough to be bundled in a third party lib, but not be part of
    // an AMD load request. Those cases could generate an error when an
    // anonymous define() is called outside of a loader request.
    if (typeof define === 'function' && define.amd) {
        define('underscore', [], function() {
            return _;
        });
    }
}.call(this));