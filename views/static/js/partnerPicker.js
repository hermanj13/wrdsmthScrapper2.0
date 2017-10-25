let students = [{
  "name": "Alexander F.",
  "partnered": false,
  "present":true
}, {
  "name": "Anastasia L.",
  "partnered": false,
  "present":true
}, {
  "name": "Andrew L.",
  "partnered": false,
  "present":true
}, {
  "name": "Ash K.",
  "partnered": false,
  "present":true
}, {
  "name": "Brooke B.",
  "partnered": false,
  "present":true
}, {
  "name": "Cory L.",
  "partnered": false,
  "present":true
}, {
  "name": "Dane S.",
  "partnered": false,
  "present":true
}, {
  "name": "Donald J.",
  "partnered": false,
  "present":true
}, {
  "name": "Esperanze F.",
  "partnered": false,
  "present":true
}, {
  "name": "Fitsum B.",
  "partnered": false,
  "present":true
}, {
    "name": "Haley L.",
    "partnered": false,
    "present":true
  }, {
  "name": "Heidy P.",
  "partnered": false,
  "present":true
}, {
  "name": "Jess G.",
  "partnered": false,
  "present":true
}, {
  "name": "Joseph S.",
  "partnered": false,
  "present":true
}, {
  "name": "Rain H.",
  "partnered": false,
  "present":true
}, {
  "name": "Maxim L.",
  "partnered": false,
  "present":true
}, {
  "name": "Melanie Mac",
  "partnered": false,
  "present":true
}, {
  "name": "Nick H.",
  "partnered": false,
  "present":true
}, {
  "name": "Omar L.",
  "partnered": false,
  "present":true
}, {
  "name": "Perla S.",
  "partnered": false,
  "present":true
}, {
  "name": "Samuel C.",
  "partnered": false,
  "present":true
}, {
  "name": "Sean C.",
  "partnered": false,
  "present":true
}, {
  "name": "Sophia S.",
  "partnered": false,
  "present":true
}, {
  "name": "Stuart L.",
  "partnered": false,
  "present":true
}, {
  "name": "Young J.",
  "partnered": false,
  "present":true
}];

const partners = [];
let flag = false

const print = function(extra, flag) {
  let i
  let html
  if (flag === true) {
    html = `<table class="table table-striped table-hover table-dark"><thead><tr><th class="number" scope="col">Group #</th><th scope="col">Player One</th><th scope="col">Player Two</th><th scope="col">Player Three?</th></tr></thead><tbody>`;
    let group = 1;
    for (i = 0; i < partners.length - 1; i++) {
      html += `<tr><th class="number" >` + group + `</th><td>` + partners[i].playerOne + `</td><td>` + partners[i].playerTwo + `</td><td></td></tr>`;
      group++;
    };
    html += `<tr><th class="number" >` + group + `</th><td>` + partners[i].playerOne + `</td><td>` + partners[i].playerTwo + `</td><td>` + students[extra].name + `</td></tr>`;
    html += `</tbody></table>`;
  } else {
    html = `<table class="table table-striped table-hover table-dark"><thead><tr><th class="number" scope="col">Group #</th><th scope="col">Player One</th><th scope="col">Player Two</th></tr></thead><tbody>`;
    let group = 1;
    for (let i = 0; i < partners.length; i++) {
      html += `<tr><th class="number" scope="row">` + group + `</th><td>` + partners[i].playerOne + `</td><td>` + partners[i].playerTwo + `</td></tr>`;
      group++;
    };
    html += `</tbody></table>`;
  }
  document.querySelector("#picker").innerHTML = html;
}

const pickUser = function(currentMax) {
  let i;
  let groups = 0;
  let index;
  let random;
  let extra;
  while (groups < 12) {
    random = Math.floor(Math.random() * students.length);
    while (students[random].partnered === true) {
      random = Math.floor(Math.random() * students.length);
    };
    students[random].partnered = true;
    index = Math.floor(Math.random() * students.length);
    while (students[index].partnered === true) {
      index = Math.floor(Math.random() * students.length);
    };
    students[index].partnered = true;
    partners[groups] = {
      "playerOne": students[random].name,
      "playerTwo": students[index].name
    };
    groups++;
  }
  for (i = 0; i < students.length; i++) {
    if (students[i].partnered === false) {
      flag = true
      break
    }
  }
  print(i, flag);
};

pickUser();
