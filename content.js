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

// スマホ用のカルーセル表示に変換する関数
function convertToMobileCarousel(table) {
  // モバイルかどうかをチェック
  if (window.innerWidth > 768) {
    return;
  }

  // すでに変換済みの場合はスキップ
  if (table.parentElement.classList.contains('timetable-carousel-container')) {
    return;
  }

  const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
  if (!headerRow) return;

  const headers = Array.from(headerRow.querySelectorAll('th, td'));
  let bodyRows = Array.from(table.querySelectorAll('tbody tr'));

  // tbody がない場合は tr から取得
  if (bodyRows.length === 0) {
    const allRows = Array.from(table.querySelectorAll('tr'));
    bodyRows = allRows.slice(1); // 最初の行（ヘッダー）を除外
  }

  if (headers.length < 2 || bodyRows.length === 0) return;

  // 5限以降の行を除外（1限〜4限のみ）
  bodyRows = bodyRows.slice(0, 4);

  // カルーセルコンテナを作成
  const container = document.createElement('div');
  container.className = 'timetable-carousel-container';

  const carousel = document.createElement('div');
  carousel.className = 'timetable-carousel';

  // 各曜日ごとにカードを作成（土曜日を除外）
  const maxDayIndex = Math.min(headers.length - 1, 6); // 月〜金（インデックス1〜5）
  for (let dayIndex = 1; dayIndex < maxDayIndex; dayIndex++) {
    const dayCard = document.createElement('div');
    dayCard.className = 'timetable-day-card';

    // 曜日ヘッダー
    const dayHeader = document.createElement('div');
    dayHeader.className = 'timetable-day-header';
    dayHeader.textContent = headers[dayIndex].textContent;
    dayCard.appendChild(dayHeader);

    // その曜日の授業リスト
    const classList = document.createElement('div');
    classList.className = 'timetable-class-list';

    bodyRows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td, th');
      if (cells[dayIndex]) {
        const classItem = document.createElement('div');
        classItem.className = 'timetable-class-item';

        const period = document.createElement('div');
        period.className = 'timetable-period';
        period.textContent = `${rowIndex + 1}限`;

        const content = document.createElement('div');
        content.className = 'timetable-content';
        content.textContent = cells[dayIndex].textContent.trim() || '－';

        classItem.appendChild(period);
        classItem.appendChild(content);
        classList.appendChild(classItem);
      }
    });

    dayCard.appendChild(classList);
    carousel.appendChild(dayCard);
  }

  // ナビゲーションドットを作成
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'timetable-dots';

  const actualDayCount = maxDayIndex - 1; // 実際の曜日数
  for (let i = 0; i < actualDayCount; i++) {
    const dot = document.createElement('div');
    dot.className = 'timetable-dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);
  }

  container.appendChild(carousel);
  container.appendChild(dotsContainer);

  // スワイプ機能を追加
  let currentIndex = 0;
  let startX = 0;
  let isDragging = false;

  const updateCarousel = () => {
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    dotsContainer.querySelectorAll('.timetable-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  };

  carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  carousel.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < actualDayCount - 1) {
        currentIndex++;
      } else if (diff < 0 && currentIndex > 0) {
        currentIndex--;
      }
      updateCarousel();
      isDragging = false;
    }
  });

  carousel.addEventListener('touchend', () => {
    isDragging = false;
  });

  // ドットクリックでページ移動
  dotsContainer.querySelectorAll('.timetable-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      currentIndex = parseInt(dot.dataset.index);
      updateCarousel();
    });
  });

  // テーブルを置き換え
  table.parentElement.replaceChild(container, table);
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
    // スマホの場合はカルーセル表示に変換（削除前に変換）
    if (window.innerWidth <= 768) {
      convertToMobileCarousel(table);
    } else {
      table.classList.add('webclass-improved-table');
      // PCの場合のみ時間割表の4列目以降を削除
      removeExtraColumns(table);
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
const observer = new MutationObserver(improveUI);
observer.observe(document.body, {
  childList: true,
  subtree: true
});
