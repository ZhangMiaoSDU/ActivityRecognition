//index.js
const StandAloneFeat = require('../../utils/StandAloneFeat')
//获取数据库引用
const db = wx.cloud.database({
  env: 'test-9q89f'
  // env: 'mapp-5f3o8'
});
const accelerometerDB = db.collection('todos')

const app = getApp()

Page({
  data: {
    accelerometerX: null,
    accelerometerY: null,
    accelerometerZ: null,
    waitting: true,
    activities: ['Walking', 'Jogging', 'Upstairs', 'Downstairs', 'Sitting', 'Standing'],
    activity: null,
    time: null,
    accXs: [],
    accYs: [],
    accZs: [],
    timeSs: [],
    features: []
  },

  onLoad: function() {
    wx.getFileSystemManager().copyFile({  //先把文件复制到可操作的文件夹
      srcPath: 'images/decision-path.jpg', //源文件
      destPath: wx.env.USER_DATA_PATH + '/decision-path.jpg',	//可操作的文件夹路径
      success: res => {
        console.log(res)		//复制成功返回res信息
      },
      fail: console.error		//复制失败返回error
    })
  
    wx.getFileSystemManager().readFile({  //读取文件
      filePath: wx.env.USER_DATA_PATH + '/decision-path.jpg',
      encoding: 'utf-8',
      success: res => {
        console.log(res.data);
        let raw_data = res.data
        let split_data = raw_data.split('\n')
        console.log(split_data)
        let _dicts = []
        let _dict = {}
        for (let i = 0; i < split_data.length; i++) {
          if (split_data[i].trim() != '') {
            // console.log(split_data[i])
            let _v = split_data[i].split('\t')
            _dict[_v[0]] = _v[1]
            if (Object.keys(_dict).length === 7) {
              _dicts[_dicts.length] = _dict
              console.log("_dict: ", _dict)
              _dict = {}
            }
          }
        }
        this.setData({_treesInfo: _dicts})
      },
      fail: console.error
    })
  },
  buildTree: function() {
    let _trees = this.data._treesInfo
    
    for(let i=0; i<_trees.length; i++) {
      let _tree = _trees[i]
      let n_nodes = Number(_tree['n_nodes'])
      console.log(n_nodes)
      _tree['n_nodes'] = n_nodes
      let children_left_str = _tree['children_left'].split(',')
      let children_left = new Array(children_left_str.length).fill(0)
      for (let i = 0; i < children_left_str.length; i++) { children_left[i] = Number(children_left_str[i])}
      console.log("children_left: ", children_left)
      _tree['children_left'] = children_left
      let children_right_str = _tree['children_right'].split(',')
      let children_right = []
      for (let i = 0; i < children_right_str.length; i++) { children_right[i] = Number(children_right_str[i]) }
      console.log("children_right: ", children_right)
      _tree['children_right'] = children_right

      let feature_str = _tree['feature'].split(',')
      let feature = []
      for (let i = 0; i < children_right_str.length; i++) { feature[i] = Number(feature_str[i])}
      console.log("feature: ", feature)
      _tree['feature'] = feature

      let threshold_str = _tree['threshold'].split(',')
      let threshold = []
      for (let i = 0; i < threshold_str.length; i++) { threshold[i] = Number(threshold_str[i]) }
      console.log("threshold: ", threshold)
      _tree['threshold'] = threshold

      let value = JSON.parse(_tree['value'])
      let label = []
      for (let i = 0; i<value.length; i++) {
        let index = value[i].indexOf(Math.max.apply(null, value[i]))
        label.push(index)
      }
      _tree['label'] = label

      console.log("value: ", value)
      console.log("label: ", label)
      let node_depth = new Array(n_nodes).fill(0)
      let is_leaves = new Array(n_nodes).fill(false)

      let stack = [[0, -1]]
      while (stack.length > 0) {
        let _stack = stack.pop()
        let node_id = _stack[0]
        let parent_depth = _stack[1]
        // console.log(node_id, "parent_depth: ", parent_depth)
        node_depth[node_id] = parent_depth + 1
        // if we have a test node
        if (children_left[node_id] != children_right[node_id]){
          stack.push([children_left[node_id], parent_depth + 1])
          stack.push([children_right[node_id], parent_depth + 1])
        } else {
          is_leaves[node_id] = true
        }
      }
      _tree['node_depth'] = node_depth
      _tree['is_leaves'] = is_leaves
      _trees[i] = _tree
      console.log("The binary tree structure has " + n_nodes + " nodes and has the following tree structure: ")
      for(let i = 0; i < n_nodes; i ++ ) {
        // console.log("is_leaves: ", is_leaves)
        let _tab = new Array(node_depth[i] + 1).join('\t')
        // console.log("_tab:", _tab, ";")
        if (is_leaves[i]) {
          console.log(_tab + " node=" + i + " leave node.(" + label[i]+")")
        } else {
          console.log(_tab+" node="+i+" test node: go to node "+children_left[i]+
          " id X[:, "+feature[i]+"] <= "+threshold[i]+ "else to node "+children_right[i]+'.'
          )
        }
      }
    }

    this.setData({ _trees: _trees})

  },

  predictTrees: function() {
    let _trees = this.data._trees
    let sample = 
    this.data.features[1]
    // [0.0, 0.12, 0.65, 0.19, 0.04, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.065, 0.165, 0.24, 0.27, 0.23, 0.03, 0.0, 0.1, 0.425, 0.345, 0.06, 0.07, 0.0, 0.0, 0.0, 0.0, 0.0, 0.14896793398000008, 0.9987289023500011, 0.02978767341000002, 0.0, 0.0, 0.0, 0.12518872737620002, 0.2554581195089998, 0.16472841024510018, 0.011452212294614857, 0.02123315871369068, 0.01597912214707546, 1.040746008032756]
      // [0.0,0.085, 0.875, 0.04, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.02, 0.57, 0.29, 0.1, 0.02, 0.0, 0.01, 0.415, 0.46, 0.105, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0, 0.10978544665000008, 1.0164102572500016, 0.02991506970000003, 0.0, 0.0, 0.0, 0.0781094668365, 0.12399137878000033, 0.12745722528499995, 0.00693725926734682, 0.011922642755144642, 0.01206360494964102, 1.041313085289641,]
      // [0.05, 0.325, 0.465, 0.15, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.005, 0.185, 0.29, 0.32, 0.175, 0.025, 0.0, 0.105, 0.345, 0.38, 0.07, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.07094129939000002, 1.0085355260000002, 0.05186244243000001, 2245.0, 2663.3333333333335, 709.4285714285714, 0.1335185445585, 0.22874172348, 0.1958411311373, 0.011988691822047032, 0.018977486145310717, 0.018199625877245464, 1.051682970255277]
      // [0.175, 0.72, 0.105, 0, 0, 0, 0, 0, 0, 0, 0.79, 0.05, 0.01, 0.015, 0.015, 0.035, 0.075, 0.01, 0, 0, 0.89, 0.11, 0, 0, 0, 0, 0, 0, 0, 0, -0.136101632143, -0.21175501966250004, -0.7470461140300003, -25029192829, 227.5, 0, 0.13333309638562002, 0.35753553605350014, 0.18286561971319976, 0.013358039358731501, 0.03567696390619818, 0.017973389090689396, 0.982061782306586]
      // [0.61, 0.39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.085, 0.615, 0.195, 0.105, 0, 0, 0.06, 0.36, 0.52, 0.06, 0, 0, 0, 0, 0, 0, -0.2947339387400001, 0.9508234161, 0.011812126193499996, 0, 967.5714285714286, 2291, 0.08409420079700004, 0.138040979398, 0.10884584265295505, 0.007600848167540076, 0.012425769989450886, 0.010417115287575631, 1.0099240487759837] //upstairs
    let prediction = []
    for (let i=0; i<_trees.length; i++) {
      let _tree = _trees[i]
      // console.log("--------------------------" + i + "--------------------------")
      let res = this.predictTree(_tree, sample)
      prediction.push(res)
    }
    this.setData({ prediction: prediction})
  },
  predictTree: function(_tree, sample) {
    let feature = _tree.feature
    let threshold = _tree.threshold
    let children_left = _tree.children_left
    let children_right = _tree.children_right
    let label = _tree.label
    let n_nodes = _tree.n_nodes
    let is_leaves = _tree.is_leaves
    // console.log("is_leaves:", is_leaves)
    let i = 0
    console.log("predict sample: ")
    console.log(sample)
    let res = this.predict(0, sample, feature, threshold, children_left, children_right, label, is_leaves) 
    console.log("class: ", res)
    return res
  },
  predict: function (i, _sample, _feature, _threshold, _children_left, _children_right, _label, is_leaves) {
    // console.log("is_leave: ", is_leaves)
    if (i == 0) {console.log("node = ", i)}
    if (_sample[_feature[i]] <= _threshold[i]) {
      console.log("node = ", i, ": feature = ", _sample[_feature[i]], " <= ", "threshold = ", _threshold[i])
      // console.log("left side...")
      i = _children_left[i]
      console.log("left side... go to node = ", i)
      // 是否为叶子节点
      if (is_leaves[i]) {
        return _label[i]
      } else {
        // console.log("this.predict")
        return this.predict(i, _sample, _feature, _threshold, _children_left, _children_right, _label, is_leaves)
      }
    } else {
      console.log("node = ", i, ": feature = ", _sample[_feature[i]], " > ", "threshold = ", _threshold[i])
      // console.log("right side")
      i = _children_right[i]
      console.log("right side... go to node = ", i)
      // 是否为叶子节点
      if (is_leaves[i]) {
        console.log("leaf node")
        return _label[i]
      } else {
        // console.log("this.predict")
        return this.predict(i, _sample, _feature, _threshold, _children_left, _children_right, _label, is_leaves)
      }
    }
  },

  startAccelerometer: function(e) {
    if (!this.data.activity) {
      wx.showToast({
        title: '请选择一个活动！',
        icon: 'none'
      })
      return;
    }
    let _this = this;
    console.log("获取加速度计数据");
    let timeLeft = 5
    this.setData({ timeLeft: timeLeft })
    let timer = null
    timer = setInterval(function () {
      timeLeft -= 1
      console.log("timeLeft: ", timeLeft)
      _this.setData({ timeLeft: timeLeft })
      if (timeLeft <= 0) {
        console.log("清空定时器。")
        clearInterval(timer)
      }
    }, 1000)
    // after 5 seconds
    setTimeout(function () {
      console.log('doSomething')
      _this.setData({ waitting: false, start: Date.now() })
      wx.startAccelerometer({
        interval: 'game',
        success: res => { console.log("调用成功") },
        fail: res => { console.log(res) }
      });
      
      let accXs = [];
      let accYs = [];
      let accZs = [];
      let timeSs = [];
      let start_time = Date.now();
      wx.onAccelerometerChange(function (res) {
        let mid_time = Date.now();
        // console.log(res, mid_time - start_time)
        if (mid_time - start_time < 10000) {
          
          accXs.push(res.x)
          accYs.push(res.y)
          accZs.push(res.z)
          timeSs.push(mid_time)
        } else {
          start_time = Date.now()
          console.log("10s")
          _this.setData({ accXs: accXs, accYs: accYs, accZs: accZs, timeSs: timeSs })
          accelerometerDB.add({
            data: {accXs: accXs, accYs: accYs, accZs: accZs, timeSs: timeSs, activity: _this.data.activity}
          })
          .then(res => { console.log("保存成功") })
          .catch(res => { console.log("保存失败") })
          _this.extractFeature(_this.data.accXs, _this.data.accYs, _this.data.accZs, _this.data.timeSs)
          // resetting
          _this.setData({ accXs: [], accYs: [], accZs: [], timeSs: []})
          accXs = []; accYs = []; accZs = []; timeSs = []; 
        }
        // console.log(mid_time, start_time - mid_time)
        let time = parseInt((mid_time - _this.data.start) / 1000)
        _this.setData({ time: time })
      })
    }, 5000);
  },

  uploadData(dataObj) {
    console.log("upload data");
    let jsonStr = JSON.stringify(dataObj);
    const url = `http://172.27.183.86:8080/upload`;
    wx.request({
      url: url,
      data: {
        jsonStr: jsonStr
      },
      success: res => {console.log("保存成功")},
      fail: res => { console.log("保存失败", res)}
    })
    // wx.request(url).then(res => {
    //   console.log("success", res);
    // }).catch(res => { console.log("fail", res) })
  },

  stopAccelerometer: function() {
    let _this = this
    this.setData({ waitting: true,})
    wx.stopAccelerometer({
      success: res => {
        console.log("停止读取")
        _this.setData({ accelerometerX: null, accelerometerY: null, accelerometerZ: null, activity: null })
      }
    })
  },
  showAction: function() {
    let _this = this
    wx.showActionSheet({
      itemList: _this.data.activities,
      success(res) {
        console.log(res.tapIndex)
        _this.setData({ activity: _this.data.activities[res.tapIndex]})
      },
      fail(res) {console.log(res.errMsg)}
    })
  },
  extractFeature: function(x, y, z, t) {
    console.log("处理数据");
    let features = this.data.features;
    console.log(x)
    console.log(y)
    console.log(z)
    console.log(t)
    let tup = StandAloneFeat.main(x, y, z, t)
    // console.log("tup: ", tup.getFeat())
    let feature = tup.getFeat()
    features.push(feature)
    this.setData({ features: features})
  }
})
