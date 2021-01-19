$(document).ready(() => {
  font()
  rollDice()
  genTableOfContents()
  genWhiteNoise()
//  genSquareLogo()
  genLCG()
  updateContributors()
  genSpoiler()
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
  ok = false;
  let bytes = new Uint8Array(1)
  let last = 0xff - (0xff % range);

  // Powers of two aren't biased.
  if (last + range == 0x100) {
    return (bytes[0] % range) + min;
  }

  while (!ok) {
    crypto.getRandomValues(bytes);
    if (bytes[0] < last) {
      break;
    }
  }
  return (bytes[0] % range) + min;
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

function genWhiteNoise() {
  let x = 200;
  let y = 200;
  let ctx = fig1.getContext('2d');
  fig1.width = x;
  fig1.height = y;

  ctx.clearRect(0, 0, x, y);
  let bytes = new Uint8Array(x * y);
  crypto.getRandomValues(bytes);

  for (let i=0; i<y; i++) {
    for (let j=0; j<x; j++) {
      if (bytes[i*x+j]<128) {
        ctx.fillRect(i, j, 1, 1);
      }
    }
  }
}

function genLCG() {
  let x = 200;
  let y = 200;
  let ctx = fig2.getContext('2d');
  fig2.width = x;
  fig2.height = y;

  // LCG with deliberately poor parameters. These parameters were used by
  // Visual Basic 6 and earlier. Some seeds, such as 15461763 or 343 are really
  // bad.
  let M = 16777216;
  let A = 1140671485;
  let C = 12820163;
  let seed = ((Math.random() * M)|0);

  ctx.clearRect(0, 0, x, y);
  let bytes = new Uint8Array(x * y);
  for (let i=0; i<x*y; i++) {
    bytes[i] = seed % 256;
    seed = (A * seed + C) % M;
  }

  for (let i=0; i<y; i++) {
    for (let j=0; j<x; j++) {
      if (bytes[i*x+j]<128) {
        ctx.fillRect(i, j, 1, 1);
      }
    }
  }
}


function genSquareLogo() {
  let x = 200;
  let y = 200;
  let ctx = fig3.getContext('2d');
  fig3.width = x;
  fig3.height = y;

  ctx.clearRect(0, 0, x, y);
  let bytes = new Uint8Array(x * y);
  crypto.getRandomValues(bytes);

  for (let i=0; i<y; i++) {
    for (let j=0; j<x; j++) {
      let cutoff = SqLogo.in(i, j) ? 192 : 64;
      if (bytes[i*x+j]<cutoff) {
        ctx.fillRect(i, j, 1, 1);
      }
    }
  }
}

class SqLogo {
  static in(x, y) {
    x = Math.abs(100-x);
    y = Math.abs(100-y);
    return SqLogo.inner(x, y) || SqLogo.outer(x, y);
  }

  static inner(x, y) {
    return SqLogo.in_rounded_square(x, y, 10.6, 3);
  }

  static outer(x, y) {
    return !SqLogo.in_rounded_square(x, y, 26.6, 5.2) &&
      SqLogo.in_rounded_square(x, y, 33.2, 16.8);
  }

  static in_rounded_square(x, y, dist, radius) {
    return SqLogo.in_circle(x, y, dist, dist, radius) ||
      SqLogo.in_rect(x, y, dist, dist + radius) ||
      SqLogo.in_rect(x, y, dist + radius, dist);
  }

  static in_circle(x, y, cx, cy, r) {
    return ((x-cx)*(x-cx) + (y-cy)*(y-cy)) < r*r;
  }

  static in_rect(x, y, width, height) {
    return (x < width) && (y < height);
  }
}


function updateContributors() {
  // shuffle contributors using Fisher-Yates shuffle
  let contributorsList = ["Oscar", "Alex", "Michael"];
  contributorsList = shuffle(contributorsList);

  $('#contributors').empty();
  for (let i=0; i<contributorsList.length; i++) {
    $('#contributors').append($('<li>').text(contributorsList[i]));
  }
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
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
