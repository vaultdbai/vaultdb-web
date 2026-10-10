// VaultDB Nest page: FAQ accordion and mobile menu (same behavior as js/index.js,
// plus keyboard and screen reader support).

// FAQ
document.querySelectorAll('.accordian_box').forEach(function (box) {
  var button = box.querySelector('.label_box')
  if (!button) return
  button.addEventListener('click', function () {
    var open = box.classList.toggle('active')
    button.setAttribute('aria-expanded', open ? 'true' : 'false')
  })
})

// Mobile sidebar
var sidebar = document.querySelector('.side_accordian')
var menuButton = document.querySelector('.menu')
var closeButton = document.querySelector('.close_icon')

function setSidebar(open) {
  if (!sidebar) return
  sidebar.classList.toggle('sidebar_active', open)
  if (menuButton) menuButton.setAttribute('aria-expanded', open ? 'true' : 'false')
  if (open && closeButton) closeButton.focus()
  if (!open && menuButton) menuButton.focus()
}

if (menuButton) {
  menuButton.addEventListener('click', function () {
    setSidebar(true)
  })
}
if (closeButton) {
  closeButton.addEventListener('click', function () {
    setSidebar(false)
  })
}
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && sidebar && sidebar.classList.contains('sidebar_active')) {
    setSidebar(false)
  }
})

// Sidebar sections expand on tap
document.querySelectorAll('.link').forEach(function (section) {
  section.addEventListener('click', function () {
    section.classList.toggle('active')
  })
})

// Download buttons: Windows is the only build for now. The markup links to a
// fixed release so it works without JS (and from file://); when
// downloads/nest/latest.json can be read (the file the app's updater also
// reads), the buttons switch to its version and installer URL.
;(function () {
  var buttons = document.querySelectorAll('.js-nest-download')
  if (buttons.length === 0) return

  // Visitors on macOS or Linux still get the Windows button, plus a note
  var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || ''
  if (!/win/i.test(platform)) {
    document.querySelectorAll('.js-nest-soon-note').forEach(function (note) {
      note.hidden = false
    })
  }

  if (!window.fetch || window.location.protocol === 'file:') return
  fetch('downloads/nest/latest.json', { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status)
      return response.json()
    })
    .then(function (release) {
      var windows = release && release.platforms && release.platforms['windows-x86_64']
      var version = release && typeof release.version === 'string' ? release.version.replace(/^v/, '') : null
      var url = windows && typeof windows.url === 'string' ? windows.url : null
      if (!version || !/^\d+\.\d+\.\d+/.test(version) || !url || !/^https:\/\/|^downloads\//.test(url)) return
      buttons.forEach(function (button) {
        button.setAttribute('href', url)
      })
      document.querySelectorAll('.js-nest-version').forEach(function (label) {
        label.textContent = 'v' + version
      })
    })
    .catch(function () {
      // Keep the static link and version from the markup
    })
})()
