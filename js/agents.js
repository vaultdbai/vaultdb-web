// Agent Hub page (agents.html): renders the VaultDB Nest registry snapshot in
// js/catalog-data.js (window.NEST_CATALOG, written by scripts/build-catalog.mjs).
// Search, kind and tag filters, and a detail dialog. Each entry has its own
// link (#agent/<id> or #pack/<id>) that opens its details.
;(function () {
  var data = window.NEST_CATALOG
  var grid = document.getElementById('market-grid')
  if (!data || !grid) return

  var entries = data.entries || []
  var state = { kind: 'all', tag: null, query: '' }
  var search = document.getElementById('market-search')
  var count = document.getElementById('market-count')
  var tagBox = document.getElementById('market-tags')
  var dialog = document.getElementById('market-dialog')
  var detail = document.getElementById('market-detail')
  var lastFocus = null

  var KIND_ICON = { agent: 'fa-robot', pack: 'fa-boxes-stacked' }

  function el(tag, attrs, children) {
    var node = document.createElement(tag)
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === 'text') node.textContent = attrs[key]
      else if (key === 'className') node.className = attrs[key]
      else node.setAttribute(key, attrs[key])
    })
    ;(children || []).forEach(function (child) {
      if (child) node.appendChild(child)
    })
    return node
  }
  function icon(name) {
    return el('i', { className: 'fa-solid ' + name, 'aria-hidden': 'true' })
  }
  function hashFor(entry) {
    return '#' + entry.kind + '/' + entry.id
  }
  function kindLabel(kind) {
    return kind === 'pack' ? 'Pack' : 'Agent'
  }
  function searchText(e) {
    return [e.name, e.description, e.publisher, e.publisherName, e.id].concat(e.tags).join(' ').toLowerCase()
  }
  function matches(e) {
    if (state.kind !== 'all' && e.kind !== state.kind) return false
    if (state.tag && e.tags.indexOf(state.tag) === -1) return false
    var text = searchText(e)
    return state.query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .every(function (word) {
        return text.indexOf(word) !== -1
      })
  }

  // Tags, most used first
  var tagCounts = {}
  entries.forEach(function (e) {
    e.tags.forEach(function (t) {
      tagCounts[t] = (tagCounts[t] || 0) + 1
    })
  })
  var tags = Object.keys(tagCounts).sort(function (a, b) {
    return tagCounts[b] - tagCounts[a] || a.localeCompare(b)
  })
  tags.slice(0, 14).forEach(function (t) {
    tagBox.appendChild(
      el('button', { type: 'button', className: 'market_chip market_chip_tag', 'data-tag': t, 'aria-pressed': 'false', text: '#' + t })
    )
  })

  function card(e) {
    var link = el('a', { href: hashFor(e), className: 'market_card_link', text: e.name })
    var meta = el('p', { className: 'market_meta' }, [
      el('span', { className: 'market_kind market_kind_' + e.kind }, [icon(KIND_ICON[e.kind]), document.createTextNode(' ' + kindLabel(e.kind))]),
      el('span', { text: 'v' + e.version }),
      el('span', {}, [
        document.createTextNode(e.publisherName),
        e.verified ? el('i', { className: 'fa-solid fa-circle-check text-purple ms-1', title: 'Signed by the publisher', 'aria-label': 'signed by the publisher' }) : null,
      ]),
    ])
    var tagList = el(
      'ul',
      { className: 'market_tag_list', 'aria-label': 'Tags' },
      e.tags.slice(0, 4).map(function (t) {
        return el('li', { text: t })
      })
    )
    var extra = null
    if (e.kind === 'pack') {
      extra = el('p', { className: 'market_extra', text: e.agents.length + ' agents' + (e.workflows.length ? ', ' + e.workflows.length + ' workflows' : '') })
    }
    return el('li', { className: 'col-lg-4 col-md-6 col-sm-12' }, [
      el('article', { className: 'product_card nest_card market_card' }, [
        el('h3', { className: 'h4 text-white' }, [link]),
        meta,
        el('p', { className: 'text-gray market_desc', text: e.description }),
        extra,
        tagList,
      ]),
    ])
  }

  function render() {
    var shown = entries.filter(matches)
    grid.textContent = ''
    shown.forEach(function (e) {
      grid.appendChild(card(e))
    })
    if (shown.length === 0) {
      grid.appendChild(el('li', { className: 'col-12' }, [el('p', { className: 'nest_note text-center', text: 'Nothing matches. Try another search or clear the filters.' })]))
    }
    var agents = shown.filter(function (e) { return e.kind === 'agent' }).length
    count.textContent = 'Showing ' + agents + (agents === 1 ? ' agent' : ' agents') + ' and ' + (shown.length - agents) + (shown.length - agents === 1 ? ' pack' : ' packs')
  }

  document.querySelectorAll('.market_chip[data-kind]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      state.kind = chip.getAttribute('data-kind')
      document.querySelectorAll('.market_chip[data-kind]').forEach(function (c) {
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false')
      })
      render()
    })
  })
  tagBox.addEventListener('click', function (event) {
    var chip = event.target.closest('.market_chip_tag')
    if (!chip) return
    var tag = chip.getAttribute('data-tag')
    state.tag = state.tag === tag ? null : tag
    tagBox.querySelectorAll('.market_chip_tag').forEach(function (c) {
      c.setAttribute('aria-pressed', c.getAttribute('data-tag') === state.tag ? 'true' : 'false')
    })
    render()
  })
  search.addEventListener('input', function () {
    state.query = search.value
    render()
  })

  // -- Detail dialog --------------------------------------------------------

  function codeList(items) {
    if (!items || items.length === 0) return el('span', { className: 'text-gray', text: 'None' })
    return el(
      'ul',
      { className: 'market_code_list' },
      items.map(function (item) {
        return el('li', {}, [el('code', { text: item })])
      })
    )
  }

  function capabilityTable(e) {
    var c = e.capabilities
    var rows = [
      ['Tools', c.tools],
      ['Pauses for your approval', c.requiresApproval],
      ['Network hosts', c.network],
      ['Pilots (OS control)', c.pilots],
    ]
    if (c.aws && c.aws.length) rows.push(['AWS services', c.aws])
    return el(
      'dl',
      { className: 'market_caps' },
      rows.map(function (row) {
        return el('div', {}, [el('dt', { text: row[0] }), el('dd', {}, [codeList(row[1])])])
      })
    )
  }

  function find(kind, id) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].kind === kind && entries[i].id === id) return entries[i]
    }
    return null
  }

  function showDetail(e) {
    var noun = e.kind === 'pack' ? 'pack' : 'agent'
    var facts = [
      ['Version', 'v' + e.version],
      ['Needs VaultDB Nest', e.minNestVersion + ' or newer'],
      ['Publisher', e.publisherName + (e.verified ? ' (signed release)' : '')],
    ]
    if (e.estimatedCostUsd) facts.push(['Estimated cost per run', '$' + e.estimatedCostUsd.min + ' to $' + e.estimatedCostUsd.max + ' (publisher estimate)'])
    if (e.kind === 'pack' && e.installSizeKb) facts.push(['Install size', e.installSizeKb + ' KB'])
    if (e.license) facts.push(['License', e.license])

    var body = [
      el('p', { className: 'market_meta' }, [
        el('span', { className: 'market_kind market_kind_' + e.kind }, [icon(KIND_ICON[e.kind]), document.createTextNode(' ' + kindLabel(e.kind))]),
        e.verified ? el('span', {}, [el('i', { className: 'fa-solid fa-circle-check text-purple me-1', 'aria-hidden': 'true' }), document.createTextNode('Signed by the publisher')]) : null,
      ]),
      el('h2', { id: 'market-dialog-title', className: 'market_dialog_title', text: e.name }),
      el('p', { className: 'market_dialog_desc', text: e.description }),
      el('ul', { className: 'market_tag_list', 'aria-label': 'Tags' }, e.tags.map(function (t) { return el('li', { text: t }) })),
      el('dl', { className: 'market_facts' }, facts.map(function (f) {
        return el('div', {}, [el('dt', { text: f[0] }), el('dd', { text: f[1] })])
      })),
    ]

    if (e.kind === 'pack') {
      body.push(el('h3', { text: 'What is in this pack' }))
      body.push(
        el('ul', { className: 'market_pack_agents' }, e.agents.map(function (a) {
          var target = find('agent', a.id)
          var name = target ? el('a', { href: '#agent/' + a.id, className: 'nest_inline_link', text: a.name }) : el('strong', { text: a.name })
          return el('li', {}, [name, a.description ? el('span', { className: 'text-gray', text: ': ' + a.description }) : null])
        }))
      )
      if (e.workflows.length) {
        body.push(el('p', { className: 'text-gray' }, [document.createTextNode('Workflows: '), codeList(e.workflows)]))
      }
    }

    body.push(el('h3', { text: 'What it asks for' }))
    body.push(el('p', { className: 'text-gray', text: 'You approve each item before this ' + noun + ' first runs. Anything not listed is denied by the container runtime and the egress proxy.' }))
    body.push(capabilityTable(e))

    body.push(el('h3', { text: 'Install in VaultDB Nest' }))
    body.push(
      el('ol', { className: 'market_install' }, [
        el('li', {}, [document.createTextNode('Install VaultDB Nest from the '), el('a', { href: 'index.html#download', className: 'nest_inline_link', text: 'download section' }), document.createTextNode(' (Docker required).')]),
        el('li', { text: 'Open VaultDB Nest and go to Marketplace.' }),
        el('li', {}, [document.createTextNode('Search for the ID '), el('code', { text: e.id }), document.createTextNode(' and choose Install.')]),
        el('li', { text: 'Review the capabilities, then allow them on first run.' }),
      ])
    )
    var links = [el('a', { href: 'index.html#download', className: 'contact_btn', text: 'Download VaultDB Nest' })]
    if (e.repoUrl) links.push(el('a', { href: e.repoUrl, className: 'nest_btn_outline' }, [el('i', { className: 'fa-brands fa-github me-2', 'aria-hidden': 'true' }), document.createTextNode('Source on GitHub')]))
    body.push(el('div', { className: 'nest_actions' }, links))

    detail.textContent = ''
    body.forEach(function (node) {
      if (node) detail.appendChild(node)
    })
    if (!dialog.open) {
      lastFocus = document.activeElement
      if (dialog.showModal) dialog.showModal()
      else dialog.setAttribute('open', '')
    }
    dialog.scrollTop = 0
    document.getElementById('market-close').focus()
  }

  function closeDetail() {
    if (dialog.open) {
      if (dialog.close) dialog.close()
      else dialog.removeAttribute('open')
    }
  }

  function fromHash() {
    var m = /^#(agent|pack)\/([a-z0-9-]+)$/.exec(window.location.hash)
    var entry = m ? find(m[1], m[2]) : null
    if (entry) showDetail(entry)
    else closeDetail()
  }

  dialog.addEventListener('close', function () {
    if (/^#(agent|pack)\//.test(window.location.hash)) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus()
  })
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) closeDetail() // click on the backdrop
  })
  document.getElementById('market-close').addEventListener('click', closeDetail)
  window.addEventListener('hashchange', fromHash)

  var source = document.getElementById('market-source')
  if (source) {
    source.textContent = ''
    source.appendChild(document.createTextNode(entries.length + ' entries from the '))
    source.appendChild(el('a', { href: data.registryWebUrl, className: 'nest_inline_link', text: 'VaultDB Nest registry' }))
    source.appendChild(document.createTextNode(', snapshot of ' + data.snapshotDate + '.'))
  }

  render()
  fromHash()
})()
