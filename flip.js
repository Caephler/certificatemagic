const flipMap = {};

module.exports = {
  getFlipMap: () => flipMap,
  getIsFlipped: function(code) {
    const result = flipMap[code];
    if (result) {
      return result.status;
    }

    return false;
  },
  doesFlipExist: function(code) {
    return !!flipMap[code];
  },
  clearFlip: function(code) {
    if (flipMap[code]) {
      clearInterval(flipMap[code].timer);
      delete flipMap[code];
    }
  },
  createFlip: function(code, interval=60) {
    const generateNewInterval = () => setInterval(() => {
      if (flipMap[code]) {
        flipMap[code].status = !flipMap[code].status;
        console.log(`${code} flipped - ${flipMap[code].status}`);
      }
    }, interval * 1000);

    flipMap[code] = {
      status: true,
      timer: generateNewInterval()
    };
  },
  flipTheSwitch: function(code, interval=60) {
    // Initially, flipping = make true, time in seconds
    const result = flipMap[code];

    if (result) {
      console.log(`[Server] Flipping Switch: ${code}`);
      clearInterval(result.timer);
      flipMap[code].timer = generateNewInterval();
      flipMap[code].status = !flipMap[code].status;
    } else {
      flipMap[code] = {
        status: true,
        timer: generateNewInterval()
      };
    }
  }
}
