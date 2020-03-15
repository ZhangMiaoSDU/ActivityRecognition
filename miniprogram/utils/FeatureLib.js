const TupFeat = require('./TupFeat.js').TupFeat

let maxPeak = parseInt((TupFeat.recordCount / 2) + 1) 

export class FeatureLib {
  static processTup(t, bins) {
    let count = t.getCount()
    let x = TupFeat.toDoubles(t.getX())
    let y = TupFeat.toDoubles(t.getY())
    let z = TupFeat.toDoubles(t.getZ())
    return this.processTup1(count, t.getT(), x, y, z, t, bins)
  }

  static processTup1(count, t, x, y, z, tup, bins) {
    let floatFeat = new Array(43).fill(0)
    let xbins = this.fillBins(count, x, 'x', bins)
    let ybins = this.fillBins(count, y, "y", bins)
    let zbins = this.fillBins(count, z, "z", bins)

    for (let i = 0; i < 10; i++) {
      floatFeat[i] = xbins[i]
    }
    for (let i = 0; i < 10; i++) {
      floatFeat[10 + i] = ybins[i]
    }
    for (let i = 0; i < 10; i++){
      floatFeat[20 + i] = zbins[i]
    }    
    floatFeat[30] = this.getAvr(count, x)
    floatFeat[31] = this.getAvr(count, y)
    floatFeat[32] = this.getAvr(count, z)
    floatFeat[33] = this.getPeakTime(t, x)
    floatFeat[34] = this.getPeakTime(t, y)
    floatFeat[35] = this.getPeakTime(t, z)
    floatFeat[36] = this.getAbsDev(count, x, floatFeat[30])
    floatFeat[37] = this.getAbsDev(count, y, floatFeat[31])
    floatFeat[38] = this.getAbsDev(count, z, floatFeat[32])
    floatFeat[39] = this.getSDiv(count, x, floatFeat[30])
    floatFeat[40] = this.getSDiv(count, y, floatFeat[31])
    floatFeat[41] = this.getSDiv(count, z, floatFeat[32])
    floatFeat[42] = this.getAvrMagnitude(count, x, y, z)
    // store results to tupfeat object
    tup.setFeat(floatFeat)
    tup.killraw()
    console.log(floatFeat)
    return tup
  }

  static fillBins(count, n, axis, bins) {
    let binAvgs = new Array(10).fill(0)
    let binCounts = new Array(10).fill(0)
    let b = 0
    if (axis == 'x') {
      b = 0
    } else if (axis == 'y') {
      b = 10
    } else if (axis == 'z') {
      b = 20
    }
    for (let i = 0; i < count; i++) {
      if (n[i] < bins[0]) {
        binCounts[0] += 1
      } else if (n[i] < bins[b + 1]) {
        binCounts[1] += 1
      } else if (n[i] < bins[b + 2]) {
        binCounts[2] += 1
      } else if (n[i] < bins[b + 3]) {
        binCounts[3] += 1
      } else if (n[i] < bins[b + 4]) {
        binCounts[4] += 1
      } else if (n[i] < bins[b + 5]) {
        binCounts[5] += 1 
      } else if (n[i] < bins[b + 6]) {
        binCounts[6] += 1
      } else if (n[i] < bins[b + 7]) {
        binCounts[7] += 1
      } else if (n[i] < bins[b + 8]) {
        binCounts[8] += 1
      } else {
        binCounts[9] += 1
      }
    
    }
    for (let i = 0; i < 10; i++) {
      binAvgs[i] = binCounts[i] / count
    }
    return binAvgs
  }

  static getAvr(count, n) {
    let avr = 0
    for (let i = 0; i< count; i++) {
      avr += n[i]
    }
    avr /= count
    return avr
  }

  static getPeakTime(t, n) {
    let maxPeaks = parseInt(n.length / 2 + 1)
    let allPeaks = new Array(maxPeaks).fill(0)
    let peakTimes = new Array(maxPeaks).fill(0)
    let highTimes = new Array(maxPeaks).fill(0)

    let tmp1 = n[0]
    let tmp2 = n[1]
    let tmp3 = n[2]

    let highPeakCount = 0
    let favr = 0
    let highest = 0
    let threshold = .9
    let avr = 0
    let j = 0
    for (let i = 3, j = 0; i < (n.length - 1); i++) {
      if (tmp2 > tmp1 && tmp2 > tmp3) {
        allPeaks[j] = tmp2;
        peakTimes[j] = t[i];
        j++;
        if (tmp2 > highest) {// remember the highest peak
          highest = tmp2;
        }
      }
      tmp1 = tmp2
      tmp2 = tmp3
      tmp3 = n[i + 1]
    }
    for (let i = 0; i < allPeaks.length; i++) {
      if (allPeaks[i] > threshold * highest) {
        highTimes[highPeakCount] = peakTimes[i];
        highPeakCount++;
      }
    }
    while (highPeakCount < 3 && threshold > 0) {
      // lower the threshold incrementally until enough peaks are found
      threshold -= .05;
      highPeakCount = 0; // reset to avoid a double count

      for (let i = 0; i < allPeaks.length; i++) {
        if (allPeaks[i] > threshold * highest) {
          // if the loop executes, it will write over the old values
          highTimes[highPeakCount] = peakTimes[i];
          highPeakCount++;
        }
      }
    }
    if (highPeakCount < 3) {
      avr = 0;
    } else {
      for (let i = 0; i < (highPeakCount - 1); i++) {
        // for now avr is the sum of each difference
        avr += (highTimes[i + 1] - highTimes[i]);
      }
      // avr becomes the average of those differences
      avr = avr / (highPeakCount - 1);
    }
    favr = Number(avr);
    return favr;
  }
  static getAbsDev(count, n, navr) {
    let aDev = 0;
    for (let i = 0; i < count; i++) {
      aDev += Math.abs(n[i] - navr);
    }
    aDev = aDev / count;

    return Number(aDev);
  }

  static getSDiv(count, n, nAvr) {
    let nSDiv = 0; // standard deviations for each variable
    // generates sums of squares of differences to use an standard deviation
    for (let k = 0; k < count; k++) {
      nSDiv += ((n[k] - nAvr) * (n[k] - nAvr));
    }
    nSDiv = (Math.sqrt(nSDiv)) / count;

    return Number(nSDiv);
  }

  static getAvr(count, n) {
    let avr = 0;
    for (let i = 0; i < count; i++) {
      avr += n[i];
    }
    avr = avr / count;

    return avr;
  }

  static getAbsSum(count, x, y, z) {
    let values = new Array(count).fill(0);
    for (let i = 0; i < count; i++) {
      values[i] = ((Math.abs(x[i])) + (Math.abs(y[i])) + (Math.abs(z[i])));
    }

    return values;
  }

  static getAvrAbsSum(count, x, y, z) {
    let values = this.getAbsSum(count, x, y, z);

    return this.getAvr(count, values);
  }

  static getSDAbsSum(count, x, y, z) {
    let avr = this.getAvrAbsSum(count, x, y, z);
    let values = this.getAbsSum(count, x, y, z);

    return this.getSDiv(count, values, avr);
  }

  static getMagnitude(count, x, y, z) {
    let values = new Array(count).fill(0);
    let sum = 0;
    for (let i = 0; i < count; i++) {
      sum = ((Math.pow(x[i], 2)) + (Math.pow(y[i], 2)) + (Math.pow(z[i], 2)));
      values[i] = (Math.sqrt(sum));
    }

    return values;
  }
  static getAvrMagnitude(count, x, y, z) {
    let values = this.getMagnitude(count, x, y, z);
    return this.getAvr(count, values);
  }
}



