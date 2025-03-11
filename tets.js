let arr = [2, 5, 2, 10, 2, 5, 2, 3];
let obj = {};

for (let i = 0; i < arr.length; i++) {
  console.log(obj[arr[i]] === undefined);
  if (obj[arr[i]] === undefined) {
    obj[arr[i]] = 1;
  } else {
    obj[arr[i]] = obj[arr[i]] + 1;
  }
}

console.log(obj);

// obj.ame = "ewr";
// obj[2] = 34;

// console.log(obj);


//kr diya testing mere dost maine .......................
