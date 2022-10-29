// from: https://markus.oberlehner.net/blog/simple-solution-to-prevent-body-scrolling-on-ios/
const $body = document.querySelector('body');
let scrollPosition = 0;

scrollPosition = window.pageYOffset;
$body.style.overflow = 'hidden';
$body.style.top = `-${scrollPosition}px`;