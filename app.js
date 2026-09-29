// 2026 디지털혁신 백서 검색 및 열람 스크립트

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const cardContainer = document.getElementById('cardContainer');
  const resultCount = document.getElementById('resultCount');
  const noResult = document.getElementById('noResult');

  // 데이터 로드 확인
  const data = (typeof 장데이터 !== 'undefined') ? 장데이터 : [];
  const totalCount = data.length;

  // 정규식 특수문자 이스케이프 함수
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // HTML 특수문자 이스케이프 함수
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // 간단한 마크다운 파서 및 하이라이트 적용 함수
  function formatContent(text, keyword) {
    // 1. 단락 분리
    const paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs.map(p => {
      let trimmed = p.trim();
      if (!trimmed) return '';

      // 4.1 소제목 형식 (### )
      if (trimmed.startsWith('###')) {
        let titleText = trimmed.replace(/^###\s*/, '');
        return `<h4>${renderWithHighlight(titleText, keyword)}</h4>`;
      }

      // 일반 본문 줄바꿈 처리
      const lines = trimmed.split('\n');
      const formattedLines = lines.map(line => renderWithHighlight(line, keyword)).join('<br>');
      return `<p>${formattedLines}</p>`;
    }).join('');
  }

  // 굵은 글씨(**) 파싱 및 키워드 하이라이트 병합 함수
  function renderWithHighlight(rawLine, keyword) {
    // 1단계: **굵은 글씨** 구문 파싱
    const parts = [];
    let regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(rawLine)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: rawLine.substring(lastIndex, match.index), isBold: false });
      }
      parts.push({ text: match[1], isBold: true });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < rawLine.length) {
      parts.push({ text: rawLine.substring(lastIndex), isBold: false });
    }

    // 2단계: 각 파트별 HTML 이스케이프 및 검색어 하이라이트 적용
    return parts.map(part => {
      let escaped = escapeHtml(part.text);
      if (keyword) {
        const kwRegex = new RegExp(`(${escapeRegExp(escapeHtml(keyword))})`, 'gi');
        escaped = escaped.replace(kwRegex, '<mark class="highlight">$1</mark>');
      }
      return part.isBold ? `<strong>${escaped}</strong>` : escaped;
    }).join('');
  }

  // 카드 렌더링 함수
  function renderCards(filteredData, keyword = '') {
    cardContainer.innerHTML = '';
    
    // 표시 결과 수 업데이트
    resultCount.innerHTML = `검색 결과: <strong>${filteredData.length}</strong>건 (전체 ${totalCount}개 장)`;

    if (filteredData.length === 0) {
      noResult.style.display = 'block';
      return;
    }

    noResult.style.display = 'none';

    filteredData.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card';

      // 제목 하이라이트
      let titleHtml = escapeHtml(item.제목);
      if (keyword) {
        const kwRegex = new RegExp(`(${escapeRegExp(escapeHtml(keyword))})`, 'gi');
        titleHtml = titleHtml.replace(kwRegex, '<mark class="highlight">$1</mark>');
      }

      // 본문 포맷팅
      const bodyHtml = formatContent(item.본문, keyword);

      card.innerHTML = `
        <div class="card-header">
          <span class="chapter-badge">제 ${item.장} 장</span>
          <h2 class="chapter-title">${titleHtml}</h2>
        </div>
        <div class="card-body">
          ${bodyHtml}
        </div>
      `;

      cardContainer.appendChild(card);
    });
  }

  // 검색 필터링 핸들러
  function handleSearch() {
    const keyword = searchInput.value.trim();

    // 지우기 버튼 표시 제어
    clearBtn.style.display = keyword ? 'flex' : 'none';

    if (!keyword) {
      renderCards(data, '');
      return;
    }

    const lowerKeyword = keyword.toLowerCase();
    const filtered = data.filter(item => {
      const titleMatch = item.제목 && item.제목.toLowerCase().includes(lowerKeyword);
      const bodyMatch = item.본문 && item.본문.toLowerCase().includes(lowerKeyword);
      return titleMatch || bodyMatch;
    });

    renderCards(filtered, keyword);
  }

  // 검색창 이벤트 바인딩
  searchInput.addEventListener('input', handleSearch);

  // 검색어 초기화 버튼
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    handleSearch();
  });

  // 초기 전체 렌더링
  renderCards(data, '');
});
