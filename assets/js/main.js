const showSearchHotkeyForOS = (os) => {
    // show the appropriate hotkey hint
    if (os.includes("Mac")) {
        document.getElementById("modkey").innerHTML = "⌘"
    } else if (os.includes("Win") || os.includes("Linux")) {
        document.getElementById("modkey").innerHTML = "^"
    } else {
        document.getElementById("search_hint").style.display = "none"
    }
  }
/*!
 * domready (c) Dustin Diaz 2014 - License MIT
 * https://github.com/ded/domready
 */
!function (name, definition) {

    if (typeof module != 'undefined') module.exports = definition();
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition);
    else this[name] = definition();

}('domready', function () {

    var fns = [],
        listener,
        doc = typeof document === 'object' && document,
        hack = doc && doc.documentElement.doScroll,
        domContentLoaded = 'DOMContentLoaded',
        loaded = doc && (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState);


    if (!loaded && doc)
        doc.addEventListener(domContentLoaded, listener = function () {
            doc.removeEventListener(domContentLoaded, listener);
            loaded = 1;
            try {
                listener = fns.shift();
                listener();
            } catch(error) {
                console.error("could not shift because:", error);
            }
        });

    return function (fn) {
        if (loaded) {
            setTimeout(fn, 0);
        } else {
            fns.push(fn);
        }
    };
});


domready(function () {
    // console.info('DOM is content and loaded.');
    showSearchHotkeyForOS(window.navigator.platform);
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
  setTimeout(function (){
    document.documentElement.style.backgroundColor="";
  }, 500)

    var scrollPercent,
        scrollPosition,
        relevantHeight,
        showScroll,
        byline = document.querySelector('.byline'),
        scrolliner = document.querySelector('.scrolliner'),
        main = document.querySelector('main'),
        post = document.querySelector('.post');

    // display scroll progress in sticky header
    if (scrolliner !== null &&
        byline !== null &&
        main !== null &&
        post !== null) {
        main.addEventListener('scroll', function(){
            scrollPosition = main.scrollTop;
            bylineHeight = byline.offsetTop;
            relevantHeight = post.offsetHeight - window.innerHeight;
            scrollPercent = 100 * scrollPosition / relevantHeight;
            if (typeof scrolliner === "object") {
                showScroll = scrollPosition < bylineHeight;
                scrolliner.classList.toggle("ghost", showScroll);
                scrollinerPosition = scrollPercent - 100;
                scrolliner.style.transform = "translate3d(calc("+scrollinerPosition+"% - 4em), 0, 0)";
            }
        });
    }
});

// if keyboard navver, leave the visual accommodations alone
function handleFirstTab(e) {
    if (e.keyCode === 9) { // the "I am a keyboard user" key
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
    }
}

