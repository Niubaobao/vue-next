//  vue3.0 响应式原理
// vue2.0 默认会递归  数组改变length是无效的  对象不存在的属性不能被拦截

// proxy缺点  :兼容性差 ie11都不支持
// hash表
let toPrxoy = new WeakMap() //弱引用映射表 放置的是 原对象：代理过的对象
let toRaw = new WeakMap() // 被代理过的对象： 原对象

function isObject(val) {
  return typeof val == 'object' && val != null
}

function hasOwn(target, key) {
  return target.hasOwnProperty(key)
}

function reactive(target) {
  return createReactiveObject(target)
}

//创建响应式对象
function createReactiveObject(target) {
  if (!isObject(target)) {
    return target
  }
  let proxy = toPrxoy.get(target) //如果已经代理过了 直接将代理过的proxy返回就好了
  if (proxy) {
    return proxy
  }

  if (toRaw.has(target)) {
    // 防止被代理过的对象再次被代理
    return target
  }

  let baseHandler = {
    // Reflect 不会报错 而且会有返回值  会替代掉object（反射）
    get(target, key, receiver) {
      console.log('获取')
      let result = Reflect.get(target, key, receiver)

      return isObject(result) ? reactive(result) : result // 多层代理  如果访问的第一层是对象那么递归监听 将结果返回
      //   return target[key]
    },
    set(target, key, value, receiver) {
      //   target[key] = value
      let haskey = hasOwn(target, key)
      let oldValue = target[key]

      let res = Reflect.set(target, key, value, receiver)
      if (!haskey) {
        //新增属性
        console.log('新增属性')
      } else if (oldValue !== value) {
        //这里面为了屏蔽无意义的修改
        // 修改属性
        console.log('修改属性')
      }

      return res
    },
    deleteProperty() {
      console.log('删除')
      let res = Reflect.deleteProperty(target, key)
      return res
    }
  }

  let observed = new Proxy(target, baseHandler)

  toPrxoy.set(target, observed)
  toRaw.set(observed, target)

  return observed
}

// 代理对象
// let object = { name: { age: 13 } }
// let proxy = reactive(object) //多层代理 通过get方法来判断
// // 1 防止多次代理同一个对象 需要记录如果这个对象已经被代理过就不需要new proxy 了
// // 2还需要防止代理过的对象重复代理
// // hash 映射表可以解决上面的问题
// proxy.name.age = 222
// console.log(proxy.name.age)

let proxy = reactive([1, 2, 3])

proxy.push(4)
// 第一次设置会先添加4这一项 第二次设置会将length属性改为4
