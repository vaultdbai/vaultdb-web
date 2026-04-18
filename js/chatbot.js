/* =========================================================================
 * VaultDB.ai — AI Chatbot Widget
 * =========================================================================
 * Floating chat bubble that opens an AI Studio-deployed chatbot
 * hosted on Google Cloud Run.
 *
 * PAGE-AWARE CONTEXT: The widget auto-detects which page it is on
 * (ALM, Market, Database, etc.) and passes page-specific context
 * to the chatbot via a URL query parameter (?context=...).
 *
 * SELF-LOADING: This script is auto-injected by nav.js — no need to
 * add <script> tags to individual pages.
 *
 * Pure vanilla JS.  No build step.  No framework.
 * ======================================================================= */
(function () {
  'use strict';

  /* ---------- Configuration ------------------------------------------- */
  // Actual Cloud Run URL from AI Studio deployment
  var CHATBOT_URL = 'https://kronos-re-chatbot-84478811006.us-west1.run.app';

  /* ---------- Page context map ---------------------------------------- */
  // Maps URL path segments to page-specific context strings.
  // The chatbot receives this as ?context=... so the AI Studio app
  // can prepend it to the system prompt or use it as initial context.
  var PAGE_CONTEXTS = {

    /* ─── Top-level pages ───────────────────────────────────────────── */
    'index': 'You are on the VaultDB.ai homepage. KRONOS Re is an AI-native Bermuda ' +
      'reinsurance sidecar that captures the "complexity tax" in annuity reinsurance. ' +
      'Help visitors understand the platform overview, partnership model with Private ' +
      'Equity, and how VaultDB replaces legacy actuarial departments with AI.',

    'about': 'You are on the About Us page. Help visitors learn about the VaultDB team, ' +
      'company mission, and the story behind KRONOS Re. The company is focused on ' +
      'AI-driven actuarial automation for reinsurance.',

    'contact': 'You are on the Contact page. Help visitors reach VaultDB for ' +
      'partnerships, demos, or general inquiries. Direct them to contact@vaultdb.ai ' +
      'or the contact form on this page.',

    'privacy': 'You are on the Privacy Policy page. Help visitors understand ' +
      'VaultDB data handling and privacy practices.',

    'terms': 'You are on the Terms of Service page. Help visitors understand ' +
      'VaultDB terms and conditions.',

    /* ─── Database pages ────────────────────────────────────────────── */
    'database': 'You are on the VaultDB Database page. VaultDB Database is built on ' +
      'DuckDB — a high-performance, in-process analytical database. It supports OLAP ' +
      'workloads, columnar storage, SQL queries, and seamless integration with Python ' +
      'and Pandas. VaultDB extends DuckDB with domain-specific financial data models, ' +
      'ORM layer, caching, transactions, and a compute/task engine. Help visitors ' +
      'understand the database architecture, DuckLake integration, and how VaultDB ' +
      'manages actuarial and financial data at scale.',

    /* ─── KRONOS modules (products) ─────────────────────────────────── */
    'ingestion': 'You are on the Ingestion module page. VaultDB Ingestion handles the ' +
      'census data pipeline — importing policy-level data from insurers and cedants. ' +
      'It supports batch processing of actuarial memorandums, prospectus PDFs, and ' +
      'structured census files (CSV/Excel). The module normalizes heterogeneous data ' +
      'into VaultDB canonical schemas for downstream analysis.',

    'market': 'You are on the Market module page. VaultDB Market manages yield curves, ' +
      'OAS spread curves, risk factors, and daily market data feeds. It supports US ' +
      'Treasury curves, corporate bond curves (IG/HY), MBS prepayment data, EUR and ' +
      'EM bond markets. The module handles daily save orchestration and provides ' +
      'historical curve lookups for valuation and scenario analysis.',

    'assumptions': 'You are on the Assumptions module page. VaultDB Assumptions manages ' +
      'actuarial assumption tables — mortality (SOA tables, improvement scales), lapse ' +
      'rates (dynamic and static), expense assumptions, and policyholder behavior models. ' +
      'These feed into liability projections and are versioned for audit trails.',

    'asset': 'You are on the Asset module page. VaultDB Asset provides pricing engines ' +
      'and Greeks calculation for fixed income and derivative instruments. It covers ' +
      'bond pricing (bullet, callable, MBS), option Greeks (Delta, Gamma, Vega, Theta), ' +
      'and portfolio-level analytics. The module supports real-time MTM and attribution.',

    'liability': 'You are on the Liability module page. VaultDB Liability handles ' +
      'actuarial cash flow projection, reserve calculations, and policyholder behavior ' +
      'modeling. It projects annuity cash flows (Fixed, FIA, RILA, VA), calculates ' +
      'statutory and GAAP reserves, and models guarantee costs using stochastic methods.',

    'scenario': 'You are on the Scenario module page. VaultDB Scenario provides stress ' +
      'testing and Monte Carlo simulation engines. It generates interest rate scenarios ' +
      '(real-world and risk-neutral), equity return paths, and multi-factor economic ' +
      'scenarios for liability valuation and risk assessment.',

    'valuation': 'You are on the Valuation module page. VaultDB Valuation handles ' +
      'portfolio mark-to-market, fair value calculations, and attribution analysis. ' +
      'It supports GAAP fair value (ASC 820), statutory valuation, and economic ' +
      'balance sheet approaches used in Bermuda regulatory reporting.',

    'alm': 'You are on the ALM (Asset-Liability Management) module page. VaultDB ALM ' +
      'manages gap analysis, Key Rate Duration (KRD) matching, duration/convexity ' +
      'management, and cash flow matching optimization. It ensures the asset portfolio ' +
      'is properly aligned with liability obligations to minimize interest rate risk ' +
      'and optimize the investment strategy.',

    'trading': 'You are on the Trading module page. VaultDB Trading handles automated ' +
      'hedging strategies and execution. It implements Dynamic Delta/Vega hedging for ' +
      'FIA/RILA products, duration matching for Fixed Annuities, and programmatic ' +
      'rebalancing 24/7 to lock in spreads regardless of macro-rate volatility.',

    'risk': 'You are on the Risk module page. VaultDB Risk covers BSCR (Bermuda ' +
      'Solvency Capital Requirement) calculation, Value-at-Risk (VaR), stress testing, ' +
      'and capital modeling. It is designed for BMA principles-based regulatory ' +
      'compliance and supports NAIC AG 55 requirements.',

    'reporting': 'You are on the Reporting module page. VaultDB Reporting generates ' +
      'GAAP financial statements, statutory (STAT) filings, and BSCR regulatory ' +
      'returns for the Bermuda Monetary Authority. It automates the compilation of ' +
      'actuarial exhibits, financial schedules, and audit-ready documentation.',

    'dashboard': 'You are on the Dashboard module page. VaultDB Dashboard provides the ' +
      'analytics UI and AI chatbot integration — a unified interface for portfolio ' +
      'monitoring, risk dashboards, and natural language querying of actuarial data.',

    'core': 'You are on the Core Framework page. VaultDB Core provides the foundational ' +
      'infrastructure — data modeling, ORM, CRUD operations, transactions, compute/task ' +
      'engine, scheduling, caching, OAuth2 authentication, web API, logging, and ' +
      'configuration management. All domain modules depend on Core.',

    'infrastructure': 'You are on the Infrastructure page. VaultDB Infrastructure covers ' +
      'deployment, DevOps, CI/CD, Docker containerization, and cloud hosting on AWS/GCP.',

    /* ─── Marketplace pages ─────────────────────────────────────────── */
    'marketplace': 'You are on the AI Marketplace page. The VaultDB Marketplace hosts ' +
      'plugins, skills, and MCP servers that extend the KRONOS Re platform. Users can ' +
      'browse, install, and configure AI-powered actuarial tools.',

    'skills': 'You are on the Skills marketplace page. VaultDB Skills are domain-specific ' +
      'AI instruction sets that teach AI agents how to perform actuarial tasks — like ' +
      'yield curve construction, reserve calculation, or portfolio optimization.',

    'plugins': 'You are on the Plugins marketplace page. VaultDB Plugins are installable ' +
      'extensions that add new capabilities to the KRONOS Re platform.',

    'mcp-servers': 'You are on the MCP Servers marketplace page. MCP (Model Context ' +
      'Protocol) servers connect AI agents to external tools and data sources.'
  };

  /* ---------- Detect page context ------------------------------------- */
  function detectPageContext() {
    // 1. Look for dynamic context injected by build_docs.py
    var metaTag = document.querySelector('meta[name="vdb-context"]');
    if (metaTag && metaTag.getAttribute('content')) {
      return metaTag.getAttribute('content');
    }

    // 2. Fallback to URL path detection for static hardcoded pages
    var path = window.location.pathname.toLowerCase().replace(/\\/g, '/');

    // Try to match the most specific path segment first
    // E.g. /products/alm/docs/index.html → "alm"
    // E.g. /database/index.html → "database"
    // E.g. /marketplace/skills.html → "skills"

    // Check for specific filenames first (skills.html, mcp-servers.html, etc.)
    var filename = path.split('/').pop().replace('.html', '');
    if (PAGE_CONTEXTS[filename] && filename !== 'index') {
      return PAGE_CONTEXTS[filename];
    }

    // Check path segments from right to left for known module names
    var segments = path.split('/').filter(function (s) { return s && s !== 'index.html'; });
    for (var i = segments.length - 1; i >= 0; i--) {
      var seg = segments[i].replace('.html', '');
      if (PAGE_CONTEXTS[seg]) {
        return PAGE_CONTEXTS[seg];
      }
    }

    // Fallback: homepage context
    return PAGE_CONTEXTS['index'];
  }

  /* ---------- Inject CSS dynamically ---------------------------------- */
  function loadCSS() {
    // Use the same path prefix detection as nav.js
    var prefix = window._VDB_PREFIX || '';
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = prefix + 'css/chatbot.css';
    document.head.appendChild(link);
  }

  /* ---------- Inject HTML --------------------------------------------- */
  function buildWidget() {
    /* — Floating trigger button — */
    var trigger = document.createElement('button');
    trigger.id = 'vdb-chat-trigger';
    trigger.setAttribute('aria-label', 'Open AI chat assistant');
    trigger.innerHTML =
      '<i class="fa-solid fa-robot"></i>' +
      '<i class="fa-solid fa-xmark"></i>';
    document.body.appendChild(trigger);

    /* — Chat panel (shell + iframe) — */
    var panel = document.createElement('div');
    panel.id = 'vdb-chat-panel';
    panel.innerHTML =
      /* Header */
      '<div class="vdb-chat-header">' +
        '<div class="vdb-chat-header-avatar">' +
          '<i class="fa-solid fa-robot"></i>' +
        '</div>' +
        '<div class="vdb-chat-header-text">' +
          '<h4>VaultDB AI Assistant</h4>' +
          '<span>Digital Chief Actuary</span>' +
        '</div>' +
      '</div>' +
      /* Iframe container */
      '<div class="vdb-chat-iframe-wrap">' +
        '<iframe ' +
          'id="vdb-chat-iframe" ' +
          'src="about:blank" ' +
          'title="VaultDB AI Chatbot" ' +
          'allow="clipboard-write" ' +
          'sandbox="allow-scripts allow-same-origin allow-forms allow-popups" ' +
        '></iframe>' +
      '</div>';

    document.body.appendChild(panel);
  }

  /* ---------- Build the iframe URL with context ----------------------- */
  function buildChatUrl() {
    var context = detectPageContext();
    var url = CHATBOT_URL;
    if (context) {
      var sep = url.indexOf('?') === -1 ? '?' : '&';
      url += sep + 'context=' + encodeURIComponent(context);
    }
    return url;
  }

  /* ---------- Toggle logic -------------------------------------------- */
  function init() {
    loadCSS();
    buildWidget();

    var trigger = document.getElementById('vdb-chat-trigger');
    var panel   = document.getElementById('vdb-chat-panel');
    var iframe  = document.getElementById('vdb-chat-iframe');
    var loaded  = false;

    trigger.addEventListener('click', function () {
      var isOpen = panel.classList.contains('visible');

      if (isOpen) {
        /* Close */
        panel.classList.remove('visible');
        trigger.classList.remove('open');
      } else {
        /* Open */
        panel.classList.add('visible');
        trigger.classList.add('open');

        /* Lazy-load the iframe on first open */
        if (!loaded) {
          iframe.src = buildChatUrl();
          loaded = true;
        }
      }
    });
  }

  /* ---------- Boot ---------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
