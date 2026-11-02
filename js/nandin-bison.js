// The Nandin bison (css/nandin-bison.css): pose switching, the hero's small
// "live" demo, and the companion in the corner. Plain script, no modules.
//
// The pose follows the same rule as the app (src/lib/mascot.ts, nandinState):
// just approved -> done (for 1.5 s), an approval waiting -> wait, agents
// running -> carry, otherwise rest.
;(function () {
  var DONE_MS = 1500
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function nandinState(input) {
    if (input.now < input.doneUntil) return 'done'
    if (input.pendingApprovals > 0) return 'wait'
    if (input.runningAgents > 0) return 'carry'
    return 'rest'
  }

  // Every part image shows the pose's file; the standing copy (used when the
  // resting bison gets up) always shows the standing pose
  function setPose(bison, pose) {
    if (!bison || bison.getAttribute('data-pose') === pose) return
    bison.querySelectorAll('.bp-part').forEach(function (img) {
      var file = img.classList.contains('bp-stand') ? 'wait' : pose
      img.setAttribute('src', 'img/nandin-bison-' + file + '.webp')
    })
    bison.setAttribute('data-pose', pose)
  }

  // Hero demo: agents start, one needs approval, you approve, it finishes
  var demo = document.querySelector('.js-bison-demo')
  if (demo) {
    var bison = demo.querySelector('.bison')
    var label = demo.querySelector('.js-bison-label')
    var status = demo.querySelector('.js-bison-status')
    var approve = demo.querySelector('.js-bison-approve')
    var model = { pendingApprovals: 0, runningAgents: 0, doneUntil: 0 }
    var timers = []

    var words = {
      rest: { label: 'Nandin is resting: nothing needs you', status: 'Nothing needs you. Nothing is running.' },
      carry: { label: 'Nandin is carrying work: agents are running', status: 'Agents at work in their containers.' },
      wait: { label: 'Nandin is waiting for your approval', status: 'PR Reviewer wants to post a review. It waits for you.' },
      done: { label: 'Nandin is happy: approved', status: 'Approved. It goes on the record.' },
    }

    function render() {
      var pose = nandinState({
        pendingApprovals: model.pendingApprovals,
        runningAgents: model.runningAgents,
        doneUntil: model.doneUntil,
        now: Date.now(),
      })
      setPose(bison, pose)
      if (label) label.setAttribute('aria-label', words[pose].label)
      if (status && status.textContent !== words[pose].status) status.textContent = words[pose].status
      // aria-disabled, not disabled, so keyboard focus stays on the button
      if (approve) approve.setAttribute('aria-disabled', model.pendingApprovals === 0 ? 'true' : 'false')
    }

    function later(ms, fn) {
      timers.push(window.setTimeout(function () {
        fn()
        render()
      }, ms))
    }

    function cycle() {
      timers.forEach(window.clearTimeout)
      timers = []
      model.pendingApprovals = 0
      model.runningAgents = 0
      render()
      later(3500, function () {
        model.runningAgents = 2
      })
      later(8500, function () {
        model.pendingApprovals = 1
      })
    }

    if (approve) {
      approve.addEventListener('click', function () {
        if (model.pendingApprovals === 0) return
        model.pendingApprovals = 0
        model.doneUntil = Date.now() + DONE_MS
        render()
        later(DONE_MS, function () {})
        later(DONE_MS + 4000, function () {
          model.runningAgents = 0
        })
        if (!reduceMotion) later(DONE_MS + 12000, cycle)
      })
    }

    // With reduced motion nothing changes by itself: it starts waiting on you
    if (reduceMotion) {
      model.runningAgents = 1
      model.pendingApprovals = 1
      render()
    } else {
      cycle()
    }
  }

  // Companion: a small resting bison that takes you back to the top once
  // you've scrolled past the hero
  var companion = document.querySelector('.js-bison-companion')
  if (companion) {
    var hero = document.querySelector('.nest_hero')
    var update = function () {
      var past = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 600
      companion.classList.toggle('is-visible', past)
      companion.setAttribute('tabindex', past ? '0' : '-1')
      companion.setAttribute('aria-hidden', past ? 'false' : 'true')
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
  }
})()
