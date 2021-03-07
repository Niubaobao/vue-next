//vue2.0 响应式原理的实现
var oldProto = Array.prototype
var proto = Object.create(oldProto) //创建一个新的实例 调用实例方法不会影响Array（不能重写原型 因为有些数据是不需要监听的）

var arr = ['push', 'shift', 'unshift']
arr.forEach(method => {
  //需要重写的方法。。'push', 'shift', 'unshift' 等等
  proto[method] = function() {
    //函数劫持
    updateView()
    oldProto[method].call(this, ...arguments)
  }
})

function observer(target) {
  if (typeof target !== 'object' || target == null) {
    return target
  }

  if (Array.isArray(target)) {
    //拦截数组 对数组的方法进行重写
    //target.__proto__ = proto
    Object.setPrototypeOf(target, proto)
  }

  // 问题：缺点  如果属性不存在 新增的属性不会变成响应式的
  for (let key in target) {
    defineReactive(target, key, target[key])
  }
}

// 重新定义get set
function defineReactive(target, key, value) {
  observer(value) // 递归监听
  Object.defineProperty(target, key, {
    get() {
      //这里面会进行依赖收集
      return value
    },
    set(newValue) {
      if (value !== newValue) {
        //设置的值也可能是个对象，所以要重写get set
        observer(newValue)
        updateView()
        value = newValue
      }
    }
  })
}

//更新视图
function updateView() {
  console.log('更新视图')
}

// 使用object
// var data = {
//   name: 'chesijia',
//   age: { n: 10 }
// }
// observer(data)
// data.name = 'zhangyachao'
// data.age.n = 20
// data.age = { n: 200 }
// data.age.n = 10

// console.log(data.age.name)

var data = {
  name: 'chesijia',
  age: [1, 2, 3] // 需要对数组上面的方法进行重写 push shift unshift pop reverse
}

observer(data)

data.age.push(4)
console.log(data.age)
