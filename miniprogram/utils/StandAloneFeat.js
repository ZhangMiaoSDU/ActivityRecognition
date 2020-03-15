const TupFeat = require("./TupFeat.js").TupFeat;
const FeatureLib = require("./FeatureLib.js").FeatureLib

let bins = [
  -0.25, 0, 0.25, .5, .75, 1, 1.25, 1.5, 1.75, 2,
  -0.25, 0, 0.25, .5, .75, 1, 1.25, 1.5, 1.75, 2,
  -0.25, 0, 0.25, .5, .75, 1, 1.25, 1.5, 1.75, 2
]

// let duration = windowSize * 1000;

let x = [];
let y = [];
let z = [];
let t = [];

function getQue(x, y, z, t) {
  let ttup = new TupFeat(0, "act", "time");
  let xt = new Array(x.length).fill(0), 
      yt = new Array(y.length).fill(0), 
      zt = new Array(z.length).fill(0),
      tt = new Array(t.length).fill(0);
  for (let i = 0; i < x.length; i++) {
    xt[i] = x[i];
    yt[i] = y[i];
    zt[i] = z[i];
    tt[i] = t[i];
  }
  ttup.setRaw(xt, yt, zt, tt);
  // console.log(ttup.getX())
  return ttup;
}


export function main(x, y, z, t) {
  let que = getQue(x, y, z, t);
  let tup = FeatureLib.processTup(que, bins)
  return tup
}

// main(x, y, z, t)

