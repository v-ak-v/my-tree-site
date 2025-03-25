document.addEventListener('DOMContentLoaded', function() {
  // DOM элементы
  const treeContainer = document.getElementById('tree');
  const searchInput = document.querySelector('.search');
  const expandBtn = document.getElementById('expand-btn');
  const collapseBtn = document.getElementById('collapse-btn');
  const helpBtn = document.getElementById('help-btn');
  const modal = document.getElementById('help-modal');
  const closeBtn = document.querySelector('.close');
  const helpContent = document.querySelector('.help-content');

  // Состояние
  let treeData = [];
  let allNodes = [];
  let originalTreeState = [];

  // Загрузка данных
  async function loadData() {
    try {
      const response = await fetch('data.txt');
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      const text = await response.text();
      return text.split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => {
          const parts = line.split('\t');
          return {
            code: parts[0].trim(),
            name: parts[1].trim(),
            level: parseInt(parts[2].trim()) || 0
          };
        });
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка загрузки: ' + error.message);
      return [];
    }
  }

  // Построение дерева
  function buildTree(parentElement, items, parentCode = '') {
    const ul = document.createElement('ul');
    const currentLevel = parentCode ? parentCode.split('.').length + 1 : 1;
    
    items.filter(item => 
      parentCode 
        ? item.code.startsWith(parentCode + '.') && item.code.split('.').length === currentLevel
        : item.level === 1
    ).forEach(item => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = `${item.code} ${item.name}`;
      li.appendChild(span);
      
      li.dataset.code = item.code;
      li.dataset.level = item.level;
      li.dataset.originalText = `${item.code} ${item.name}`;
      
      const hasChildren = items.some(i => i.code.startsWith(item.code + '.'));
      
      if (hasChildren) {
        li.classList.add('folder', 'collapsed');
        buildTree(li, items, item.code);
        
        span.addEventListener('click', function(e) {
          e.stopPropagation();
          li.classList.toggle('collapsed');
        });
      } else {
        li.classList.add('file');
      }
      
      ul.appendChild(li);
      allNodes.push(li);
    });
    
    parentElement.appendChild(ul);
  }

  // Поиск с подсветкой
  function performSearch(term) {
    const searchTerm = term.toLowerCase().trim();
    
    // Сохраняем состояние перед поиском
    if (searchTerm && originalTreeState.length === 0) {
      originalTreeState = Array.from(document.querySelectorAll('.folder'))
        .map(folder => ({
          element: folder,
          wasCollapsed: folder.classList.contains('collapsed')
        }));
    }

    let hasMatches = false;
    
    allNodes.forEach(node => {
      const originalText = node.dataset.originalText;
      const nodeText = originalText.toLowerCase();
      const isMatch = searchTerm ? nodeText.includes(searchTerm) : false;
      
      if (isMatch) {
        hasMatches = true;
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        node.innerHTML = originalText.replace(regex, '<span class="highlight">$1</span>');
        
        // Раскрываем родителей
        let parent = node.closest('li.folder');
        while (parent) {
          parent.classList.remove('collapsed');
          parent = parent.parentElement.closest('li.folder');
        }
      } else {
        node.innerHTML = originalText;
      }
      
      node.style.display = isMatch ? '' : 'none';
    });

    // Если поиск очищен - восстанавливаем состояние
    if (!searchTerm) {
      restoreOriginalState();
    }
  }

  function restoreOriginalState() {
    allNodes.forEach(node => {
      node.style.display = '';
      node.innerHTML = node.dataset.originalText;
    });
    
    if (originalTreeState.length > 0) {
      originalTreeState.forEach(({element, wasCollapsed}) => {
        if (wasCollapsed) {
          element.classList.add('collapsed');
        } else {
          element.classList.remove('collapsed');
        }
      });
      originalTreeState = [];
    }
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Управление деревом
  expandBtn.addEventListener('click', () => {
    document.querySelectorAll('.folder').forEach(f => f.classList.remove('collapsed'));
  });

  collapseBtn.addEventListener('click', () => {
    document.querySelectorAll('.folder').forEach(f => f.classList.add('collapsed'));
  });

  // Модальное окно
  helpBtn.addEventListener('click', () => {
    helpContent.innerHTML = `
      <h3>Инструкция по использованию</h3>
      <p><strong>Поиск:</strong> Введите текст в поле поиска для фильтрации дерева</p>
      <p><strong>Развернуть все:</strong> Открывает все узлы дерева</p>
      <p><strong>Свернуть все:</strong> Закрывает все узлы дерева</p>
      <p><strong>Клик по папке:</strong> Открывает/закрывает папку</p>
    `;
    modal.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Поиск
  searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value);
  });

  // Инициализация
  (async function init() {
    treeData = await loadData();
    if (treeData.length > 0) {
      buildTree(treeContainer, treeData);
    } else {
      treeContainer.innerHTML = '<div class="error">Нет данных для отображения</div>';
    }
  })();
});
