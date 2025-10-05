// WebClass UI改善 Content Script
console.log('WebClass UI改善拡張機能が読み込まれました');

// ページ読み込み完了後に実行
function improveUI() {
  // ヘッダーの改善
  const header = document.querySelector('header') || document.querySelector('.header');
  if (header) {
    header.classList.add('webclass-improved-header');
  }

  // ナビゲーションの改善
  const nav = document.querySelector('nav') || document.querySelector('.navigation');
  if (nav) {
    nav.classList.add('webclass-improved-nav');
  }

  // メインコンテンツの改善
  const main = document.querySelector('main') || document.querySelector('#main-content');
  if (main) {
    main.classList.add('webclass-improved-main');
  }

  // テーブルの改善
  const tables = document.querySelectorAll('table');
  tables.forEach(table => {
    table.classList.add('webclass-improved-table');
  });

  // ボタンの改善
  const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
  buttons.forEach(button => {
    button.classList.add('webclass-improved-button');
  });

  // フォームの改善
  const inputs = document.querySelectorAll('input[type="text"], input[type="password"], textarea');
  inputs.forEach(input => {
    input.classList.add('webclass-improved-input');
  });
}

// DOM読み込み完了時に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', improveUI);
} else {
  improveUI();
}

// 動的に追加される要素にも対応
const observer = new MutationObserver(improveUI);
observer.observe(document.body, {
  childList: true,
  subtree: true
});
