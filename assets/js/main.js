
/*!
 * domready (c) Dustin Diaz 2014 - License MIT
 * https://github.com/ded/domready
 */
!function (name, definition) {

  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], listener
    , doc = typeof document === 'object' && document
    , hack = doc && doc.documentElement.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = doc && (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


  if (!loaded && doc)
    doc.addEventListener(domContentLoaded, listener = function () {
      doc.removeEventListener(domContentLoaded, listener)
      loaded = 1
      while (listener = fns.shift()) listener()
    })

  return function (fn) {
    loaded ? setTimeout(fn, 0) : fns.push(fn)
  }

});


domready(function () {
  console.info('DOM is content and loaded.');

  // wire up the menu trigger button
  document.querySelector('#menu_trigger').addEventListener('click', function(){
    this.classList.toggle('triggered');
    document.querySelector('#menu').classList.toggle('shown');
  });

  // sense whether user navs with keyboard
  window.addEventListener('keydown', handleFirstTab);

  // allow :active styles to work in CSS on mobile safari
  document.addEventListener("touchstart", function(){}, true);

  // when the dom is loaded, fade in the page
  document.body.classList.remove('dom-loading');
  document.documentElement.style.backgroundColor="";
});

// if keyboard navver, leave the visual accommodations alone
function handleFirstTab(e) {
  if (e.keyCode === 9) { // the "I am a keyboard user" key
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
  }
}

