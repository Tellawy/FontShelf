import {
  extractImagePalette,
  applyThemeVariablesToRoot,
  normalizePaletteHexes
} from './theme-palette.js';

const STORE_URL = 'https://apps.microsoft.com/detail/9MT69GPXZ0S9';
const REPO_URL = 'https://github.com/Tellawy/FontShelf';
const ISSUES_URL = 'https://github.com/Tellawy/FontShelf/issues';
const PUBLISHER_STORE_URL = 'https://apps.microsoft.com/search/publisher?name=Mahmoud+Tellawy';
const EMAIL = 'MTellawy@Gmail.com';

// Sanitized public manifest excerpt: shows strictly scoped virtualization, OS minimum, and capabilities
// without publishing Store Identity / Publisher CN identifiers.
const PUBLIC_MANIFEST_EXCERPT = `<Properties>
  <DisplayName>FontShelf</DisplayName>
  <PublisherDisplayName>Mahmoud Tellawy</PublisherDisplayName>
  <virtualization:FileSystemWriteVirtualization>
    <virtualization:ExcludedDirectories>
      <virtualization:ExcludedDirectory>$(KnownFolder:LocalAppData)\\Microsoft\\Windows\\Fonts</virtualization:ExcludedDirectory>
    </virtualization:ExcludedDirectories>
  </virtualization:FileSystemWriteVirtualization>
  <virtualization:RegistryWriteVirtualization>
    <virtualization:ExcludedKeys>
      <virtualization:ExcludedKey>HKEY_CURRENT_USER\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts</virtualization:ExcludedKey>
    </virtualization:ExcludedKeys>
  </virtualization:RegistryWriteVirtualization>
</Properties>

<Dependencies>
  <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.22000.0" MaxVersionTested="10.0.26100.0" />
</Dependencies>

<Capabilities>
  <Capability Name="internetClient" />
  <rescap:Capability Name="runFullTrust" />
  <rescap:Capability Name="unvirtualizedResources" />
</Capabilities>`;

const SLIDES = [
  { src: 'assets/1.png', caption: 'Amber Dark Theme — Dynamic image palette with Arabic & Latin font previews' },
  { src: 'assets/2.png', caption: 'Unified Font Library — Installed, local folders, bundled, and Google Fonts in one shelf' },
  { src: 'assets/3.png', caption: 'Live Sample Inspector — Edit specimen text for one font or across your entire library' },
  { src: 'assets/4.png', caption: 'Daylight Light Theme — Crisp high-contrast workspace for bright studio environments' },
  { src: 'assets/5.png', caption: 'Grid View & Family Grouping — Collapse multi-weight families and expand styles inline' },
  { src: 'assets/6.png', caption: '2,000+ Google Fonts Built In — Preview live and install directly to Windows in one click' },
  { src: 'assets/7.png', caption: 'Forest Emerald Theme — Custom color palette extracted automatically from imagery' },
  { src: 'assets/8.png', caption: 'Combinable Multi-Filters — Ctrl+Click scopes, folders, custom groups, and languages' },
  { src: 'assets/9.png', caption: 'Multilingual & RTL Previews — Native specimens across 13+ languages including Arabic & CJK' },
  { src: 'assets/10.png', caption: 'Select Mode & Custom Groups — Multi-select fonts to tag, install, copy, or remove' },
  { src: 'assets/11.png', caption: 'Visual Match Ranking — Ranked similarity percentages across all supported scripts' },
  { src: 'assets/12.png', caption: 'Offline Search by Image — Crop and auto-level tilted lettering 100% locally on device' }
];

const FAQ_ITEMS = [
  {
    id: 'faq-pricing',
    q: 'Is FontShelf a subscription or a one-time purchase?',
    a: 'FontShelf is a <strong>one-time purchase</strong> on the Microsoft Store. There are no recurring subscriptions, no in-app purchases, and no accounts required. Buy once and own your desktop font studio forever.',
    ctxTitle: 'One-Time Purchase',
    ctxLead: 'Zero monthly subscriptions or cloud accounts—available directly through the Microsoft Store.'
  },
  {
    id: 'faq-offline',
    q: 'Does Search by Image upload my screenshots or require internet?',
    a: 'No. Visual font matching runs <strong>100% locally on your Windows 11 device</strong>. Cropping, auto-leveling, embedding extraction, and similarity scoring happen entirely offline—even across the 2,000+ pre-indexed Google Fonts catalog. Your images never leave your PC.',
    ctxTitle: '100% On-Device Matching',
    ctxLead: 'Zero cloud uploads and zero tracking. Works cleanly even when completely offline.'
  },
  {
    id: 'faq-google',
    q: 'How do the 2,000+ built-in Google Fonts work?',
    a: 'Open the <strong>Google</strong> tab inside FontShelf to search, preview live specimens, favorite, assign to custom groups, or install straight to your Windows account in one click—no browser downloads or ZIP extraction needed.',
    ctxTitle: 'Built-In Google Fonts',
    ctxLead: 'Preview and install over 2,000 Google Fonts in one click without leaving the app.'
  },
  {
    id: 'faq-languages',
    q: 'Does FontShelf support Arabic, RTL, and other non-Latin languages?',
    a: 'Yes. FontShelf includes native specimens and automatic script detection for <strong>13+ languages</strong>, including Arabic (RTL), English, French, German, Spanish, Greek, Russian, Hebrew (RTL), Hindi, Thai, Japanese, Korean, and Simplified Chinese. Visual search also ranks matches globally across all supported scripts.',
    ctxTitle: 'Multilingual & RTL Native',
    ctxLead: 'First-class Arabic, Hebrew, Cyrillic, Greek, Indic, Thai, and CJK rendering and matching.'
  },
  {
    id: 'faq-win11',
    q: 'Why does FontShelf require Windows 11?',
    a: 'FontShelf targets <strong>Windows 11 (10.0.22000.0+, x64)</strong> so it can rely on native MSIX Flexible Virtualization. That keeps 100% of app settings and caches virtualized while exposing strictly the per-user Windows font folder and HKCU key—never needing broad virtualization disables.',
    ctxTitle: 'Windows 11 Security',
    ctxLead: 'MinVersion 10.0.22000.0 guarantees scoped MSIX Flexible Virtualization on every PC.'
  },
  {
    id: 'faq-other-apps',
    q: 'Will fonts installed via FontShelf appear in Word, Photoshop, Figma, and browsers?',
    a: 'Yes—immediately. FontShelf installs validated <code>.ttf</code>, <code>.otf</code>, <code>.ttc</code>, and <code>.otc</code> fonts into <code>%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts</code>, registers them in <code>HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts</code>, loads them via <code>AddFontResourceW</code>, and broadcasts <code>WM_FONTCHANGE</code>.',
    ctxTitle: 'Instant Cross-App Visibility',
    ctxLead: 'Installed per-user fonts appear right away in all creative and office applications.'
  },
  {
    id: 'faq-protected',
    q: 'Can FontShelf overwrite or remove my Windows system fonts or existing user fonts?',
    a: 'Windows system fonts in <code>%WINDIR%\\Fonts</code> and <code>HKLM</code> are strictly <strong>read-only</strong> and can never be modified, deactivated, or removed. For per-user fonts installed outside FontShelf, FontShelf uses collision-safe filenames and displays an explicit warning in the right panel before replacing a conflicting registration or uninstalling any non-FontShelf font.',
    ctxTitle: 'System & Non-FontShelf Guards',
    ctxLead: 'Read-only system fonts, collision-safe filenames, and explicit confirmation prompts.'
  },
  {
    id: 'faq-locked',
    q: 'What happens if another app has a font open when I try to uninstall it?',
    a: 'FontShelf removes the font file <strong>before</strong> deleting its <code>HKCU</code> registry entry. If another running app holds an open lock on the file, FontShelf rolls back cleanly via <code>AddFontResourceW</code> + <code>WM_FONTCHANGE</code>, keeps both the file and registry intact, and notifies you so you can close that app and retry.',
    ctxTitle: 'Clean Locked-File Rollback',
    ctxLead: 'Zero broken registry entries or half-deleted files when a font is actively in use.'
  },
  {
    id: 'faq-remove-all',
    q: 'Can I uninstall all fonts that FontShelf installed in one click?',
    a: 'Yes. FontShelf tracks every font it installs in its persistent install ledger and displays them alongside the 39 built-in fonts in the <strong>FontShelf</strong> tab (as well as in <strong>Installed</strong>). In the <strong>FontShelf</strong> tab, click the uninstall-all icon next to <strong>+</strong> and complete the 2-step confirmation in the right panel (single check → <em>Are you sure?</em> + double check). Only FontShelf-installed fonts are uninstalled, originals move safely to the Windows Recycle Bin, and every font remains restorable from the <strong>Removed</strong> tab.',
    ctxTitle: 'One-Click Uninstall & Restore',
    ctxLead: 'Uninstall only FontShelf-installed fonts from the FontShelf tab, keeping them in the Recycle Bin and Removed tab.'
  },
  {
    id: 'faq-uninstall',
    q: 'What remains if I uninstall FontShelf, and how do I remove fonts afterward?',
    a: 'Uninstalling FontShelf via Windows Settings automatically deletes the MSIX package and 100% of its virtualized settings and caches, while leaving installed fonts intact so existing documents keep rendering properly. You can remove any font anytime via <strong>Windows Settings → Personalization → Fonts → Uninstall</strong>.',
    ctxTitle: 'Clean Uninstall Lifecycle',
    ctxLead: 'App data is automatically removed by Windows; installed fonts remain manageable in Windows Settings.'
  }
];

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const PAGES = {
  home: {
    id: 'home',
    title: 'Home',
    breadcrumb: 'Home',
    route: 'index.html',
    documentTitle: 'FontShelf — Find It. Preview It. Own It.',
    context: {
      eyebrow: 'OVERVIEW',
      title: 'FontShelf for Windows 11',
      lead: 'A fast, offline-first font studio uniting installed fonts, local folders, curated offline typefaces, and 2,000+ Google Fonts.',
      chips: [
        { label: 'Windows 11 (x64)', cls: 'is-accent' },
        { label: 'v1.0.0', cls: '' },
        { label: '100% Offline Core', cls: 'is-green' }
      ],
      facts: [
        { k: 'Store Product ID', v: '9MT69GPXZ0S9' },
        { k: 'Publisher', v: 'Mahmoud Tellawy' },
        { k: 'Theme Engine', v: 'Use the bottom-left switch and + picker or drop any image onto the theme bar.' }
      ],
      primaryAction: { label: 'Get on Microsoft Store', href: STORE_URL, external: true }
    },
    cards: [
      {
        id: 'home-hero',
        isHero: true,
        shortTitle: 'App Showcase',
        title: 'FontShelf — Find It. Preview It. Own It.',
        summary: 'Native Windows 11 font studio with offline visual font search, dynamic image themes, and built-in Google Fonts.',
        searchText: 'fontshelf home overview find preview own windows 11 offline visual search themes google fonts store 9MT69GPXZ0S9'
      },
      {
        id: 'home-pillars',
        icon: 'hgi-dashboard-square-01',
        shortTitle: 'Why FontShelf',
        title: 'Why FontShelf',
        summary: 'Four core pillars crafted for designers, developers, and multilingual typographers.',
        searchText: 'offline visual search dynamic image themes 2000 google fonts multilingual arabic rtl native rust webview2 zero subscriptions accounts',
        html: `
          <div class="card-grid-2">
            <div>
              <p><strong>Offline Visual Search</strong><br>Paste or drop any screenshot, crop &amp; auto-level tilted lettering, and identify matching fonts 100% locally across installed, folder, bundled, and 2,000+ indexed Google Fonts.</p>
            </div>
            <div>
              <p><strong>Dynamic Image Themes</strong><br>Drop any photo or brand artwork onto the bottom-left theme panel to extract a balanced, contrast-safe Dark and Light palette across the entire workspace.</p>
            </div>
            <div>
              <p><strong>Unified Font Workspace</strong><br>Browse Windows fonts, unlimited external folders (without cluttering Windows), 39 offline bundled fonts, and 2,000+ Google Fonts with 1-click per-user install.</p>
            </div>
            <div>
              <p><strong>Private &amp; One-Time Owned</strong><br>Zero accounts, zero analytics, zero cloud uploads. Built with Rust + WebView2 for smooth virtual scrolling and instant session resume.</p>
            </div>
          </div>
        `
      },
      {
        id: 'home-workflow',
        icon: 'hgi-layer',
        shortTitle: 'How It Works',
        title: 'How It Works & Who It\'s For',
        summary: 'From unknown lettering or large local archives to installed, organized typefaces in seconds.',
        searchText: 'how it works workflow graphic designers brand studios web developers ui ux arabic typographers archives',
        html: `
          <div class="steps-grid">
            <div class="step-box">
              <span class="step-num">1</span>
              <p><strong>Unite Every Source</strong><br>Browse Windows fonts, external project folders, 39 offline bundled fonts, and 2,000+ Google Fonts side by side.</p>
            </div>
            <div class="step-box">
              <span class="step-num">2</span>
              <p><strong>Match &amp; Preview Live</strong><br>Drop any image to identify fonts offline across scripts, test custom text in 13+ languages, or drag rows to peek long lines.</p>
            </div>
            <div class="step-box">
              <span class="step-num">3</span>
              <p><strong>Install &amp; Organize Safely</strong><br>Group favorites, install validated fonts per-user in one click, or uninstall all FontShelf-installed fonts anytime.</p>
            </div>
          </div>
          <div class="chip-row">
            <span class="chip is-accent">Graphic Designers &amp; Brand Studios</span>
            <span class="chip is-accent">Web &amp; UI/UX Teams</span>
            <span class="chip is-accent">Arabic &amp; Multilingual Typographers</span>
            <span class="chip is-accent">Large Local Font Archives</span>
          </div>
        `
      },
      {
        id: 'home-safety',
        icon: 'hgi-checkmark-circle-02',
        shortTitle: 'Windows Font Safety',
        title: 'Transparent Windows 11 Font Safety',
        summary: 'Strictly scoped per-user font management built for Windows 11 MSIX Flexible Virtualization.',
        searchText: 'msix flexible virtualization unvirtualizedResources hkcu localappdata microsoft windows fonts validation ledger remove all uninstall safety',
        html: `
          <p>FontShelf installs user-selected fonts strictly to your personal Windows account (<code>%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts</code> and <code>HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts</code>) so Word, Photoshop, Figma, and browsers can use them immediately.</p>
          <p>All app settings and caches remain isolated inside the MSIX package. Windows system fonts in <code>%WINDIR%\\Fonts</code> and <code>HKLM</code> are strictly read-only, non-FontShelf fonts are protected by explicit warnings, and a built-in install ledger enables one-click removal of all FontShelf-installed fonts.</p>
        `
      }
    ]
  },

  features: {
    id: 'features',
    title: 'Features',
    breadcrumb: 'Features',
    route: 'index.html#features',
    documentTitle: 'FontShelf — Features & Shortcuts',
    context: {
      eyebrow: 'CAPABILITIES',
      title: 'Full Studio Feature Set',
      lead: 'Offline visual font search, dynamic image themes, 2,000+ Google Fonts, and 13+ languages in a native Windows 11 shell.',
      chips: [
        { label: 'Visual Search', cls: 'is-accent' },
        { label: '2,000+ Google Fonts', cls: 'is-green' },
        { label: '13+ Languages', cls: '' }
      ],
      facts: [
        { k: 'Supported Formats', v: '.ttf, .otf, .ttc, .otc' },
        { k: 'Bundled Fonts', v: '39 offline fonts ready out of the box' },
        { k: 'Layouts', v: 'List View, Grid View & Family Grouping' }
      ],
      primaryAction: { label: 'Get on Microsoft Store', href: STORE_URL, external: true }
    },
    cards: [
      {
        id: 'feat-visual-search',
        icon: 'hgi-image-02',
        shortTitle: 'Offline Visual Search',
        title: 'Offline Visual Font Search (Search by Image)',
        summary: 'Paste or drop any screenshot, crop & auto-level tilted text, and identify matching fonts 100% locally.',
        searchText: 'offline visual font search image paste ctrl+v crop auto-level neural matching cross-language top 10 local folders google fonts',
        html: `
          <ul class="web-list">
            <li><strong>Paste or Drop Any Image:</strong> Press <code>Ctrl+V</code>, drag-and-drop, or pick any poster, logo, or screenshot.</li>
            <li><strong>Interactive Crop &amp; Auto-Level:</strong> Select a tight bounding box around lettering and straighten tilted lines before scoring.</li>
            <li><strong>100% On-Device Ranking:</strong> Computes similarity percentages completely offline across Installed fonts, Watched Folders, Bundled fonts, and 2,000+ pre-indexed Google Fonts.</li>
            <li><strong>Global Cross-Language Ranking:</strong> Automatically surfaces the top 10 matches across all supported scripts unless a specific language filter is selected.</li>
          </ul>
        `
      },
      {
        id: 'feat-themes',
        icon: 'hgi-star',
        shortTitle: 'Dynamic Image Themes',
        title: 'Dynamic Image-Extracted Themes',
        summary: 'Generate harmonious, contrast-safe Dark and Light workspace palettes from any photo or brand artwork.',
        searchText: 'dynamic themes image palette extractor dark light mode contrast safe custom theme reset drag drop',
        html: `
          <p>Drop any image onto the bottom-left theme panel (or click the <strong>+</strong> icon) to extract up to 7 balanced colors and adapt every surface, border, and accent across both Dark and Light modes.</p>
          <p>Try it right here on this page using the bottom-left theme controls—it runs FontShelf's exact <code>theme-palette.js</code> color engine with one-click reset back to default Dark or Light.</p>
        `
      },
      {
        id: 'feat-library',
        icon: 'hgi-globe-02',
        shortTitle: 'Unified Library & Google Fonts',
        title: 'Unified Library, Folders & 2,000+ Google Fonts',
        summary: 'Browse Windows fonts, external folders, offline bundled fonts, and Google Fonts together without clutter.',
        searchText: 'unified library folders google fonts 2000 bundled poppins noto sans al-jazeera install one click soft remove restore',
        html: `
          <ul class="web-list">
            <li><strong>Unlimited Watched Folders &amp; Smart Tabs:</strong> Preview archives and project folders locally without installing unused fonts to Windows, browse read-only Windows fonts in the dedicated <strong>System</strong> tab, and revisit up to 100 recently used fonts in <strong>Recent</strong>.</li>
            <li><strong>2,000+ Google Fonts Built In:</strong> Open the <strong>Google</strong> tab to search, preview live, favorite, group, or install Google Fonts straight to your Windows account in one click.</li>
            <li><strong>FontShelf Tab &amp; 39 Built-In Fonts:</strong> Unites 39 curated offline fonts (Poppins, Noto Sans, Al-Jazeera) with every font installed via FontShelf, plus a dedicated one-click Uninstall All FontShelf Fonts button.</li>
            <li><strong>Safe Remove &amp; Restore:</strong> User fonts uninstalled individually or via the one-click Uninstall All FontShelf Fonts action are sent to the Windows Recycle Bin and staged in the <strong>Removed</strong> tab so you can restore or permanently delete them anytime with inline right-panel confirmation.</li>
          </ul>
        `
      },
      {
        id: 'feat-multilingual',
        icon: 'hgi-layer',
        shortTitle: '13+ Languages & Bulk Workflow',
        title: '13+ Languages, RTL & Fast Bulk Organization',
        summary: 'Native specimens across Latin, Arabic, Hebrew, Cyrillic, Greek, Devanagari, Thai, and CJK with combinable filters.',
        searchText: 'multilingual rtl arabic english french german spanish greek russian hebrew hindi thai japanese korean chinese list grid family grouping ctrl+click bulk select',
        html: `
          <ul class="web-list">
            <li><strong>Automatic Script Detection:</strong> Native samples across English, Arabic (RTL), French, German, Spanish, Greek, Russian, Hebrew (RTL), Hindi, Thai, Japanese, Korean, and Simplified Chinese.</li>
            <li><strong>List &amp; Grid Views + Family Grouping:</strong> Collapse multi-weight families and expand styles inline, drag overflowing rows downward to peek full text, and edit live samples across one font or all fonts.</li>
            <li><strong>Combinable Multi-Filters:</strong> Hold <code>Ctrl+Click</code> to intersect scopes, folders, custom groups, favorites, and languages simultaneously.</li>
            <li><strong>Select Mode &amp; Bulk Actions:</strong> Batch favorite, assign custom groups, copy font files or font names, install, remove, or restore.</li>
          </ul>
        `
      },
      {
        id: 'feat-shortcuts',
        icon: 'hgi-laptop-check',
        shortTitle: 'Keyboard Shortcuts',
        title: 'Keyboard Shortcuts & Gestures',
        summary: 'Fast keyboard navigation designed for high-volume font libraries.',
        searchText: 'shortcuts keyboard ctrl+k ctrl+click ctrl+v shift+click arrow up down f11 escape drag peek zoom',
        html: `
          <table class="kv-table">
            <thead><tr><th>Action</th><th>Shortcut / Gesture</th></tr></thead>
            <tbody>
              <tr><td>Focus search</td><td><code>Ctrl + K</code></td></tr>
              <tr><td>Combine sidebar filters</td><td><code>Ctrl + Click</code> on scopes, folders, groups, languages</td></tr>
              <tr><td>Paste image for Visual Search</td><td><code>Ctrl + V</code></td></tr>
              <tr><td>Range / Multi-select rows</td><td><code>Shift + Click</code> / <code>Ctrl + Click</code></td></tr>
              <tr><td>Navigate font list</td><td><code>Arrow Up</code> / <code>Arrow Down</code></td></tr>
              <tr><td>Zoom interface in / out</td><td><code>Ctrl +</code> / <code>Ctrl -</code></td></tr>
              <tr><td>Toggle maximize</td><td><code>F11</code></td></tr>
              <tr><td>Close panel, warning, or selection</td><td><code>Escape</code></td></tr>
              <tr><td>Peek overflowing sample text</td><td>Drag bottom edge of any list row</td></tr>
            </tbody>
          </table>
        `
      }
    ]
  },

  download: {
    id: 'download',
    title: 'Download',
    breadcrumb: 'Download',
    route: 'download.html',
    documentTitle: 'FontShelf — Download for Windows 11',
    context: {
      eyebrow: 'GET FONTSHELF',
      title: 'Microsoft Store Edition',
      lead: 'Signed MSIX package distributed through Microsoft Store for Windows 11 (x64). One-time purchase with zero subscriptions.',
      chips: [
        { label: 'Store ID: 9MT69GPXZ0S9', cls: 'is-accent' },
        { label: 'Windows 11 (x64)', cls: 'is-green' },
        { label: 'v1.0.0', cls: '' }
      ],
      facts: [
        { k: 'Minimum OS', v: 'Windows 11 version 10.0.22000.0 or higher' },
        { k: 'Architecture', v: '64-bit (x64)' },
        { k: 'Package Format', v: 'MSIX with Scoped Flexible Virtualization' }
      ],
      primaryAction: { label: 'Open in Microsoft Store', href: STORE_URL, external: true }
    },
    cards: [
      {
        id: 'dl-store',
        icon: 'hgi-download-04',
        shortTitle: 'Microsoft Store',
        title: 'Get FontShelf on Microsoft Store',
        summary: 'Official signed MSIX release for Windows 11 with automatic updates and clean uninstall.',
        searchText: 'download microsoft store 9MT69GPXZ0S9 buy get fontshelf windows 11 x64 one time purchase no subscription 1.0.0',
        html: `
          <p>Download the official Microsoft Store release of <strong>FontShelf</strong> for Windows 11. One-time purchase—no subscriptions, no accounts, and full offline functionality.</p>
          <div class="chip-row">
            <span class="chip is-accent">Product ID: 9MT69GPXZ0S9</span>
            <span class="chip is-green">Windows 11 (10.0.22000.0+)</span>
            <span class="chip">64-bit (x64)</span>
            <span class="chip">v1.0.0</span>
          </div>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${STORE_URL}" target="_blank" rel="noopener">Get FontShelf on Microsoft Store</a>
            <a class="btn" href="${REPO_URL}" target="_blank" rel="noopener">GitHub Repository</a>
          </div>
        `
      },
      {
        id: 'dl-requirements',
        icon: 'hgi-laptop-check',
        shortTitle: 'System Requirements',
        title: 'System Requirements & Offline Readiness',
        summary: 'Windows 11 minimum version ensures native MSIX Flexible Virtualization without legacy broad disables.',
        searchText: 'system requirements windows 11 10.0.22000.0 x64 webview2 offline google fonts network',
        html: `
          <table class="kv-table">
            <tbody>
              <tr><td>Operating System</td><td><strong>Windows 11</strong> (version <code>10.0.22000.0</code> or higher)</td></tr>
              <tr><td>Architecture</td><td>64-bit (<code>x64</code>)</td></tr>
              <tr><td>Version</td><td><code>1.0.0</code></td></tr>
              <tr><td>Runtime</td><td>Native Rust backend + Microsoft Edge WebView2 (pre-installed on Windows 11)</td></tr>
              <tr><td>Supported Font Formats</td><td><code>.ttf</code>, <code>.otf</code>, <code>.ttc</code>, <code>.otc</code> (max 50 MB per file, validated before install)</td></tr>
              <tr><td>Offline Capability</td><td>All core features—including local library, folders, themes, and visual font search—work 100% offline. Internet is optional and used solely for Google Fonts.</td></tr>
            </tbody>
          </table>
        `
      }
    ]
  },

  faq: {
    id: 'faq',
    title: 'FAQ',
    breadcrumb: 'FAQ',
    route: 'index.html#faq',
    documentTitle: 'FontShelf — Frequently Asked Questions',
    context: {
      eyebrow: 'COMMON QUESTIONS',
      title: 'Frequently Asked Questions',
      lead: 'Direct answers on pricing, offline visual search, Google Fonts, Arabic/RTL support, Windows 11 font safety, and uninstallation.',
      chips: [
        { label: '10 Answers', cls: 'is-accent' },
        { label: 'One-Time Purchase', cls: 'is-green' }
      ],
      facts: [
        { k: 'Need more help?', v: `Email ${EMAIL} or visit Support & Contact.` }
      ],
      primaryAction: { label: `Email ${EMAIL}`, href: `mailto:${EMAIL}`, external: false }
    },
    cards: [
      {
        id: 'faq-accordion',
        isFaq: true,
        shortTitle: 'All Questions',
        title: 'Frequently Asked Questions',
        summary: 'Click any question below to expand or collapse the answer.',
        searchText: FAQ_ITEMS.map(i => `${i.q} ${i.a}`).join(' ')
      }
    ]
  },

  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    breadcrumb: 'Privacy Policy',
    route: 'privacy.html',
    documentTitle: 'FontShelf — Privacy Policy',
    context: {
      eyebrow: 'PRIVACY',
      title: 'Zero Tracking. 100% Local.',
      lead: 'FontShelf does not collect, store, track, or share personal information. Your fonts, folders, themes, and images stay strictly on your device.',
      chips: [
        { label: 'No Telemetry', cls: 'is-green' },
        { label: 'No Accounts', cls: 'is-green' }
      ],
      facts: [
        { k: 'Publisher', v: 'Mahmoud Tellawy' },
        { k: 'Contact Email', v: EMAIL },
        { k: 'Optional Network', v: 'Google Fonts catalog & download only when initiated by the user' }
      ],
      primaryAction: { label: `Email ${EMAIL}`, href: `mailto:${EMAIL}`, external: false }
    },
    cards: [
      {
        id: 'privacy-statement',
        icon: 'hgi-checkmark-circle-02',
        shortTitle: 'Privacy Statement',
        title: 'Privacy Policy — FontShelf',
        summary: 'Official privacy statement by Mahmoud Tellawy (MTellawy@Gmail.com).',
        searchText: 'privacy policy mahmoud tellawy mtellawy@gmail.com no tracking no personal information local device google fonts offline images',
        html: `
          <p><strong>Publisher:</strong> Mahmoud Tellawy · <a href="mailto:${EMAIL}">${EMAIL}</a></p>
          <p>Dear Customer,</p>
          <p>As the creator of <strong>FontShelf</strong>, I take your privacy seriously. I want to assure you that FontShelf does not collect, store, track, or share any personal information from its users.</p>
          <p>Your installed fonts, local folders, custom groups, favorites, custom themes, and any images you use for visual font matching stay <strong>100% locally on your device</strong>. No account is required, and your files or images are never uploaded to external servers.</p>
          <p>Optional internet access is used solely when you choose to browse, preview, or download fonts from <strong>Google Fonts</strong>. All other features — including visual font search — work completely offline.</p>
          <p>If you have any questions or concerns about this privacy policy, please don't hesitate to contact me at <a href="mailto:${EMAIL}"><strong>${EMAIL}</strong></a>.</p>
          <p>Sincerely,<br><strong>Mahmoud Tellawy</strong></p>
        `
      },
      {
        id: 'privacy-network',
        icon: 'hgi-globe-02',
        shortTitle: 'Network & External Links',
        title: 'Network Access & External Links',
        summary: 'Exact scope of the internetClient capability.',
        searchText: 'internetClient google fonts network api fonts.googleapis.com external links https only',
        html: `
          <ul class="web-list">
            <li><strong>Google Fonts (User-Initiated Only):</strong> FontShelf connects to Google Fonts APIs only when you open the <strong>Google</strong> tab, preview online fonts, or click Install on a Google Font.</li>
            <li><strong>Safe External Links:</strong> Outbound links validate strict <code>https://</code> URLs before launching your default browser.</li>
            <li><strong>Zero Background Telemetry:</strong> FontShelf contains no ad SDKs, crash-upload beacons, analytics trackers, or user profiling services.</li>
          </ul>
        `
      }
    ]
  },

  'font-access': {
    id: 'font-access',
    title: 'Windows Font Access',
    breadcrumb: 'Windows Font Access',
    route: 'support.html#font-access',
    documentTitle: 'FontShelf — Windows Font Access & Virtualization Scope',
    context: {
      eyebrow: 'FONT ACCESS',
      title: 'Scoped Flexible Virtualization',
      lead: 'Unvirtualized access is limited strictly to 1 per-user folder and 1 HKCU key; all app data stays isolated inside MSIX.',
      chips: [
        { label: 'HKCU Only', cls: 'is-green' },
        { label: 'Zero HKLM Writes', cls: 'is-green' },
        { label: 'Windows 11+', cls: 'is-accent' }
      ],
      facts: [
        { k: 'Excluded Directory', v: '%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts' },
        { k: 'Excluded Registry Key', v: 'HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts' },
        { k: 'System Modifications', v: 'None (HKLM & %WINDIR%\\Fonts are read-only)' }
      ]
    },
    cards: [
      {
        id: 'fa-scope',
        icon: 'hgi-folder-01',
        shortTitle: 'Per-User Font Scope',
        title: 'Per-User Windows Font Scope',
        summary: 'MSIX Flexible Virtualization is restricted strictly to the two per-user Windows font locations.',
        searchText: 'flexible virtualization excludedDirectories excludedKeys localappdata microsoft windows fonts hkcu software microsoft windows nt currentversion fonts virtualized appdata no hklm windir font substitution linking services drivers scheduled tasks acls',
        html: `
          <p>Windows only makes per-user fonts visible to other applications (Word, Figma, Photoshop, browsers, and Windows Settings) when files and registrations reside in the real per-user font directory and registry key rather than an app-private MSIX virtualized overlay. FontShelf limits unvirtualized access strictly to:</p>
          <div class="path-row">
            <div class="path-row-text">
              <span class="path-row-label">Excluded Directory (1 only)</span>
              <span class="path-row-val">%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts</span>
            </div>
            <button class="btn btn-sm" type="button" data-copy="%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts">Copy</button>
          </div>
          <div class="path-row">
            <div class="path-row-text">
              <span class="path-row-label">Excluded Registry Key (1 only)</span>
              <span class="path-row-val">HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts</span>
            </div>
            <button class="btn btn-sm" type="button" data-copy="HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts">Copy</button>
          </div>
          <ul class="web-list">
            <li><strong>All App Data Remains Virtualized:</strong> Preferences (<code>preferences.json</code>), font metadata caches (<code>fonts-cache.json</code>), visual search indexes, removed-font undo staging, and WebView2 state remain 100% virtualized inside FontShelf's MSIX container.</li>
            <li><strong>Zero System Modifications:</strong> FontShelf <strong>never</strong> writes to or deletes from <code>HKLM</code>, <code>%WINDIR%\\Fonts</code>, <code>FontSubstitutes</code>, <code>FontLink</code>, system directories, Windows services, kernel drivers, scheduled tasks, or file/registry ACLs.</li>
            <li><strong>Read-Only System Fonts Tab:</strong> All Windows system fonts in <code>%WINDIR%\\Fonts</code> or registered under <code>HKLM</code> are separated into their own read-only <strong>System</strong> tab with uninstall/removal disabled in both UI and backend.</li>
          </ul>
        `
      },
      {
        id: 'fa-manifest',
        icon: 'hgi-layer',
        shortTitle: 'MSIX Virtualization Config',
        title: 'MSIX Virtualization & Capability Configuration',
        summary: 'Relevant manifest properties, Windows 11 dependency, and capability declarations showing zero broad virtualization disables.',
        searchText: 'appxmanifest xml manifest package virtualization FileSystemWriteVirtualization RegistryWriteVirtualization ExcludedDirectories ExcludedKeys TargetDeviceFamily 10.0.22000.0 unvirtualizedResources runFullTrust',
        html: `
          <div class="code-block-wrap">
            <div class="code-block-head">
              <span>Relevant AppxManifest.xml Sections (Properties, Dependencies &amp; Capabilities)</span>
            </div>
            <pre class="code-pre">${escapeHtml(PUBLIC_MANIFEST_EXCERPT)}</pre>
          </div>
          <p>No legacy <code>desktop6:FileSystemWriteVirtualization</code> or <code>desktop6:RegistryWriteVirtualization</code> global disables are declared anywhere in the package.</p>
        `
      },
      {
        id: 'fa-win11-useraction',
        icon: 'hgi-tick-02',
        shortTitle: 'Windows 11 & User Action Only',
        title: 'Windows 11 Requirement & Direct User-Action-Only Guarantee',
        summary: 'No Windows 10 broad-disable fallback exists; every font install or removal requires explicit user action.',
        searchText: 'windows 10 fallback behavior MinVersion 10.0.22000.0 windows 11 direct user action startup scan read only no background automatic install remove',
        html: `
          <ul class="web-list">
            <li><strong>No Windows 10 Broad Fallback:</strong> FontShelf declares <code>TargetDeviceFamily MinVersion="10.0.22000.0"</code> (Windows 11 21H2+), where MSIX Flexible Virtualization is natively supported on every compatible device. Virtualization is never disabled broadly.</li>
            <li><strong>Direct User Action Only:</strong> FontShelf <strong>never</strong> installs, uninstalls, modifies, or unloads Windows fonts on app launch, during library scanning, or in background tasks. Startup font scanning is strictly read-only.</li>
            <li><strong>Explicit Commands Only:</strong> All writes to <code>%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts</code>, <code>HKCU\\...\\Fonts</code>, <code>AddFontResourceW</code>, and <code>RemoveFontResourceW</code> occur strictly in response to a direct user action (Install, Remove, Restore, or Uninstall All FontShelf Fonts).</li>
          </ul>
        `
      }
    ]
  },

  safety: {
    id: 'safety',
    title: 'Safety & Validation',
    breadcrumb: 'Safety & Validation',
    route: 'support.html#safety',
    documentTitle: 'FontShelf — Font Validation, Conflict Protection & Ledger',
    context: {
      eyebrow: 'FONT SAFETY',
      title: 'Transactional Font Safety',
      lead: 'Six-stage pre-install validation, collision-safe naming, explicit non-FontShelf warnings, clean locked-file rollback, and 1-click remove-all.',
      chips: [
        { label: '.ttf .otf .ttc .otc', cls: 'is-accent' },
        { label: 'SHA-256 Dedupe', cls: 'is-green' },
        { label: 'Clean Rollback', cls: 'is-green' }
      ],
      facts: [
        { k: 'Max File Size', v: '50 MB enforced before reading into memory' },
        { k: 'Collision Rule', v: 'Never overwrites files; uses {stem}-{sha256[..7]}.{ext}' },
        { k: 'Install Ledger', v: 'Tracked in virtualized preferences.json' }
      ]
    },
    cards: [
      {
        id: 'safe-validation',
        icon: 'hgi-checkmark-circle-02',
        shortTitle: 'Formats & Validation',
        title: 'Supported Formats & 6-Stage Pre-Install Validation',
        summary: 'Every font file is strictly validated before any copy, registry write, or GDI session call.',
        searchText: 'supported font formats ttf otf ttc otc validation symlink reparse size 50mb magic bytes sfnt ttf_parser glyph_count units_per_em sha256 path traversal',
        html: `
          <p><strong>Exact Supported Formats:</strong> TrueType (<code>.ttf</code>), OpenType (<code>.otf</code>), TrueType Collection (<code>.ttc</code>), and OpenType Collection (<code>.otc</code>). Web/legacy formats (<code>.woff</code>, <code>.woff2</code>, <code>.eot</code>, <code>.fon</code>) and all non-font files are rejected.</p>
          <ol class="web-list">
            <li><strong>Regular File Check:</strong> Uses <code>symlink_metadata</code> to verify a regular file and reject symlinks, junctions, and reparse points.</li>
            <li><strong>Extension &amp; Size Gate:</strong> Allows only <code>.ttf</code>/<code>.otf</code>/<code>.ttc</code>/<code>.otc</code> and enforces <code>1 byte .. 50 MB</code> before reading bytes.</li>
            <li><strong>Header Magic Verification:</strong> Checks SFNT/TTC headers (<code>00 01 00 00</code>, <code>OTTO</code>, <code>true</code>, <code>typ1</code>, <code>ttcf</code>).</li>
            <li><strong>Full Structural Parse (<code>ttf-parser</code>):</strong> Verifies valid face count, <code>units_per_em &gt; 0</code>, <code>number_of_glyphs &gt; 0</code>, and non-empty family/full names.</li>
            <li><strong>Sanitized Path Boundary:</strong> Strips all path separators and validates the resolved destination remains strictly inside <code>%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts</code>.</li>
            <li><strong>SHA-256 Digest:</strong> Computes content hash for exact duplicate detection and collision-safe naming.</li>
          </ol>
        `
      },
      {
        id: 'safe-conflicts',
        icon: 'hgi-tag-01',
        shortTitle: 'Duplicates & Conflicts',
        title: 'Duplicate Files, Duplicate Names & Non-FontShelf Protection',
        summary: 'Existing files and non-FontShelf registrations are never silently overwritten or removed.',
        searchText: 'duplicate file sha256 idempotent duplicate filename stem hash7 conflicting registry value name non-fontshelf warning right panel explicit confirmation',
        html: `
          <ul class="web-list">
            <li><strong>Exact Duplicate File (Same SHA-256):</strong> If the identical font file is already installed and registered in <code>HKCU\\...\\Fonts</code>, FontShelf performs a clean idempotent no-op without duplicating files or editing registry values.</li>
            <li><strong>Same Filename, Different Content:</strong> Existing files are <strong>never</strong> overwritten. FontShelf generates a collision-safe filename <code>{stem}-{sha256[..7]}.{ext}</code> and creates it exclusively (<code>create_new(true)</code>).</li>
            <li><strong>Conflicting Registry Registration:</strong> Before copying any file or writing to <code>HKCU</code>, FontShelf checks whether <code>&lt;FullName&gt; (TrueType|OpenType)</code> already points to a different file. If so, installation pauses and shows an explicit conflict warning in the right panel displaying both paths. Only if the user explicitly confirms replacement does FontShelf proceed—and the prior file on disk is never deleted.</li>
            <li><strong>Non-FontShelf Removal Guard:</strong> Attempting to uninstall any external per-user font not recorded in FontShelf's install ledger triggers a concise explicit warning in the right panel listing each affected font before any change occurs.</li>
          </ul>
        `
      },
      {
        id: 'safe-transactions',
        icon: 'hgi-waste-restore',
        shortTitle: 'Transactions & Rollback',
        title: 'Install/Removal Sequence & Locked-File Rollback',
        summary: 'Transactional Win32 sequence with clean rollback whenever another process holds an open font lock.',
        searchText: 'install sequence remove sequence AddFontResourceW RemoveFontResourceW WM_FONTCHANGE SendMessageTimeoutW SMTO_ABORTIFHUNG locked font file rollback ERROR_SHARING_VIOLATION',
        html: `
          <p><strong>Install Sequence:</strong></p>
          <ol class="web-list">
            <li>Run 6-stage validation, duplicate SHA-256 check, and pre-write <code>HKCU</code> conflict check.</li>
            <li>Write validated bytes exclusively (<code>create_new(true)</code>) to <code>%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts\\&lt;safe_name&gt;</code>.</li>
            <li>Write <code>REG_SZ</code> value(s) in <code>HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts</code> (rolling back file + registry on any error).</li>
            <li>Call <code>AddFontResourceW</code> and verify return value <code>&gt; 0</code> (if <code>0</code>, roll back registry and delete newly written file).</li>
            <li>Broadcast <code>WM_FONTCHANGE</code> via <code>SendMessageTimeoutW(..., SMTO_ABORTIFHUNG, 1000)</code> and persist the ledger record.</li>
          </ol>
          <p><strong>Removal Sequence &amp; Locked-File Handling:</strong></p>
          <ol class="web-list">
            <li>Verify per-user scope (reject <code>%WINDIR%\\Fonts</code>/<code>HKLM</code>) and prompt if not installed by FontShelf.</li>
            <li>Snapshot matching <code>HKCU</code> registry values read-only (do <strong>not</strong> delete yet).</li>
            <li>Call <code>RemoveFontResourceW</code> and broadcast <code>WM_FONTCHANGE</code> so running apps can release handles.</li>
            <li>Attempt file removal/recycle <strong>first</strong> (with one 55ms retry).</li>
            <li><strong>If locked by another app:</strong> Immediately roll back via <code>AddFontResourceW</code> + <code>WM_FONTCHANGE</code>, keep all <code>HKCU</code> registry values and the install ledger completely intact, discard unused staging, and inform the user which app-locked font to retry after closing apps using it.</li>
            <li><strong>Only after file deletion succeeds:</strong> Delete matching <code>HKCU</code> values, broadcast <code>WM_FONTCHANGE</code>, and update virtualized preferences.</li>
          </ol>
        `
      },
      {
        id: 'safe-ledger',
        icon: 'hgi-delete-02',
        shortTitle: 'Install Ledger & Remove All',
        title: 'Persistent Install Ledger & One-Click Remove All',
        summary: 'FontShelf records every font it installs and provides a one-click removal button exclusively for those fonts.',
        searchText: 'install ledger installed_by_fontshelf remove all fontshelf installed fonts one click remove_all_fontshelf_installed_fonts',
        html: `
          <ul class="web-list">
            <li><strong>Persistent Install Ledger:</strong> Every successful install records <code>filePath</code>, <code>sha256</code>, <code>family</code>, <code>fullNames</code>, <code>registryValues</code>, <code>source</code>, and <code>installedAtMs</code> inside virtualized <code>preferences.json</code>. Read-only reconciliation prunes entries if you later uninstall a font via Windows Settings.</li>
            <li><strong>One-Click Uninstall with 2-Step Right-Panel Confirmation:</strong> In the <strong>FontShelf</strong> tab (which lists the 39 built-in fonts plus all FontShelf-installed fonts), click the uninstall-all icon next to <strong>+</strong> and complete the 2-step confirmation in the right panel (single check → <em>Are you sure?</em> + double check). Originals are sent safely to the Windows Recycle Bin and staged in virtualized <strong>Removed</strong> storage so you can restore any font anytime (automatically cleared by Windows if FontShelf is uninstalled).</li>
            <li><strong>Strict Ownership Boundary:</strong> One-click uninstall touches <strong>only</strong> fonts recorded in FontShelf's ledger inside <code>%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts</code>—never touching Windows system fonts or fonts installed outside FontShelf.</li>
          </ul>
        `
      }
    ]
  },

  uninstall: {
    id: 'uninstall',
    title: 'After Uninstall',
    breadcrumb: 'After Uninstall',
    route: 'support.html#uninstall',
    documentTitle: 'FontShelf — After Uninstall & Font Removal Guide',
    context: {
      eyebrow: 'POST-UNINSTALL',
      title: 'Clean App Removal & Font Control',
      lead: 'Uninstalling FontShelf deletes all app settings and caches automatically while keeping installed fonts intact for your documents.',
      chips: [
        { label: 'App Data Auto-Deleted', cls: 'is-green' },
        { label: 'Documents Stay Intact', cls: 'is-accent' }
      ],
      facts: [
        { k: 'Before Uninstall (Optional)', v: 'Use the FontShelf tab toolbar remove-all icon to uninstall FontShelf-added fonts in 1 click.' },
        { k: 'After Uninstall', v: 'Windows Settings → Personalization → Fonts → Uninstall' }
      ]
    },
    cards: [
      {
        id: 'uninst-remains',
        icon: 'hgi-folder-01',
        shortTitle: 'What Remains',
        title: 'What Remains After Uninstalling FontShelf',
        summary: 'Clear breakdown of what Windows deletes automatically versus what intentionally persists.',
        searchText: 'after app uninstall what remains msix package localcache settings preferences cache user installed fonts documents',
        html: `
          <ul class="web-list">
            <li><strong>Automatically Deleted by Windows:</strong> The FontShelf MSIX package and 100% of its virtualized app data (<code>preferences.json</code>, <code>fonts-cache.json</code>, visual search index, custom themes, undo staging, and WebView2 storage) are completely deleted by Windows upon app uninstall.</li>
            <li><strong>Intentionally Preserved:</strong> Fonts you explicitly installed to your Windows account remain in <code>%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts</code> and <code>HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts</code> so your Word documents, design files, and creative projects continue rendering accurately.</li>
            <li><strong>Want a 100% Clean Slate First?</strong> Before uninstalling FontShelf, open the <strong>FontShelf</strong> tab, click the uninstall-all icon next to <strong>+</strong>, and complete the 2-step confirmation in the right panel to uninstall every font added through FontShelf (originals move to the Recycle Bin and virtualized restore copies are automatically deleted by Windows when FontShelf is uninstalled).</li>
          </ul>
        `
      },
      {
        id: 'uninst-steps',
        icon: 'hgi-delete-02',
        shortTitle: 'Remove Fonts Manually',
        title: 'How to Remove Fonts After FontShelf Is Uninstalled',
        summary: 'Remove any per-user font using built-in Windows 11 Settings—no third-party tools needed.',
        searchText: 'remove fonts after fontshelf uninstalled windows settings personalization fonts uninstall manual fallback regedit localappdata',
        html: `
          <p><strong>Recommended Method — Windows 11 Settings:</strong></p>
          <ol class="web-list">
            <li>Open <strong>Windows Settings</strong> (press <code>Win + I</code>).</li>
            <li>Go to <strong>Personalization → Fonts</strong>.</li>
            <li>Type the font name in the search box, click the font family, and click <strong>Uninstall</strong>. Windows cleanly removes both the font file and its per-user registry value.</li>
          </ol>
          <p><strong>Manual Cleanup Fallback (Advanced Users):</strong></p>
          <div class="path-row">
            <div class="path-row-text">
              <span class="path-row-label">1. Delete font file(s) from</span>
              <span class="path-row-val">%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts</span>
            </div>
            <button class="btn btn-sm" type="button" data-copy="%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts">Copy</button>
          </div>
          <div class="path-row">
            <div class="path-row-text">
              <span class="path-row-label">2. Delete matching REG_SZ entry in Registry Editor</span>
              <span class="path-row-val">HKEY_CURRENT_USER\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts</span>
            </div>
            <button class="btn btn-sm" type="button" data-copy="HKEY_CURRENT_USER\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts">Copy</button>
          </div>
          <p>Sign out and back in (or restart) if an open application still holds a cached copy of the deleted font.</p>
        `
      }
    ]
  },

  support: {
    id: 'support',
    title: 'Support & Contact',
    breadcrumb: 'Support & Contact',
    route: 'support.html',
    documentTitle: 'FontShelf — Support & Contact',
    context: {
      eyebrow: 'SUPPORT',
      title: 'Direct Publisher Support',
      lead: 'Questions, feedback, bug reports, or Windows 11 font documentation—reach out directly anytime.',
      chips: [
        { label: 'Direct Email', cls: 'is-accent' },
        { label: 'Public GitHub Repo', cls: 'is-green' }
      ],
      facts: [
        { k: 'Publisher', v: 'Mahmoud Tellawy' },
        { k: 'Email', v: EMAIL },
        { k: 'Repository', v: 'github.com/Tellawy/FontShelf' }
      ],
      primaryAction: { label: `Email ${EMAIL}`, href: `mailto:${EMAIL}`, external: false }
    },
    cards: [
      {
        id: 'sup-contact',
        icon: 'hgi-globe-02',
        shortTitle: 'Contact Channels',
        title: 'Support Channels & Links',
        summary: 'Direct email support, public repository, issue tracker, and official Store listing.',
        searchText: 'support contact mahmoud tellawy mtellawy@gmail.com github repository issues microsoft store 9MT69GPXZ0S9 facebook youtube',
        html: `
          <div class="card-grid-2">
            <div>
              <p><strong>Direct Email Support</strong><br><a href="mailto:${EMAIL}">${EMAIL}</a><br>Questions, troubleshooting, or privacy inquiries.</p>
            </div>
            <div>
              <p><strong>Public GitHub Repository</strong><br><a href="${REPO_URL}" target="_blank" rel="noopener">github.com/Tellawy/FontShelf</a><br>Public documentation and <a href="${ISSUES_URL}" target="_blank" rel="noopener">Issue Tracker</a>.</p>
            </div>
            <div>
              <p><strong>Microsoft Store Listing</strong><br><a href="${STORE_URL}" target="_blank" rel="noopener">FontShelf (9MT69GPXZ0S9)</a><br><a href="${PUBLISHER_STORE_URL}" target="_blank" rel="noopener">More Apps by Mahmoud Tellawy</a></p>
            </div>
            <div>
              <p><strong>Publisher Social Links</strong><br><a href="https://facebook.com/MahmoudTellawy" target="_blank" rel="noopener">Facebook</a> · <a href="https://youtube.com/@MahmoudTellawy" target="_blank" rel="noopener">YouTube</a></p>
            </div>
          </div>
        `
      },
      {
        id: 'sup-docs',
        icon: 'hgi-layer',
        shortTitle: 'Documentation',
        title: 'Help & Technical Documentation',
        summary: 'Browse guides covering privacy, Windows 11 font access, validation safety, and uninstalling.',
        searchText: 'help documentation faq privacy windows font access safety validation after uninstall guides',
        html: `
          <div class="topic-list">
            <button class="topic-row" type="button" data-nav-page="faq">
              <span class="topic-row-left">
                <i class="hgi-stroke hgi-tick-02" aria-hidden="true"></i>
                <span class="topic-row-copy">
                  <strong>Frequently Asked Questions</strong>
                  <span>Pricing, offline visual search, Google Fonts, Arabic/RTL &amp; Windows 11</span>
                </span>
              </span>
              <span class="topic-row-arrow" aria-hidden="true">→</span>
            </button>
            <button class="topic-row" type="button" data-nav-page="font-access">
              <span class="topic-row-left">
                <i class="hgi-stroke hgi-folder-01" aria-hidden="true"></i>
                <span class="topic-row-copy">
                  <strong>Windows Font Access</strong>
                  <span>Per-user HKCU virtualization scope, manifest configuration &amp; user-action-only guarantee</span>
                </span>
              </span>
              <span class="topic-row-arrow" aria-hidden="true">→</span>
            </button>
            <button class="topic-row" type="button" data-nav-page="safety">
              <span class="topic-row-left">
                <i class="hgi-stroke hgi-tag-01" aria-hidden="true"></i>
                <span class="topic-row-copy">
                  <strong>Safety &amp; Validation</strong>
                  <span>Supported formats, 6-stage validation, conflict protection, locked-file rollback &amp; 1-click remove-all</span>
                </span>
              </span>
              <span class="topic-row-arrow" aria-hidden="true">→</span>
            </button>
            <button class="topic-row" type="button" data-nav-page="uninstall">
              <span class="topic-row-left">
                <i class="hgi-stroke hgi-delete-02" aria-hidden="true"></i>
                <span class="topic-row-copy">
                  <strong>After Uninstall</strong>
                  <span>What Windows removes automatically and how to uninstall fonts afterward</span>
                </span>
              </span>
              <span class="topic-row-arrow" aria-hidden="true">→</span>
            </button>
            <button class="topic-row" type="button" data-nav-page="privacy">
              <span class="topic-row-left">
                <i class="hgi-stroke hgi-checkmark-circle-02" aria-hidden="true"></i>
                <span class="topic-row-copy">
                  <strong>Privacy Policy</strong>
                  <span>Zero accounts, zero tracking, 100% local data guarantee</span>
                </span>
              </span>
              <span class="topic-row-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        `
      }
    ]
  }
};

const PAGE_ORDER = ['home', 'features', 'download', 'faq', 'privacy', 'font-access', 'safety', 'uninstall', 'support'];

const state = {
  page: 'home',
  selectedCardId: null,
  selectedFaqId: FAQ_ITEMS[0].id,
  openFaqIds: new Set([FAQ_ITEMS[0].id, FAQ_ITEMS[1].id]),
  search: '',
  theme: 'dark',
  customPalette: [],
  bodySize: 14,
  zoom: 1,
  slideIdx: 0,
  sidebarWidth: 244,
  inspectorWidth: 320
};

const els = {};
let themeSwitchController = null;
let slideTimer = null;
let toastTimer = null;
let hoverHintActive = false;

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $$(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function showTopbarMessage(text, tone = 'info', duration = 2400) {
  if (!els.topbarNotif) return;
  clearTimeout(toastTimer);
  hoverHintActive = false;
  els.topbarNotif.dataset.tone = tone;
  els.topbarNotif.textContent = text;
  els.topbarNotif.classList.remove('is-hover-hint');
  els.topbarNotif.classList.add('visible');
  toastTimer = setTimeout(() => {
    if (!hoverHintActive && els.topbarNotif) {
      els.topbarNotif.classList.remove('visible');
    }
  }, duration);
}

function showHoverHint(text) {
  if (!els.topbarNotif || !text) return;
  clearTimeout(toastTimer);
  hoverHintActive = true;
  els.topbarNotif.dataset.tone = 'info';
  els.topbarNotif.textContent = text;
  els.topbarNotif.classList.add('visible', 'is-hover-hint');
}

function hideHoverHint() {
  if (!hoverHintActive || !els.topbarNotif) return;
  hoverHintActive = false;
  els.topbarNotif.classList.remove('visible', 'is-hover-hint');
}

async function copyText(text, successMsg = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text);
    showTopbarMessage(successMsg);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showTopbarMessage(successMsg);
    } catch {
      showTopbarMessage('Could not copy automatically', 'error');
    }
    ta.remove();
  }
}

/* ============================================================================
 * THEME, IMAGE-TO-PALETTE (ORIGINAL APP METHOD ONLY), SIZE SLIDER & ZOOM
 * ============================================================================ */

function savePreferencesLocal() {
  try {
    localStorage.setItem('fontshelf-web-prefs-v1', JSON.stringify({
      theme: state.theme,
      customPalette: state.customPalette,
      bodySize: state.bodySize,
      zoom: state.zoom,
      sidebarWidth: state.sidebarWidth,
      inspectorWidth: state.inspectorWidth
    }));
  } catch { }
}

function loadPreferencesLocal() {
  try {
    const raw = localStorage.getItem('fontshelf-web-prefs-v1');
    if (!raw) return;
    const p = JSON.parse(raw);
    if (p.theme === 'light' || p.theme === 'dark') state.theme = p.theme;
    if (Array.isArray(p.customPalette)) state.customPalette = normalizePaletteHexes(p.customPalette);
    if (Number.isFinite(p.bodySize)) state.bodySize = Math.max(12, Math.min(22, Number(p.bodySize)));
    if (Number.isFinite(p.zoom)) state.zoom = Math.max(0.8, Math.min(1.35, Number(p.zoom)));
    if (Number.isFinite(p.sidebarWidth)) state.sidebarWidth = Math.max(210, Math.min(340, Number(p.sidebarWidth)));
    if (Number.isFinite(p.inspectorWidth)) state.inspectorWidth = Math.max(260, Math.min(440, Number(p.inspectorWidth)));
  } catch { }
}

function syncThemeControlsUI() {
  const customOn = state.customPalette.length > 0;
  themeSwitchController?.setMode?.(state.theme, { silent: true });
  if (els.themePaletteBtn) {
    els.themePaletteBtn.classList.toggle('is-custom-active', customOn);
    const label = customOn ? 'Reset custom theme' : 'Create palette from image';
    els.themePaletteBtn.setAttribute('aria-label', label);
    els.themePaletteBtn.dataset.hint = label;
  }
  if (els.themePaletteIcon) {
    els.themePaletteIcon.classList.toggle('hgi-add-01', !customOn);
    els.themePaletteIcon.classList.toggle('hgi-cancel-01', customOn);
  }
}

function applyThemeState(mode = state.theme, palette = state.customPalette, { persist = true } = {}) {
  state.theme = mode === 'light' ? 'light' : 'dark';
  state.customPalette = normalizePaletteHexes(palette);
  applyThemeVariablesToRoot(state.theme, state.customPalette);
  syncThemeControlsUI();
  if (persist) savePreferencesLocal();
}

async function applyPaletteFromImage(source, label = 'Custom image theme applied') {
  try {
    const palette = await extractImagePalette(source, { maxColors: 7 });
    if (!palette?.length) {
      showTopbarMessage('Could not extract colors from that image', 'error');
      return;
    }
    applyThemeState(state.theme, palette, { persist: true });
    showTopbarMessage(`${label} (${palette.length} colors)`);
  } catch {
    showTopbarMessage('Failed to read image colors', 'error');
  }
}

function initThemeSwitch() {
  const track = els.themeSwitch;
  if (!track || themeSwitchController) return;
  const thumb = $('.bg-switch-thumb', track);
  const leftSeg = $('.bg-switch-track-seg.is-left', track);
  const rightSeg = $('.bg-switch-track-seg.is-right', track);
  if (!thumb) return;

  const THUMB_TRANSITION = 'transform 0.22s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.2s ease';
  const STATIC_TRANSITION = 'background-color 0.2s ease';
  let mode = state.theme;
  let isDragging = false;
  let didDrag = false;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let offset = 0;
  let restTimer = null;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const getMaxOffset = () => Math.max(0, track.clientWidth - thumb.offsetWidth);

  function setOffset(val, animate = false) {
    if (restTimer) { clearTimeout(restTimer); restTimer = null; }
    const trackW = track.clientWidth || 140;
    const thumbW = thumb.offsetWidth || trackW * 0.7;
    const maxOffset = Math.max(0, trackW - thumbW);
    const capR = (track.clientHeight || 5) / 2;
    offset = clamp(val, 0, maxOffset);
    const tr = animate ? THUMB_TRANSITION : STATIC_TRANSITION;
    thumb.style.transition = tr;
    thumb.style.transform = `translateX(${offset}px)`;

    const atLeft = offset <= 0.5;
    const atRight = offset >= maxOffset - 0.5;
    if (leftSeg) {
      leftSeg.style.transition = tr;
      leftSeg.style.opacity = (animate || !atLeft) ? '1' : '0';
      leftSeg.style.transform = `translateX(${atLeft ? 0 : Math.min(trackW, offset + capR)}px)`;
    }
    if (rightSeg) {
      rightSeg.style.transition = tr;
      rightSeg.style.opacity = (animate || !atRight) ? '1' : '0';
      rightSeg.style.transform = `translateX(${atRight ? trackW : Math.max(0, offset + thumbW - capR)}px)`;
    }
    if (animate) {
      restTimer = setTimeout(() => {
        restTimer = null;
        if (!isDragging) {
          if (leftSeg) leftSeg.style.opacity = offset <= 0.5 ? '0' : '1';
          if (rightSeg) rightSeg.style.opacity = offset >= getMaxOffset() - 0.5 ? '0' : '1';
        }
      }, 240);
    }
  }

  function setMode(nextVal, { silent = false } = {}) {
    const next = nextVal === 'light' ? 'light' : 'dark';
    const changed = next !== mode;
    mode = next;
    track.setAttribute('aria-checked', String(mode === 'light'));
    setOffset(mode === 'light' ? getMaxOffset() : 0, !silent);
    if (!silent && changed) {
      applyThemeState(mode, state.customPalette, { persist: true });
      showTopbarMessage(mode === 'light' ? 'Light theme' : 'Dark theme');
    }
  }

  const onMove = e => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 3) didDrag = true;
    setOffset(dragStartOffset + dx, false);
  };
  const endDrag = (e, cancelled = false) => {
    if (!isDragging) return;
    isDragging = false;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    try { track.releasePointerCapture(e.pointerId); } catch { }
    if (cancelled) { setMode(mode, { silent: true }); return; }
    if (!didDrag) {
      setMode(mode === 'dark' ? 'light' : 'dark');
    } else {
      setMode(offset >= getMaxOffset() / 2 ? 'light' : 'dark');
    }
  };
  const onUp = e => endDrag(e, false);
  const onCancel = e => endDrag(e, true);

  track.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    e.preventDefault();
    isDragging = true;
    didDrag = false;
    dragStartX = e.clientX;
    dragStartOffset = offset;
    try { track.setPointerCapture(e.pointerId); } catch { }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  });

  track.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMode(mode === 'dark' ? 'light' : 'dark');
    }
  });

  window.addEventListener('resize', () => setOffset(mode === 'light' ? getMaxOffset() : 0, false));
  themeSwitchController = { setMode };
  requestAnimationFrame(() => setOffset(mode === 'light' ? getMaxOffset() : 0, false));
}

function applyBodySize(px, persist = true) {
  const clamped = Math.max(12, Math.min(22, Number(px) || 14));
  state.bodySize = clamped;
  document.documentElement.style.setProperty('--web-body-size', `${clamped}px`);
  if (els.sizeSlider && Number(els.sizeSlider.value) !== clamped) {
    els.sizeSlider.value = String(clamped);
  }
  if (persist) savePreferencesLocal();
}

function applyZoom(val, persist = true) {
  const clamped = Math.round(Math.max(0.8, Math.min(1.35, Number(val) || 1)) * 100) / 100;
  state.zoom = clamped;
  document.documentElement.style.setProperty('--css-zoom', String(clamped));
  if (persist) savePreferencesLocal();
}

function applyPanelWidths() {
  document.documentElement.style.setProperty('--sidebar-width', `${state.sidebarWidth}px`);
  document.documentElement.style.setProperty('--inspector-width', `${state.inspectorWidth}px`);
}

/* ============================================================================
 * RENDERING: CENTER WORKSPACE + ORGANIZED RIGHT CONTEXT PANEL + LIVE SEARCH
 * ============================================================================ */

function renderHeroHtml() {
  const slidesImgs = SLIDES.map((s, i) => `
    <img class="showcase-img${i === state.slideIdx ? ' active' : ''}" src="${s.src}" alt="${escapeHtml(s.caption)}"${i > 0 ? ' loading="lazy"' : ''}>
  `).join('');
  const dots = SLIDES.map((_, i) => `
    <button type="button" class="showcase-dot${i === state.slideIdx ? ' active' : ''}" data-slide-dot="${i}" aria-label="Slide ${i + 1}"></button>
  `).join('');

  return `
    <article class="web-card hero-card" data-card-id="home-hero" id="card-home-hero">
      <div class="hero-header-bar">
        <div class="hero-brand-wrap">
          <img class="hero-logo" src="assets/FontShelfLogo.png" alt="FontShelf Logo">
          <div>
            <h1 class="hero-title">FontShelf</h1>
            <p class="hero-tagline">Find It. Preview It. Own It.</p>
          </div>
        </div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${STORE_URL}" target="_blank" rel="noopener">Get on Microsoft Store</a>
          <button class="btn" type="button" data-nav-page="download">Download Info</button>
        </div>
      </div>

      <div class="showcase-frame" id="showcase-frame">
        ${slidesImgs}
        <button class="showcase-nav prev" type="button" id="showcase-prev" aria-label="Previous screenshot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button class="showcase-nav next" type="button" id="showcase-next" aria-label="Next screenshot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <div class="showcase-bar">
        <span class="showcase-caption" id="showcase-caption">${escapeHtml(SLIDES[state.slideIdx].caption)}</span>
        <div class="showcase-dots" id="showcase-dots">${dots}</div>
      </div>
    </article>
  `;
}

function goToSlide(nextIdx) {
  state.slideIdx = (nextIdx + SLIDES.length) % SLIDES.length;
  $$('.showcase-img', els.pageContent).forEach((img, i) => img.classList.toggle('active', i === state.slideIdx));
  $$('.showcase-dot', els.pageContent).forEach((dot, i) => dot.classList.toggle('active', i === state.slideIdx));
  const cap = $('#showcase-caption', els.pageContent);
  if (cap) cap.textContent = SLIDES[state.slideIdx].caption;
}

function startSlideShow() {
  stopSlideShow();
  if (state.page !== 'home' || state.search) return;
  slideTimer = setInterval(() => {
    if (document.hidden || state.page !== 'home' || state.search) return;
    goToSlide(state.slideIdx + 1);
  }, 4500);
}

function stopSlideShow() {
  if (slideTimer) {
    clearInterval(slideTimer);
    slideTimer = null;
  }
}

function renderFaqHtml() {
  const allOpen = state.openFaqIds.size === FAQ_ITEMS.length;
  const rows = FAQ_ITEMS.map((item, idx) => {
    const isOpen = state.openFaqIds.has(item.id);
    return `
      <div class="faq-item${isOpen ? ' is-open' : ''}" data-faq-id="${escapeHtml(item.id)}" id="card-${escapeHtml(item.id)}">
        <button class="faq-trigger" type="button" data-faq-toggle="${escapeHtml(item.id)}" aria-expanded="${isOpen ? 'true' : 'false'}">
          <span>${idx + 1}. ${escapeHtml(item.q)}</span>
          <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="faq-answer"><p>${item.a}</p></div>
      </div>
    `;
  }).join('');

  return `
    <article class="web-card" style="cursor:default">
      <div class="web-card-head">
        <h2 class="web-card-title">
          <i class="hgi-stroke hgi-tick-02" aria-hidden="true"></i>
          <span>Frequently Asked Questions</span>
        </h2>
        <button class="btn btn-sm" type="button" data-faq-toggle-all="true">${allOpen ? 'Collapse all' : 'Expand all'}</button>
      </div>
      <p class="web-card-subtitle">Answers on one-time purchase, offline visual search, Google Fonts, Arabic &amp; RTL rendering, Windows 11 font safety, locked files, and uninstallation.</p>
    </article>
    <div class="faq-list">${rows}</div>
  `;
}

function renderCardHtml(card, selectedId) {
  if (card.isHero) return renderHeroHtml();
  if (card.isFaq) return renderFaqHtml();
  const isSel = selectedId === card.id;
  return `
    <article class="web-card${isSel ? ' is-selected' : ''}" data-card-id="${escapeHtml(card.id)}" id="card-${escapeHtml(card.id)}">
      <div class="web-card-head">
        <h2 class="web-card-title">
          ${card.icon ? `<i class="hgi-stroke ${escapeHtml(card.icon)}" aria-hidden="true"></i>` : ''}
          <span>${escapeHtml(card.title)}</span>
        </h2>
      </div>
      ${card.summary ? `<p class="web-card-subtitle">${escapeHtml(card.summary)}</p>` : ''}
      ${card.html || ''}
    </article>
  `;
}

function renderContextPanel() {
  if (!els.contextInner) return;
  const pageObj = PAGES[state.page] || PAGES.home;
  let eyebrow = pageObj.context.eyebrow || 'CONTEXT';
  let title = pageObj.context.title || pageObj.title;
  let lead = pageObj.context.lead || '';

  if (state.page === 'faq' && state.selectedFaqId && !state.search) {
    const fq = FAQ_ITEMS.find(x => x.id === state.selectedFaqId);
    if (fq) {
      eyebrow = 'SELECTED QUESTION';
      title = fq.ctxTitle;
      lead = fq.ctxLead;
    }
  } else if (state.selectedCardId && !state.search) {
    const card = pageObj.cards.find(c => c.id === state.selectedCardId);
    if (card && !card.isHero) {
      eyebrow = pageObj.title.toUpperCase();
      title = card.shortTitle || card.title;
      lead = card.summary || lead;
    }
  }

  const chipsHtml = (pageObj.context.chips || []).length
    ? `<div class="chip-row">${pageObj.context.chips.map(c => `<span class="chip ${escapeHtml(c.cls || '')}">${escapeHtml(c.label)}</span>`).join('')}</div>`
    : '';

  // Clean "On This Page" section outline for effortless navigation
  let outlineHtml = '';
  if (state.page === 'faq') {
    outlineHtml = `
      <div class="ctx-block">
        <span class="ctx-block-label">Questions</span>
        <div class="ctx-outline">
          ${FAQ_ITEMS.map((fq, idx) => `
            <button class="ctx-outline-btn${state.selectedFaqId === fq.id ? ' active' : ''}" type="button" data-outline-faq="${escapeHtml(fq.id)}">${idx + 1}. ${escapeHtml(fq.ctxTitle)}</button>
          `).join('')}
        </div>
      </div>
    `;
  } else if (pageObj.cards.length > 1) {
    outlineHtml = `
      <div class="ctx-block">
        <span class="ctx-block-label">On This Page</span>
        <div class="ctx-outline">
          ${pageObj.cards.map(c => `
            <button class="ctx-outline-btn${state.selectedCardId === c.id ? ' active' : ''}" type="button" data-outline-card="${escapeHtml(c.id)}">${escapeHtml(c.shortTitle || c.title)}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  const factsHtml = (pageObj.context.facts || []).length
    ? `<div class="ctx-block">
         <span class="ctx-block-label">At a Glance</span>
         <ul class="ctx-facts">${pageObj.context.facts.map(f => `<li><strong>${escapeHtml(f.k)}</strong><span>${escapeHtml(f.v)}</span></li>`).join('')}</ul>
       </div>`
    : '';

  const act = pageObj.context.primaryAction;
  const actionHtml = act
    ? `<div class="ctx-actions"><a class="btn btn-primary" href="${escapeHtml(act.href)}"${act.external ? ' target="_blank" rel="noopener"' : ''}>${escapeHtml(act.label)}</a></div>`
    : '';

  els.contextInner.innerHTML = `
    <div>
      <span class="ctx-block-label">${escapeHtml(eyebrow)}</span>
      <h2 class="ctx-title">${escapeHtml(title)}</h2>
    </div>
    <p class="ctx-lead">${escapeHtml(lead)}</p>
    ${chipsHtml}
    ${outlineHtml}
    ${factsHtml}
    ${actionHtml}
  `;
}

function renderSearchResults(query) {
  stopSlideShow();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = [];

  for (const pid of PAGE_ORDER) {
    const pageObj = PAGES[pid];
    if (pid === 'faq') {
      for (const fq of FAQ_ITEMS) {
        const hay = `faq ${fq.q} ${fq.a} ${fq.ctxTitle} ${fq.ctxLead}`.toLowerCase();
        if (terms.every(t => hay.includes(t))) {
          hits.push({
            page: pageObj,
            card: { id: fq.id, title: fq.q, summary: fq.ctxLead }
          });
        }
      }
      continue;
    }
    for (const card of pageObj.cards) {
      const hay = `${pageObj.title} ${card.title} ${card.summary || ''} ${card.searchText || ''} ${card.html || ''}`.toLowerCase();
      if (terms.every(t => hay.includes(t))) {
        hits.push({ page: pageObj, card });
      }
    }
  }

  if (els.breadcrumbCurrent) {
    els.breadcrumbCurrent.textContent = `Search: "${query}"`;
  }

  if (!hits.length) {
    els.pageContent.innerHTML = `
      <div class="search-summary-bar">
        <span>0 matches for <strong>"${escapeHtml(query)}"</strong></span>
        <button class="btn btn-sm" type="button" data-clear-search="true">Clear search</button>
      </div>
      <article class="web-card">
        <h2 class="web-card-title">No matching sections found</h2>
        <p>Try searching for terms like <code>HKCU</code>, <code>privacy</code>, <code>uninstall</code>, <code>validation</code>, <code>download</code>, <code>subscription</code>, or <code>Arabic</code>.</p>
      </article>
    `;
  } else {
    els.pageContent.innerHTML = `
      <div class="search-summary-bar">
        <span><strong>${hits.length}</strong> matching section${hits.length === 1 ? '' : 's'}</span>
        <button class="btn btn-sm" type="button" data-clear-search="true">Clear search</button>
      </div>
      ${hits.map(({ page, card }) => `
        <article class="web-card" data-jump-page="${escapeHtml(page.id)}" data-jump-card="${escapeHtml(card.id)}">
          <div class="web-card-head">
            <h2 class="web-card-title">${escapeHtml(card.title)}</h2>
            <span class="search-hit-page">${escapeHtml(page.title)}</span>
          </div>
          <p class="web-card-subtitle">${escapeHtml(card.summary || '')}</p>
        </article>
      `).join('')}
    `;
  }

  if (els.contextInner) {
    els.contextInner.innerHTML = `
      <div>
        <span class="ctx-block-label">SEARCH</span>
        <h2 class="ctx-title">${hits.length} Result${hits.length === 1 ? '' : 's'}</h2>
      </div>
      <p class="ctx-lead">Click any matching card to jump directly to that section.</p>
    `;
  }
  syncScrollJumpButton();
}

function renderActivePage({ scrollTop = true, focusCardId = null } = {}) {
  const pageObj = PAGES[state.page] || PAGES.home;
  state.selectedCardId = focusCardId || null;

  $$('[data-nav-page]', els.sidebarPanel).forEach(el => {
    const active = el.dataset.navPage === pageObj.id;
    el.classList.toggle('active', active);
    if (active) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });

  if (els.breadcrumbCurrent) {
    els.breadcrumbCurrent.textContent = pageObj.breadcrumb;
  }
  document.title = pageObj.documentTitle;

  if (state.search.trim()) {
    renderSearchResults(state.search.trim());
    return;
  }

  els.pageContent.innerHTML = pageObj.cards.map(c => renderCardHtml(c, state.selectedCardId)).join('');
  renderContextPanel();

  if (state.page === 'home') {
    bindShowcaseControls();
    startSlideShow();
  } else {
    stopSlideShow();
  }

  if (focusCardId) {
    requestAnimationFrame(() => {
      const target = document.getElementById(`card-${focusCardId}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  } else if (scrollTop && els.contentScroll) {
    els.contentScroll.scrollTop = 0;
  }
  syncScrollJumpButton();
}

function bindShowcaseControls() {
  const frame = $('#showcase-frame', els.pageContent);
  const prev = $('#showcase-prev', els.pageContent);
  const next = $('#showcase-next', els.pageContent);

  prev?.addEventListener('click', e => {
    e.stopPropagation();
    goToSlide(state.slideIdx - 1);
    startSlideShow();
  });
  next?.addEventListener('click', e => {
    e.stopPropagation();
    goToSlide(state.slideIdx + 1);
    startSlideShow();
  });
  $$('[data-slide-dot]', els.pageContent).forEach(dot => {
    dot.addEventListener('click', e => {
      e.stopPropagation();
      goToSlide(Number(dot.dataset.slideDot) || 0);
      startSlideShow();
    });
  });
  frame?.addEventListener('mouseenter', stopSlideShow);
  frame?.addEventListener('mouseleave', startSlideShow);
}

function navigateToPage(pageId, { pushHistory = true, focusCardId = null } = {}) {
  const targetId = PAGES[pageId] ? pageId : 'home';
  state.page = targetId;
  if (state.search) {
    state.search = '';
    if (els.searchInput) els.searchInput.value = '';
    if (els.searchClearBtn) els.searchClearBtn.hidden = true;
  }
  closeDrawers();
  renderActivePage({ scrollTop: !focusCardId, focusCardId });

  if (pushHistory && window.location.protocol !== 'file:') {
    const route = PAGES[targetId].route;
    try {
      history.pushState({ page: targetId }, '', route);
    } catch { }
  }
}

function resolveInitialPage() {
  const hash = window.location.hash.replace(/^#/, '').trim().toLowerCase();
  if (hash && PAGES[hash]) return hash;
  const params = new URLSearchParams(window.location.search);
  const qp = (params.get('page') || '').trim().toLowerCase();
  if (qp && PAGES[qp]) return qp;
  const declared = (document.body.dataset.initialPage || '').trim().toLowerCase();
  if (declared && PAGES[declared]) return declared;
  return 'home';
}

/* ============================================================================
 * DRAWERS, RESIZERS & SCROLL JUMP
 * ============================================================================ */

function closeDrawers() {
  els.sidebarPanel?.classList.remove('is-open');
  els.inspectorPanel?.classList.remove('is-open');
  if (els.drawerBackdrop) els.drawerBackdrop.hidden = true;
}

function syncScrollJumpButton() {
  const scroller = els.contentScroll;
  const btn = els.scrollJumpBtn;
  if (!scroller || !btn) return;
  const maxScroll = scroller.scrollHeight - scroller.clientHeight;
  if (maxScroll < 140) {
    btn.hidden = true;
    return;
  }
  btn.hidden = false;
  const nearBottom = scroller.scrollTop > maxScroll * 0.55;
  btn.dataset.scrollDir = nearBottom ? 'top' : 'bottom';
  btn.setAttribute('aria-label', nearBottom ? 'Scroll to top' : 'Scroll to bottom');
  btn.dataset.hint = nearBottom ? 'Scroll to top' : 'Scroll to bottom';
  if (els.scrollJumpIconPath) {
    els.scrollJumpIconPath.setAttribute('d', nearBottom ? 'M12 19V5M6 11l6-6 6 6' : 'M12 5v14M18 13l-6 6-6-6');
  }
}

function initPanelResizers() {
  const bindResizer = (resizerEl, side) => {
    if (!resizerEl) return;
    resizerEl.addEventListener('pointerdown', e => {
      e.preventDefault();
      resizerEl.classList.add('dragging');
      document.body.classList.add('is-resizing-panels');
      const startX = e.clientX;
      const startW = side === 'left' ? state.sidebarWidth : state.inspectorWidth;
      const onMove = mv => {
        const dx = (mv.clientX - startX) / (state.zoom || 1);
        if (side === 'left') {
          state.sidebarWidth = Math.max(210, Math.min(340, Math.round(startW + dx)));
        } else {
          state.inspectorWidth = Math.max(260, Math.min(440, Math.round(startW - dx)));
        }
        applyPanelWidths();
      };
      const onUp = () => {
        resizerEl.classList.remove('dragging');
        document.body.classList.remove('is-resizing-panels');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        savePreferencesLocal();
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });
  };
  bindResizer(els.resizerLeft, 'left');
  bindResizer(els.resizerRight, 'right');
}

/* ============================================================================
 * EVENT BINDING & BOOT
 * ============================================================================ */

function bindEvents() {
  els.sidebarPanel?.addEventListener('click', e => {
    const link = e.target.closest('[data-nav-page]');
    if (!link) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    navigateToPage(link.dataset.navPage);
  });

  els.brandName?.addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    navigateToPage('home');
  });

  els.pageContent?.addEventListener('click', e => {
    const faqAllBtn = e.target.closest('[data-faq-toggle-all]');
    if (faqAllBtn) {
      if (state.openFaqIds.size === FAQ_ITEMS.length) {
        state.openFaqIds.clear();
      } else {
        for (const item of FAQ_ITEMS) state.openFaqIds.add(item.id);
      }
      renderActivePage({ scrollTop: false });
      return;
    }

    const faqToggle = e.target.closest('[data-faq-toggle]');
    if (faqToggle) {
      const fid = faqToggle.dataset.faqToggle;
      if (state.openFaqIds.has(fid)) state.openFaqIds.delete(fid);
      else state.openFaqIds.add(fid);
      state.selectedFaqId = fid;
      const itemEl = faqToggle.closest('.faq-item');
      const nowOpen = state.openFaqIds.has(fid);
      itemEl?.classList.toggle('is-open', nowOpen);
      faqToggle.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
      renderContextPanel();
      syncScrollJumpButton();
      return;
    }

    const clearBtn = e.target.closest('[data-clear-search]');
    if (clearBtn) {
      state.search = '';
      if (els.searchInput) els.searchInput.value = '';
      if (els.searchClearBtn) els.searchClearBtn.hidden = true;
      renderActivePage({ scrollTop: false });
      return;
    }

    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      e.stopPropagation();
      copyText(copyBtn.dataset.copy || '', 'Copied to clipboard');
      return;
    }

    const navBtn = e.target.closest('[data-nav-page]');
    if (navBtn) {
      e.preventDefault();
      e.stopPropagation();
      navigateToPage(navBtn.dataset.navPage);
      return;
    }

    const jumpCard = e.target.closest('[data-jump-page]');
    if (jumpCard) {
      const targetPage = jumpCard.dataset.jumpPage;
      const targetCard = jumpCard.dataset.jumpCard;
      if (targetPage === 'faq' && targetCard) {
        state.openFaqIds.add(targetCard);
        state.selectedFaqId = targetCard;
      }
      navigateToPage(targetPage, { focusCardId: targetCard });
      return;
    }

    const cardEl = e.target.closest('[data-card-id]');
    if (cardEl && !e.target.closest('a, button, pre')) {
      const cid = cardEl.dataset.cardId;
      state.selectedCardId = cid;
      $$('.web-card[data-card-id]', els.pageContent).forEach(el => {
        el.classList.toggle('is-selected', el.dataset.cardId === cid && !el.classList.contains('hero-card'));
      });
      renderContextPanel();
    }
  });

  // Right Context Panel: section outline jump & FAQ outline jump
  els.contextInner?.addEventListener('click', e => {
    const outCard = e.target.closest('[data-outline-card]');
    if (outCard) {
      const cid = outCard.dataset.outlineCard;
      state.selectedCardId = cid;
      $$('.web-card[data-card-id]', els.pageContent).forEach(el => {
        el.classList.toggle('is-selected', el.dataset.cardId === cid && !el.classList.contains('hero-card'));
      });
      renderContextPanel();
      closeDrawers();
      const target = document.getElementById(`card-${cid}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const outFaq = e.target.closest('[data-outline-faq]');
    if (outFaq) {
      const fid = outFaq.dataset.outlineFaq;
      state.openFaqIds.add(fid);
      state.selectedFaqId = fid;
      renderActivePage({ scrollTop: false, focusCardId: fid });
      closeDrawers();
      return;
    }

    const navBtn = e.target.closest('[data-nav-page]');
    if (navBtn) {
      e.preventDefault();
      navigateToPage(navBtn.dataset.navPage);
    }
  });

  // Live Site Search Box
  els.searchInput?.addEventListener('input', () => {
    state.search = els.searchInput.value || '';
    if (els.searchClearBtn) els.searchClearBtn.hidden = !state.search.trim();
    if (state.search.trim()) {
      renderSearchResults(state.search.trim());
    } else {
      renderActivePage({ scrollTop: false });
    }
  });

  els.searchClearBtn?.addEventListener('click', () => {
    state.search = '';
    if (els.searchInput) {
      els.searchInput.value = '';
      els.searchInput.focus();
    }
    els.searchClearBtn.hidden = true;
    renderActivePage({ scrollTop: false });
  });

  // Scroll Jump Button
  els.contentScroll?.addEventListener('scroll', syncScrollJumpButton, { passive: true });
  els.scrollJumpBtn?.addEventListener('click', () => {
    if (!els.contentScroll) return;
    const goTop = els.scrollJumpBtn.dataset.scrollDir === 'top';
    els.contentScroll.scrollTo({ top: goTop ? 0 : els.contentScroll.scrollHeight, behavior: 'smooth' });
  });

  // Original FontShelf Image-to-Theme controls (bottom-left + picker & drag-drop)
  els.themePaletteBtn?.addEventListener('click', () => {
    if (state.customPalette.length > 0) {
      applyThemeState(state.theme, [], { persist: true });
      showTopbarMessage('Default theme restored');
    } else {
      els.themeImageInput?.click();
    }
  });

  els.themeImageInput?.addEventListener('change', () => {
    const file = els.themeImageInput.files?.[0];
    els.themeImageInput.value = '';
    if (file) applyPaletteFromImage(file, 'Theme extracted from image');
  });

  if (els.themePanel) {
    els.themePanel.addEventListener('dragover', e => {
      e.preventDefault();
      els.themePanel.classList.add('drag-over');
    });
    els.themePanel.addEventListener('dragleave', () => {
      els.themePanel.classList.remove('drag-over');
    });
    els.themePanel.addEventListener('drop', e => {
      e.preventDefault();
      els.themePanel.classList.remove('drag-over');
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        applyPaletteFromImage(file, 'Theme extracted from dropped image');
      }
    });
  }

  // Size Slider & Zoom Controls
  els.sizeSlider?.addEventListener('input', () => {
    applyBodySize(Number(els.sizeSlider.value), true);
  });
  els.zoomOutBtn?.addEventListener('click', () => {
    applyZoom(state.zoom - 0.05, true);
    showTopbarMessage(`Zoom ${Math.round(state.zoom * 100)}%`);
  });
  els.zoomInBtn?.addEventListener('click', () => {
    applyZoom(state.zoom + 0.05, true);
    showTopbarMessage(`Zoom ${Math.round(state.zoom * 100)}%`);
  });

  // Mobile Drawers
  els.mobileSidebarToggle?.addEventListener('click', () => {
    const open = !els.sidebarPanel.classList.contains('is-open');
    closeDrawers();
    if (open) {
      els.sidebarPanel.classList.add('is-open');
      if (els.drawerBackdrop) els.drawerBackdrop.hidden = false;
    }
  });
  els.mobileInspectorToggle?.addEventListener('click', () => {
    const open = !els.inspectorPanel.classList.contains('is-open');
    closeDrawers();
    if (open) {
      els.inspectorPanel.classList.add('is-open');
      if (els.drawerBackdrop) els.drawerBackdrop.hidden = false;
    }
  });
  els.sidebarCloseBtn?.addEventListener('click', closeDrawers);
  els.inspectorCloseBtn?.addEventListener('click', closeDrawers);
  els.drawerBackdrop?.addEventListener('click', closeDrawers);

  // Hover hints in topbar
  document.addEventListener('mouseover', e => {
    const hintEl = e.target.closest?.('[data-hint]');
    if (hintEl?.dataset.hint) showHoverHint(hintEl.dataset.hint);
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest?.('[data-hint]')) hideHoverHint();
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', e => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      els.searchInput?.focus();
      els.searchInput?.select();
      return;
    }
    if (e.key === 'Escape') {
      if (state.search) {
        state.search = '';
        if (els.searchInput) els.searchInput.value = '';
        if (els.searchClearBtn) els.searchClearBtn.hidden = true;
        renderActivePage({ scrollTop: false });
      } else {
        closeDrawers();
      }
      return;
    }
    if (document.activeElement?.tagName !== 'INPUT' && state.page === 'home' && !state.search) {
      if (e.key === 'ArrowRight') { goToSlide(state.slideIdx + 1); startSlideShow(); }
      else if (e.key === 'ArrowLeft') { goToSlide(state.slideIdx - 1); startSlideShow(); }
    }
  });

  window.addEventListener('popstate', () => {
    state.page = resolveInitialPage();
    renderActivePage({ scrollTop: true });
  });
}

function boot() {
  els.brandName = $('#brand-name-link');
  els.breadcrumbCurrent = $('#breadcrumb-current');
  els.topbarNotif = $('#topbar-notification');
  els.sidebarPanel = $('#sidebar-panel');
  els.inspectorPanel = $('#inspector-panel');
  els.drawerBackdrop = $('#drawer-backdrop');
  els.mobileSidebarToggle = $('#mobile-sidebar-toggle');
  els.mobileInspectorToggle = $('#mobile-inspector-toggle');
  els.sidebarCloseBtn = $('#sidebar-close');
  els.inspectorCloseBtn = $('#inspector-close');
  els.resizerLeft = $('#resizer-left');
  els.resizerRight = $('#resizer-right');
  els.themePanel = $('#theme-panel');
  els.themeSwitch = $('#theme-switch');
  els.themePaletteBtn = $('#theme-palette-button');
  els.themePaletteIcon = $('#theme-palette-icon');
  els.themeImageInput = $('#theme-image-input');
  els.searchInput = $('#site-search');
  els.searchClearBtn = $('#search-clear-button');
  els.scrollJumpBtn = $('#scroll-jump-button');
  els.scrollJumpIconPath = $('#scroll-jump-icon-path');
  els.contentScroll = $('#content-scroll');
  els.pageContent = $('#page-content');
  els.contextInner = $('#context-inner');
  els.sizeSlider = $('#size-slider');
  els.zoomOutBtn = $('#zoom-out-button');
  els.zoomInBtn = $('#zoom-in-button');

  loadPreferencesLocal();
  applyPanelWidths();
  applyBodySize(state.bodySize, false);
  applyZoom(state.zoom, false);
  initThemeSwitch();
  applyThemeState(state.theme, state.customPalette, { persist: false });
  initPanelResizers();
  bindEvents();

  state.page = resolveInitialPage();
  renderActivePage({ scrollTop: false });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
