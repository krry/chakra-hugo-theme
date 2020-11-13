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

export function addSearchShower() {
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
export function handleSearchKeys(event) {
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

export default executeSearch
