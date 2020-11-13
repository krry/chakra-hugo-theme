var fuse // holds our search engine
var searchVisible = false
var firstRun = true // allow us to delay loading json data unless search activated
var resultsAvailable = false // Did we get any search results?
var searchResults = document.getElementById('searchResults') // targets the <ul>
var searchInput = document.getElementById('searchInput') // input box for search
var fastSearch = document.getElementById('fastSearch') // input box for search
var searchHint = document.getElementById('searchHint') // input box for search
var modkey = document.getElementById('modkey') // input box for search
var firstResult = searchResults.firstChild // first child of search list
var lastResult = searchResults.lastChild // last child of search list
var mouseDetected = false
var touchDetected = false
var spinOn = false

function showSearch() {
  fastSearch.classList.add('shown') // show search box
  modkey.classList.add('shown')
  searchInput.focus() // put focus in input box so you can just start typing
  searchVisible = true // search visible
  removeSearchShower()
  addSearchHider()
}

function hideSearch() {
  fastSearch.classList.remove('shown') // hide search box
  document.activeElement.blur() // remove focus from search box
  searchVisible = false // search not visible
  addSearchShower()
  removeSearchHider()
}

function toggleSearch() {
  return searchVisible ? hideSearch() : showSearch()
}

function searchShower(event) {
  if (searchHint.contains(event.target)) {
    checkSearch()
    showSearch()
  }
}

function searchHider(event) {
  if (!fastSearch.contains(event.target)) {
    hideSearch()
  }
}

function addSearchShower() {
  document.addEventListener('mouseup', searchShower)
}

function removeSearchShower() {
  if (typeof searchShower !== 'undefined') {
    document.removeEventListener('mouseup', searchShower)
  }
}

function addSearchHider() {
  document.addEventListener('mouseup', searchHider)
}

function removeSearchHider() {
  if (typeof searchHider !== 'undefined') {
    document.removeEventListener('mouseup', searchHider)
  }
}

function checkSearch() {
  // loads our json data and builds fuse.js search index
  return firstRun ? loadSearch() : (firstRun = false) // only one first run per page load
}

function handleSearchKeys(event) {
  // CMD-P to show / hide Search
  if ((event.metaKey && event.key === 'p') || event.key === 'Escape') {
    event.preventDefault()
    // Load json search index if first time invoking search
    // Means we don't load json unless searches are going to happen; keep user payload small unless needed
    checkSearch()
    // Toggle visibility of search box
    toggleSearch()
  }

  // DOWN (40) arrow
  if (event.key === 'ArrowDown') {
    if (searchVisible && resultsAvailable) {
      event.preventDefault() // stop window from scrolling
      if (document.activeElement === searchInput) {
        firstResult.focus()
      } // if the currently focused element is the main input --> focus the first <li>
      else if (document.activeElement === lastResult) {
        // if we're at the bottom, stay there
        lastResult.focus()
      } else {
        // otherwise select the next search result
        var nextItem = document.activeElement.parentElement.nextSibling.firstElementChild
        nextItem.focus()
        nextItem.scrollIntoView({behavior: 'smooth', block: 'center'})
      }
    }
  }

  // UP (38) arrow
  if (event.key === 'ArrowUp') {
    if (searchVisible && resultsAvailable) {
      event.preventDefault() // stop window from scrolling
      if (document.activeElement === searchInput) {
        searchInput.focus()
      } // If we're in the input box, do nothing
      else if (document.activeElement === firstResult) {
        searchInput.focus()
      } // If we're at the first item, go to input box
      else {
        var prevItem = document.activeElement.parentElement.previousSibling.firstElementChild
        prevItem.focus()
        prevItem.scrollIntoView({behavior: 'smooth', block: 'center'})
      } // Otherwise, select the search result above the current active one
    }
  }
}

// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest()
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText)
        if (callback) callback(data)
      }
    }
  }
  httpRequest.open('GET', path)
  httpRequest.send()
}

// ==========================================
// load our search index, only executed once
// on first call of search box (CMD-/)
//
function loadSearch(e) {
  fetchJSONFile('/index.json', function (data) {
    var options = {
      // fuse.js options; check fuse.js website for details
      keys: ['title', 'permalink', 'contents', 'tags', 'subtitle', 'lead'],
      minMatchCharLength: 1,
      shouldSort: true,
      // ===the fuzzy search magic===
      // A `distance` of 1000 would require a perfect match
      // to be within 800 characters of the `location`
      // to be found using a `threshold` of 0.8
      location: 0,
      threshold: 0.5,
      distance: 500,
    }
    fuse = new Fuse(data, options) // build the index from the json file
  })
  return e
}

// ==========================================
// using the index we loaded on CMD-/, run
// a search query (for "term") every time a letter is typed
// in the search box
//
function executeSearch(term) {
  let results = fuse.search(term) // the actual query being run using fuse.js
  let searchitems = '' // our results bucket

  if (results.length === 0) {
    // no results based on what was typed into the input box
    resultsAvailable = false
    searchitems = ''
  } else {
    // build our html
    let tags = ''
    for (let item in results.slice(0, 7)) {
      // only show first 5 results
      if (searchitems.includes(results[item].item.title)) {
        // weed out duplicates
        continue
      }
      const tagsArr = results[item].item.tags
      for (let tag in tagsArr) {
        tags = '#' + tagsArr[tag] + ' ' + tags
        if (tag > 5) break
      }
      searchitems =
        searchitems +
        '<li><a href="' +
        results[item].item.permalink +
        '" tabindex="0" class="results-link">' +
        '<h2 class="results-title">' +
        results[item].item.title +
        '</h2><p class="results-deets"><time class="results-date">' +
        results[item].item.date +
        '</time><br/><p>' +
        results[item].item.contents.slice(0, 200) +
        '…' +
        '</p><span class="results-tags">' +
        tags +
        '</span></p></a></li>'
    }
    resultsAvailable = true
  }

  document.getElementById('searchResults').innerHTML = searchitems
  if (results.length > 0) {
    firstResult = searchResults.firstChild.firstElementChild // first result container — used for checking against keyboard up/down location
    lastResult = searchResults.lastChild.firstElementChild // last result container — used for checking against keyboard up/down location
  }
}

const showSearchHotkeyForOS = (os) => {
  // show the appropriate hotkey hint
  if (os.includes('Mac')) {
    document.getElementById('oskey').innerHTML = '⌘'
  } else if (os.includes('Win') || os.includes('Linux')) {
    document.getElementById('oskey').innerHTML = '^'
  } else {
    document.getElementById('searchHint').style.display = 'none'
  }
}

// see if there's a mouse in the house
function onMouseMove() {
  document.removeEventListener('mousemove', onMouseMove, false)
  mouseDetected = true
  trackUser()
  // initializeMouseBehavior();
}

// see if anyone's in touch
function onTouchMove() {
  document.removeEventListener('touchmove', onTouchMove, false)
  touchDetected = true
  trackUser()
  // initializeMouseBehavior();
}

// listen to users' movements
const trackUser = () => {
  let moveToTrack = ''
  if (touchDetected) {
    moveToTrack = 'touchmove'
  } else if (mouseDetected) {
    moveToTrack = 'mousemove'
  }
  if (moveToTrack) {
    document.addEventListener(moveToTrack, fluctuateSpinner)
  }
}

function measureDistance(el, mX, mY) {
  var rect = el.getBoundingClientRect()
  return Math.floor(
    Math.sqrt(
      Math.pow(mX - (rect.left + el.offsetWidth / 2), 2) +
        Math.pow(mY - (rect.top + el.offsetHeight / 2), 2),
    ),
  )
}

function fluctuateSpinner(e) {
  // get coordinates of center of bloob
  var bloob = document.getElementById('bloob')
  var mX = e.pageX
  var mY = e.pageY
  // get position of mouse or finger
  // calculate distance between these points every interval
  var distanceFromCenter = measureDistance(bloob, mX, mY)
  bloob.style.animationDuration = distanceFromCenter + 'ms'
  var liveColor = 'hsl(' + (distanceFromCenter % 360) + ', 82%, 61%)'
  bloob.children[0].style.color = liveColor
}

function toggleSpins(e) {
  var bloob = document.getElementById('bloob')
  if (bloob.contains(e.target)) {
    spinOn = !spinOn
    bloob.style.animationPlayState = spinOn ? 'running' : 'paused'
  }
}

/*!
 * domready (c) Dustin Diaz 2014 - License MIT
 * https://github.com/ded/domready
 */
!(function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()
})('domready', function () {
  var fns = [],
    listener,
    doc = typeof document === 'object' && document,
    hack = doc && doc.documentElement.doScroll,
    domContentLoaded = 'DOMContentLoaded',
    loaded = doc && (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)

  if (!loaded && doc)
    doc.addEventListener(
      domContentLoaded,
      (listener = function () {
        doc.removeEventListener(domContentLoaded, listener)
        loaded = 1
        try {
          listener = fns.shift()
          listener()
        } catch (error) {
          console.error('could not shift because:', error)
        }
      }),
    )

  return function (fn) {
    if (loaded) {
      setTimeout(fn, 0)
    } else {
      fns.push(fn)
    }
  }
})

domready(function () {
  showSearchHotkeyForOS(window.navigator.platform)
  // wire up the menu trigger button
  document.querySelector('#menu_trigger').addEventListener('click', function () {
    this.classList.toggle('triggered')
    document.querySelector('#menu').classList.toggle('shown')
  })

  // sense whether user navs with keyboard
  window.addEventListener('keydown', handleFirstTab)

  // allow :active styles to work in CSS on mobile safari
  document.addEventListener('touchstart', function () {}, true)

  document.addEventListener('mousemove', onMouseMove, false)
  document.addEventListener('touchmove', onTouchMove, false)
  // The main keyboard event listener running the show
  addSearchShower()

  // and the initial mouse listener
  document.addEventListener('keydown', handleSearchKeys)

  // execute search as each character is typed
  //
  document.getElementById('searchInput').onkeyup = function () {
    executeSearch(this.value)
  }
  document.addEventListener('click', toggleSpins, false)

  // when the dom is loaded, fade in the page
  document.body.classList.remove('dom-loading')
  setTimeout(function () {
    document.documentElement.style.backgroundColor = ''
  }, 500)

  var scrollPercent,
    scrollPosition,
    relevantHeight,
    showScroll,
    bylineHeight,
    scrollinerPosition,
    byline = document.querySelector('.byline'),
    scrolliner = document.querySelector('.scrolliner'),
    main = document.querySelector('main'),
    post = document.querySelector('.post')

  // display scroll progress in sticky header
  if (scrolliner !== null && byline !== null && main !== null && post !== null) {
    main.addEventListener('scroll', function () {
      scrollPosition = main.scrollTop
      bylineHeight = byline.offsetTop
      relevantHeight = post.offsetHeight - window.innerHeight
      scrollPercent = (100 * scrollPosition) / relevantHeight
      if (typeof scrolliner === 'object') {
        showScroll = scrollPosition < bylineHeight
        scrolliner.classList.toggle('ghost', showScroll)
        scrollinerPosition = scrollPercent - 100
        scrolliner.style.transform = 'translate3d(calc(' + scrollinerPosition + '% - 4em), 0, 0)'
      }
    })
  }
})

// if keyboard navver, leave the visual accommodations alone
function handleFirstTab(e) {
  if (e.keyCode === 9) {
    // the "I am a keyboard user" key
    document.body.classList.add('user-is-tabbing')
    window.removeEventListener('keydown', handleFirstTab)
  }
}
