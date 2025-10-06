// WebClass UI改善 Content Script
console.log('WebClass UI改善拡張機能が読み込まれました');

// 時間割表の5限以降の行と土曜日の列を削除する関数
function removeExtraColumns(table) {
  // 土曜日の列を削除（最後の列を削除）
  const allRows = table.querySelectorAll('tr');
  allRows.forEach(row => {
    const cells = row.querySelectorAll('th, td');
    if (cells.length > 0) {
      // 最後のセル（土曜日）を削除
      cells[cells.length - 1].remove();
    }
  });

  // 5限以降の行を削除
  const bodyRows = table.querySelectorAll('tbody tr');

  if (bodyRows.length > 0) {
    // 5行目（インデックス4）以降を削除（1限〜4限を残す）
    for (let i = bodyRows.length - 1; i >= 4; i--) {
      bodyRows[i].remove();
    }
  } else {
    // thead/tbodyがない場合、すべての行を取得
    const rows = table.querySelectorAll('tr');

    // 最初の行がヘッダーの場合を考慮して、5行目以降を削除
    // ヘッダー行 + 1限〜4限 = 5行を残す
    for (let i = rows.length - 1; i >= 5; i--) {
      rows[i].remove();
    }
  }
}

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
    // 土曜日と5限以降を削除（PC・スマホ共通）
    removeExtraColumns(table);

    // スマホの場合は横スクロール可能なラッパーで囲む
    if (window.innerWidth <= 768) {
      if (!table.parentElement.classList.contains('table-scroll-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-scroll-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    }
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
let isProcessing = false;
let observer = null;

function setupObserver() {
  // bodyが存在し、まだobserverが設定されていない場合のみ設定
  if (document.body && !observer) {
    try {
      observer = new MutationObserver((mutations) => {
        // 処理中の場合はスキップ
        if (isProcessing) return;

        // テーブルが追加されたかチェック
        let hasNewTable = false;
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) { // Element node
                if (node.tagName === 'TABLE' || (node.querySelector && node.querySelector('table'))) {
                  hasNewTable = true;
                }
              }
            });
          }
        }

        // 新しいテーブルが追加された場合のみ処理
        if (hasNewTable) {
          isProcessing = true;
          improveUI();
          setTimeout(() => { isProcessing = false; }, 1000);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } catch (error) {
      console.error('MutationObserver setup failed:', error);
    }
  } else if (!document.body) {
    // bodyがまだない場合は少し待つ
    setTimeout(setupObserver, 100);
  }
}

// DOMContentLoadedの後にobserverを設定
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupObserver);
} else {
  setupObserver();
}
