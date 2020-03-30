const loco = require("locomotion");
loco.then((svc) => {
  let pal = svc.locate("palindrome");
  if (pal) {
    var element = 'no x in Nixon!'
    console.log("Is: "+element+" a palindrome? ", (pal.isPalindrome(element)) ? "Yes" : "no");
  }
}).catch((err) => {
  console.error(err);
});