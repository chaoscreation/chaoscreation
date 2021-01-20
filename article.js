$(document).ready(() => {
  font()
  rollDice()
  genTableOfContents()
  genWhiteNoise()
  genLCG()
  updateContributors()
  genSpoiler()
  genArt1()
})

function rollDice() {
  const n1 = cryptoRandomValue(1, 6);
  const n2 = cryptoRandomValue(0, 4);
  dice.src = "dice/" + n1 + "-" + n2 + ".png";
  dice.title = ["one", "two", "three", "four", "five", "six"][n1-1];
}

function cryptoRandomValue(min, max) {
  let range = max - min;
  if ((range < 1) || (range > 256)) {
    throw new Error('invalid range')
  }
  let last = 0xff - (0xff % range);

  let bytes = new Uint8Array(1)
  crypto.getRandomValues(bytes);

  // Powers of two aren't biased.
  if (last + range == 0x100) {
    return (bytes[0] % range) + min;
  }

  while (bytes[0] >= last) {
    crypto.getRandomValues(bytes);
  }
  return (bytes[0] % range) + min;
}

// cryptoRandomValue works fine when calling it a few times but is too slow to
// render an entire canvas. FastCoinFlip keeps an internal buffer of randomly
// generated values (to amortize the call to crypto.getRandomValues). The code
// also only consumes one bit instead of an entire byte per call to flip().
class FastCoinFlip {
  // Size (in bytes) of internal buffer of random values.
  constructor(bufSize) {
    this.buf = new Uint8Array(bufSize)
    this.ptr = 0;
  }

  flip() {
    if (this.ptr == 0) {
      crypto.getRandomValues(this.buf);
    }
    let byte = this.buf[(this.ptr/8)|0];
    let r = (byte >> (this.ptr%8))&1;
    this.ptr = (this.ptr + 1) % (this.buf.length * 8);

    return r;
  }
}


function font() {
  const n = (Math.random() * 3)|0;
// TODO: uncomment
//  document.body.className = "font" + n;
}

function genTableOfContents() {
  $('h2.count').each((_, el) => {
    let id = el.textContent.replaceAll(" ", "");
    el.id = id;
    $('#toc').append(
      $('<li>').append(
        $('<a>', {text: el.textContent, href: '#'+id})));
  })
}

function scaleCanvas(el, ctx, width, height) {
  const devicePixelRatio = window.devicePixelRatio || 1;
  ctx.width = width * devicePixelRatio;
  ctx.height = height * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  el.width = ctx.width;
  el.height = ctx.height;
}

function genWhiteNoise() {
  let ctx = fig1.getContext('2d');
  scaleCanvas(fig1, ctx, 200, 200)

  ctx.clearRect(0, 0, ctx.width, ctx.height);
  let rng = new FastCoinFlip(1024);

  for (let i=0; i<ctx.height; i++) {
    for (let j=0; j<ctx.width; j++) {
      if (rng.flip() == 0) {
        ctx.fillRect(i, j, 1, 1);
      }
    }
  }
}

function genLCG() {
  let ctx = fig2.getContext('2d');
  scaleCanvas(fig2, ctx, 200, 200)

  // LCG with deliberately poor parameters. These parameters were used by
  // Visual Basic 6 and earlier. Some seeds, such as 15461763 or 343 are really
  // bad. 1671052 is even worse;
  let M = 16777216;
  let A = 1140671485;
  let C = 12820163;
  let seed = (Math.random()*M)|0;

  ctx.clearRect(0, 0, ctx.width, ctx.height);

  for (let i=0; i<ctx.height; i++) {
    for (let j=0; j<ctx.width; j++) {
      let r = seed % 2;
      seed = (A * seed + C) % M;
      if (r == 0) {
        ctx.fillRect(i, j, 1, 1);
      }
    }
  }
}

function updateContributors() {
  shuffledList = shuffle($('#contributors').children());
  $('#contributors').empty();
  $('#contributors').append(shuffledList);
}

// Fisher-Yates shuffle (aka Knuth shuffle)
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = cryptoRandomValue(0, i+1);
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function genSpoiler() {
  [...document.getElementsByClassName('spoiler')].map(e => {
    var t = e.innerText;
    e.innerText = '';
    let prev = -1;
    for (let i=0; i<t.length; i++) {
      let s = document.createElement('span');
      next = prev;
      while (next == prev) {
        next = (Math.random()*4+1)|0;
      }
      prev = next;
      s.className = 'spoiler'+next;
      s.innerText = t[i];
      e.appendChild(s);
    }
  });
}

function genArt1() {
  let a = art1.innerText.split("\n");
  let rng = new FastCoinFlip(1024);
  let i = 0;
  let step = () => {
    if (a[a.length-1] == "\n") {
      a[a.length-1] = "";
    }
    if (rng.flip()) {
      a[a.length-1] += '╱';
    } else {
      a[a.length-1] += '╲';
    }
    i++;
    if (i == 40) {
      i = 0;
      a.push("\n");
      if (a.length == 26) {
        a.shift();
      }
    }
    art1.innerHTML = a.join("\n");
  }
  window.setInterval(step, 20);
}
