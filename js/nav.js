/* ==========================================================================
 * VaultDB.ai — Global Navigation Engine
 * =========================================================================
 * SINGLE SOURCE OF TRUTH for header, mobile sidebar, and footer.
 *
 * Usage: Every HTML page includes:
 *   <div id="vdb-header"></div>
 *   <div id="vdb-sidebar"></div>
 *   ... page content ...
 *   <div id="vdb-footer"></div>
 *   <script src="[depth]js/nav.js"></script>
 *
 * The script auto-detects its own depth (../ prefix) and rewrites all
 * relative paths accordingly.  No build step required.
 * ======================================================================= */

/* ---------- path-depth detection -------------------------------------- */
(function () {
  'use strict';

  var scripts = document.getElementsByTagName('script');
  var src = '';
  for (var i = 0; i < scripts.length; i++) {
    var s = scripts[i].getAttribute('src') || '';
    if (s.indexOf('js/nav.js') !== -1) { src = s; break; }
  }
  // src is e.g. "../js/nav.js" or "../../js/nav.js" or "js/nav.js"
  var idx = src.indexOf('js/nav.js');
  window._VDB_PREFIX = idx > 0 ? src.substring(0, idx) : '';

  /* helper: prefix a relative path */
  function P(path) {
    if (!path || path.charAt(0) === '#' || path.indexOf('http') === 0 || path.indexOf('mailto') === 0) return path;
    return window._VDB_PREFIX + path;
  }

  /* ====================================================================
   * MENU DATA — edit THIS to change the nav site-wide
   * ==================================================================== */

  var KRONOS_MODULES = [
    /* column 1 */
    [
      { label: 'Asset',       icon: 'fa-solid fa-cube',                    href: 'products/asset/docs/index.html' },
      { label: 'Market',      icon: 'fa-solid fa-chart-line',              href: 'products/market/docs/index.html' },
      { label: 'Liability',   icon: 'fa-solid fa-file-invoice-dollar',     href: 'products/liability/docs/index.html' },
      { label: 'Assumptions', icon: 'fa-solid fa-table',                   href: 'products/assumptions/docs/index.html' },
      { label: 'Scenario',    icon: 'fa-solid fa-shuffle',                 href: 'products/scenario/docs/index.html' }
    ],
    /* column 2 */
    [
      { label: 'Valuation',   icon: 'fa-solid fa-calculator',              href: 'products/valuation/docs/index.html' },
      { label: 'ALM',         icon: 'fa-solid fa-scale-balanced',          href: 'products/alm/docs/index.html' },
      { label: 'Trading',     icon: 'fa-solid fa-arrow-right-arrow-left',  href: 'products/trading/docs/index.html' },
      { label: 'Risk',        icon: 'fa-solid fa-shield-halved',           href: 'products/risk/docs/index.html' },
      { label: 'Reporting',   icon: 'fa-solid fa-file-lines',              href: 'products/reporting/docs/index.html' }
    ],
    /* column 3 */
    [
      { label: 'Ingestion',      icon: 'fa-solid fa-upload',      href: 'products/ingestion/docs/index.html' },
      { label: 'Dashboard',      icon: 'fa-solid fa-gauge-high',  href: 'products/dashboard/docs/index.html' },
      { label: 'Core Platform',  icon: 'fa-solid fa-microchip',   href: 'products/core/docs/index.html' }
    ]
  ];

  var DEV_ITEMS = [
    { label: 'Documentation Home',   img: 'img/Group 1000001838.png', href: 'docs/index.html', first: true },
    { label: 'System Architecture',  img: 'img/Group 1000001840.png', href: 'docs/ARCHITECTURE.html' },
    { label: 'End-to-End Architecture', img: 'img/Group 1000001843.png', href: 'docs/technology_system_architecture.html' },
    { label: 'Doc Standards',        img: 'img/Group 1000001843.png', href: 'docs/standards_SUBMODULE_DOC_CONVENTION.html', last: true }
  ];

  var DATABASE_SECTIONS = [
    {
      img: 'img/Group 1000001831.png',
      title: 'VaultDB HUB',
      desc: 'Train, Test and deploy and manage your models with integrated Governance, Risk and Controls.',
      buttons: [
        { label: 'VaultDB Database IOT Platform', href: 'database/index.html' },
        { label: 'Websites and mobile Apps', href: 'database/index.html' },
        { label: 'VaultDB Data Hub', href: 'https://docs.vaultdb.ai/hub/datahub' }
      ]
    },
    {
      img: 'img/Group 1000001832.png',
      title: 'VaultDB Compute',
      desc: 'Scalable cloud resources for distributed model execution.'
    },
    {
      img: 'img/Group 1000001793.png',
      title: 'VaultDB Actions',
      desc: 'CI/CD for compute intensive and analytical pipelines.',
      last: true
    }
  ];

  var MARKETPLACE_ITEMS = [
    { label: 'Browse All',   icon: 'fa-solid fa-store',                href: 'marketplace/index.html' },
    { label: 'Skills',       icon: 'fa-solid fa-wand-magic-sparkles',  href: 'marketplace/skills.html' },
    { label: 'MCP Servers',  icon: 'fa-solid fa-server',               href: 'marketplace/mcp-servers.html' },
    { label: 'Plugins',      icon: 'fa-solid fa-plug',                 href: 'marketplace/plugins.html' }
  ];

  var FOOTER_LINKS = [
    { label: 'VaultDB.ai', href: 'index.html' },
    { label: 'Contact Us', href: 'contact.html' },
    { label: 'About Us',   href: 'about.html' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms and Conditions', href: '#' }
  ];

  var SOCIALS = ['github', 'youtube', 'facebook', 'twitter', 'instagram', 'linkedin'];

  /* ====================================================================
   * RENDER: Desktop Header
   * ==================================================================== */

  function renderHeader() {
    var h = '';
    h += '<header class="header">';
    h += '<div class="logo">';
    h += '<img alt="" src="' + P('img/mainlogo.png') + '"/>';
    h += '<a href="' + P('index.html') + '">VaultDB.ai</a>';
    h += '</div>';

    h += '<ul class="menu_bar">';

    /* --- KRONOS Modules mega-menu --- */
    h += '<li>';
    h += '<a href="#" class="header_hover">KRONOS Modules</a>';
    h += '<ul class="dropdown-menu" style="background-color: #10101e; width: 60rem;">';
    h += '<div class="row p-4">';
    for (var ci = 0; ci < KRONOS_MODULES.length; ci++) {
      h += '<div class="col-md-4">';
      for (var ri = 0; ri < KRONOS_MODULES[ci].length; ri++) {
        var m = KRONOS_MODULES[ci][ri];
        h += '<li class="p-2"><a href="' + P(m.href) + '"><i class="' + m.icon + ' me-2 text-purple"></i>' + m.label + '</a></li>';
      }
      h += '</div>';
    }
    h += '</div></ul></li>';

    /* --- Developers dropdown --- */
    h += '<li class="second_bar">';
    h += '<a href="#" class="header_hover">Developers</a>';
    h += '<ul class="dev_menu" style="background-color: #10101e"><li>';
    for (var di = 0; di < DEV_ITEMS.length; di++) {
      var d = DEV_ITEMS[di];
      h += '<div class="dev_box">';
      h += '<img src="' + P(d.img) + '" alt="menu_logo"' + (d.first ? ' class="first_dev_img"' : '') + ' />';
      h += '<a href="' + P(d.href) + '">' + d.label + '</a>';
      if (!d.last) h += '<div class="line" style="width: 100%"></div>';
      h += '</div>';
    }
    h += '</li></ul></li>';

    /* --- Database dropdown --- */
    h += '<li class="first_bar">';
    h += '<a href="#" class="header_hover">Database</a>';
    h += '<ul class="dropdown-menu" style="background-color: #10101e">';
    // First section with buttons
    var dbFirst = DATABASE_SECTIONS[0];
    h += '<li class="first_content_container"><div class="first_content">';
    h += '<div class="dropdown_img"><img src="' + P(dbFirst.img) + '" alt="" /></div>';
    h += '<div class="dropdown_content"><p>' + dbFirst.title + '</p><p>' + dbFirst.desc + '</p></div>';
    h += '</div><div class="dropdown_btns">';
    for (var bi = 0; bi < dbFirst.buttons.length; bi++) {
      var btn = dbFirst.buttons[bi];
      h += '<a href="' + P(btn.href) + '" class="dropdown_btn">' + btn.label + '</a>';
    }
    h += '</div><div class="line"></div></li>';
    // Remaining sections
    for (var si = 1; si < DATABASE_SECTIONS.length; si++) {
      var sec = DATABASE_SECTIONS[si];
      var cls = si === 1 ? 'second_content second' : 'second_content third_content';
      h += '<li><div class="' + cls + '">';
      h += '<div class="dropdown_img"><img src="' + P(sec.img) + '" alt="" /></div>';
      h += '<div class="dropdown_content"><p>' + sec.title + '</p>';
      h += '<p' + (sec.last ? ' class="para_1"' : '') + '>' + sec.desc + '</p></div>';
      if (si === 1) h += '<div class="line_bottom"><div class="line"></div></div>';
      h += '</div></li>';
    }
    h += '</ul></li>';

    /* --- AI Marketplace dropdown --- */
    h += '<li>';
    h += '<a href="#" class="header_hover">AI Marketplace</a>';
    h += '<ul class="dropdown-menu" style="background-color: #10101e; width: 30rem;">';
    h += '<div class="p-4">';
    for (var mi = 0; mi < MARKETPLACE_ITEMS.length; mi++) {
      var mp = MARKETPLACE_ITEMS[mi];
      h += '<li class="p-2"><a href="' + P(mp.href) + '"><i class="' + mp.icon + ' me-2 text-purple"></i>' + mp.label + '</a></li>';
    }
    h += '</div></ul></li>';

    /* --- Contact Us CTA --- */
    h += '<li><a href="' + P('contact.html') + '" class="contact_btn">Contact Us</a></li>';

    h += '</ul>';

    /* hamburger icon */
    h += '<div class="header_icons"><i class="fa-solid fa-bars text-white fs-1 menu"></i></div>';
    h += '</header>';

    return h;
  }

  /* ====================================================================
   * RENDER: Mobile Sidebar
   * ==================================================================== */

  function renderSidebar() {
    var h = '';
    h += '<div class="side_accordian">';
    h += '<div class="menu_accordian">';

    /* top bar */
    h += '<div class="mobile_nav" style="background-color: var(--main-color)">';
    h += '<div class="logo">';
    h += '<img alt="" src="' + P('img/logo.png') + '"/>';
    h += '<a class="f-2" href="' + P('index.html') + '">VaultDB.ai</a>';
    h += '</div>';
    h += '<i class="fa-solid fa-xmark text-white fs-1 close_icon"></i>';
    h += '</div>';

    /* --- Developers accordion --- */
    h += '<div class="link">';
    h += '<p class="dropdown_link dropdown_bar">Developers</p>';
    for (var di = 0; di < DEV_ITEMS.length; di++) {
      var d = DEV_ITEMS[di];
      h += '<ul class="sub_menu dropdown"><a href="' + P(d.href) + '">';
      h += '<div class="dev_nav"><div class="dev_nav_box">';
      h += '<div class="dev_nav_img' + (di > 0 ? ' image' : '') + '">';
      h += '<img alt="" src="' + P(d.img) + '"/>';
      h += '</div>';
      h += '<div class="dev_para">' + d.label + '</div>';
      h += '</div></div></a></ul>';
      h += '<div class="line line_navbar" style="position: relative; bottom: 0; left: 0"></div>';
    }
    h += '</div>';

    /* --- Database accordion --- */
    h += '<div class="link">';
    h += '<p class="dropdown_link dropdown_bar">Database</p>';
    // VaultDB HUB
    var dbFirst = DATABASE_SECTIONS[0];
    h += '<ul class="sub_menu dropdown"><div class="first_menu pb-5">';
    h += '<div class="content"><div class="first_img"><img alt="" src="' + P(dbFirst.img) + '"/></div>';
    h += '<div class="first_menu_content">' + dbFirst.title + '</div></div>';
    h += '<div class="bottom_para">' + dbFirst.desc + '</div>';
    h += '<div class="first_btns">';
    h += '<a class="contact_btn first_btn" href="' + P('database/index.html') + '">VaultDB Database</a>';
    h += '<a class="contact_btn first_btn" href="' + P('database/index.html') + '">VaultDB Applications</a>';
    h += '<a class="dropdown_btn" href="https://docs.vaultdb.ai/hub/datahub">VaultDB Data Hub</a>';
    h += '</div></div></ul>';
    h += '<div class="line line_navbar" style="position: relative; bottom: 0; left: 0"></div>';
    // Compute & Actions
    for (var si = 1; si < DATABASE_SECTIONS.length; si++) {
      var sec = DATABASE_SECTIONS[si];
      h += '<ul class="sub_menu dropdown"><div class="second_menu first_menu' + (si === 1 ? ' mt-5' : '') + '">';
      h += '<div class="content"><div class="second_img first_img"><img alt="" src="' + P(sec.img) + '"/></div>';
      h += '<div class="first_menu_content">' + sec.title + '</div></div>';
      h += '<div class="bottom_para">' + sec.desc + '</div>';
      h += '</div></ul>';
      h += '<div class="line line_navbar" style="position: relative; bottom: 0; left: 0"></div>';
    }
    h += '</div>';

    /* --- AI Marketplace accordion --- */
    h += '<div class="link">';
    h += '<p class="dropdown_link dropdown_bar">AI Marketplace</p>';
    for (var mi = 0; mi < MARKETPLACE_ITEMS.length; mi++) {
      var mp = MARKETPLACE_ITEMS[mi];
      h += '<ul class="sub_menu dropdown"><a href="' + P(mp.href) + '">';
      h += '<div class="dev_nav"><div class="dev_nav_box">';
      h += '<div class="dev_nav_img image">';
      h += '<i class="' + mp.icon + ' text-purple fs-4" style="padding: 0.5rem;"></i>';
      h += '</div>';
      h += '<div class="dev_para">' + mp.label + '</div>';
      h += '</div></div></a></ul>';
      h += '<div class="line line_navbar" style="position: relative; bottom: 0; left: 0"></div>';
    }
    h += '</div>';

    /* --- Contact Us CTA (mobile) --- */
    h += '<div class="link" style="border: 0; outline: 0">';
    h += '<div class="middle" style="border: 0">';
    h += '<a class="contact_btn" href="' + P('contact.html') + '">Contact Us</a>';
    h += '</div></div>';

    h += '</div></div>';
    return h;
  }

  /* ====================================================================
   * RENDER: Footer
   * ==================================================================== */

  function renderFooter() {
    var h = '';
    h += '<div class="container_body"><div class="container_inside">';
    h += '<section class="footer_section">';
    h += '<div class="footer mt-5" data-aos="fade-left" data-aos-duration="2000">';
    h += '<div class="left"><img alt="" src="' + P('img/mainlogo.png') + '">';
    h += '<a class="footer_logo" href="' + P('index.html') + '">VaultDB.ai</a></div>';
    h += '<div class="right" style="margin-bottom: 10px">';
    for (var si = 0; si < SOCIALS.length; si++) {
      h += '<a href="#"><i class="fa-brands fa-' + SOCIALS[si] + '"></i></a>';
    }
    h += '</div></div>';

    h += '<div><div class="row mb-5"><div class="line mb-5"></div>';
    h += '<div class="col-md-4 col-sm-12 col-lg-4"><h5 class="bottom_left">VaultDB.ai @ 2026. All rights reserved.</h5></div>';
    h += '<div class="col-md-8 col-sm-12 col-lg-8 bottom_right">';
    for (var fi = 0; fi < FOOTER_LINKS.length; fi++) {
      var fl = FOOTER_LINKS[fi];
      h += '<a href="' + P(fl.href) + '">' + fl.label + '</a>';
    }
    h += '</div></div></div>';

    h += '<div class="footer_box"><img alt="" class="footer_img" src="' + P('img/Rectangle 9.png') + '"></div>';
    h += '</section></div></div>';
    return h;
  }

  /* ====================================================================
   * BIND: Event listeners (mobile menu toggle, sidebar toggle)
   * ==================================================================== */

  function bindNavEvents() {
    /* hamburger open */
    var menuIcon = document.querySelector('.menu');
    if (menuIcon) {
      menuIcon.addEventListener('click', function () {
        document.querySelector('.side_accordian').classList.add('sidebar_active');
      });
    }

    /* close icon */
    var closeIcon = document.querySelector('.close_icon');
    if (closeIcon) {
      closeIcon.addEventListener('click', function () {
        document.querySelector('.side_accordian').classList.remove('sidebar_active');
      });
    }

    /* sidebar accordion toggles */
    var links = document.querySelectorAll('.side_accordian .link');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        this.classList.toggle('active');
      });
    }
  }

  /* ====================================================================
   * INIT
   * ==================================================================== */

  function init() {
    var headerEl  = document.getElementById('vdb-header');
    var sidebarEl = document.getElementById('vdb-sidebar');
    var footerEl  = document.getElementById('vdb-footer');

    if (headerEl)  headerEl.innerHTML  = renderHeader();
    if (sidebarEl) sidebarEl.innerHTML = renderSidebar();
    if (footerEl)  footerEl.innerHTML  = renderFooter();

    bindNavEvents();
  }

  /* Run on DOMContentLoaded or immediately if already loaded */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
