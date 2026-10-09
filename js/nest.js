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
