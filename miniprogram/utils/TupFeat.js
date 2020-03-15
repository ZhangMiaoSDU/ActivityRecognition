var FeatureCount = 43;
var recordCount = 200;
var floatFeat = null;
var count = 0;
var time = 0;
var usr = 0;
var stringusr = null;
var act;
var x = [];
var y = [];
var z = [];
var t = [];
var rawSet = false;

export class TupFeat {
  static FeatureCount = 43;
  static recordCount = 200;
  constructor(user, cAct2, timeStamp) { // 构造方法
    this.user = user;
    this.act = cAct2;
    this.time = timeStamp;
  }
  toString() {
    let s = ''
    s += usr
    s += ","
    s += act
    s += ","
    s += time
    for (let i = 0; i < FeatureCount; i++){
      s += ','
      s += floatFeat[i]
    }
    s += ';'
    return s
  }
  stringToTup(s) {
    let t = None
    let values = s.split('[,;]')
    let f = new Array(FeatureCount).fill(0)
    t = TupFeat(0, values[1][0], values[2])
    for (let i = 0; i<FeatureCount; i++) {
      f[i] = Number(values[i + 3])
    }  
    t.setFeat(f)
    return t
  }

  setFeat(f) {
    floatFeat = new Array(f.length).fill(0);
    for (let i = 0; i < f.length; i++) {
      floatFeat[i] = f[i]
    }
  }

  getFeat() {
    return floatFeat;
  }

  getTime() {
    return time
  }

  getUsr() {
    return usr
  }

  getStringUsr() {
    return stringusr
  }

  getAct() {
    return act
  }

  setRaw(xi, yi, zi, ti) {
    x = new Array(xi.length).fill(0)
    y = new Array(yi.length).fill(0)
    z = new Array(zi.length).fill(0)
    t = new Array(ti.length).fill(0)
    for(let i = 0; i < xi.length; i++) {
      x[i] = xi[i]
      y[i] = yi[i]
      z[i] = zi[i]
      t[i] = ti[i]
    }
    this.setCount(xi.length)
    rawSet = true
    return
  }  

  setCount(c) {
    if (c<0) {
      count = 0
    } else if (c < recordCount) {
      count = c
    } else {
      count = recordCount
    }
    return
  }

  getCount() {
    return count
  }

  getX() {
    let xo = new Array(x.length).fill(0)
    for(let i = 0; i < x.length; i++) {
      xo[i] = x[i]
    }
    return xo
  }
  getY() {
    let yo = new Array(y.length).fill(0)
    for (let i = 0; i < y.length; i++) {
      yo[i] = y[i]
    }
    return yo
  }
  getZ() {
    let zo = new Array(z.length).fill(0)
    for (let i = 0; i < z.length; i++) {
      zo[i] = z[i]
    }
    return zo
  }
  getT() {
    let to = new Array(t.length).fill(0)
    for (let i = 0; i < t.length; i++) {
      to[i] = t[i]
    }
    return to
  }

  static toDoubles(f) {
    let d = new Array(f.length).fill(0)
    for(let i = 0; i< f.length; i++) {
      d[i] = f[i]
    }
    return d
  }

  killraw() {
    x = []
    y = []
    z = []
    t = []
    rawSet = false
  }

  rawIsSet() {
    return rawSet
  }
}



// function TupFeat(user, cAct2, timeStamp) {
//   this.FeatureCount = 43;
//   this.recordCount = 200;
//   this.floatFeat = null;
//   this.count = 0;
//   this.time = 0;
//   this.usr = 0;
//   this.stringusr = null;
//   this.act;
//   this.x = [];
//   this.y = [];
//   this.z = [];
//   this.rawSet = false;
//   var init = function() {
//     this.user = user;
//     this.act = cAct2;
//     this.time = timeStamp;
//   };

//   init();

//   this.toString = function() {
//     let s = ''
//     s += self.user
//     s += ","
//     s += self.act
//     s += ","
//     s += self.time
//     for (let i = 0; i < FeatureCount; i++) {
//       s += ','
//       s += floatFeat[i]
//     }
//     s += ';'
//     return s
//   }

// }
