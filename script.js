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

  // Загрузка данных
  async function loadData() {
    try {
      const response = await fetch('data.txt');
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      return text.split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => {
          const parts = line.split('\t');
          if (parts.length < 3) return null;
          return {
            code: parts[0].trim(),
            name: parts[1].trim(),
            level: parseInt(parts[2].trim()) || 0
          };
        })
        .filter(item => item !== null);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
      return [];
    }
  }

  // Построение дерева
  function buildTree(parentElement, items, parentCode = '') {
    const ul = document.createElement('ul');
    const currentLevel = parentCode ? parentCode.split('.').length + 1 : 1;
    
    items.filter(item => 
      parentCode 
        ? item.code.startsWith(parentCode + '.') && 
          item.code.split('.').length === currentLevel
        : item.level === 1
    ).forEach(item => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = `${item.code} ${item.name}`;
      li.appendChild(span);
      
      li.dataset.code = item.code;
      li.dataset.name = item.name;
      li.dataset.level = item.level;
      
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

  // Функция поиска
  function performSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      // Если поиск пустой, показываем все элементы
      allNodes.forEach(node => {
        node.style.display = '';
        node.innerHTML = `<span>${node.dataset.code} ${node.dataset.name}</span>`;
      });
      return;
    }
    
    // Сначала скрываем все узлы
    allNodes.forEach(node => {
      node.style.display = 'none';
    });
    
    // Ищем совпадения
    allNodes.forEach(node => {
      const codeMatch = node.dataset.code.toLowerCase().includes(term);
      const nameMatch = node.dataset.name.toLowerCase().includes(term);
      
      if (codeMatch || nameMatch) {
        // Показываем совпавший узел
        node.style.display = '';
        
        // Подсвечиваем текст
        const span = node.querySelector('span');
        if (span) {
          const text = `${node.dataset.code} ${node.dataset.name}`;
          const regex = new RegExp(`(${term})`, 'gi');
          span.innerHTML = text.replace(regex, '<span class="highlight">$1</span>');
        }
        
        // Раскрываем всех родителей
        let parent = node.parentElement.closest('li.folder');
        while (parent) {
          parent.style.display = '';
          parent.classList.remove('collapsed');
          parent = parent.parentElement.closest('li.folder');
        }
      }
    });
  }

  // Инициализация
  (async function init() {
    treeData = await loadData();
    if (treeData.length > 0) {
      buildTree(treeContainer, treeData);
      
      // Обработчики событий
      searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
      });
      
      expandBtn.addEventListener('click', () => {
        document.querySelectorAll('.folder').forEach(f => f.classList.remove('collapsed'));
      });
      
      collapseBtn.addEventListener('click', () => {
        document.querySelectorAll('.folder').forEach(f => f.classList.add('collapsed'));
      });
      
      helpBtn.addEventListener('click', () => {
        helpContent.innerHTML = `
          <h3>Инструкция</h3>
          <p>Введите текст в поле поиска для фильтрации дерева</p>
          <p>Используйте кнопки для управления отображением</p>
        `;
        modal.style.display = 'block';
      });
      
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
      
      window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    } else {
      treeContainer.innerHTML = '<div class="error">Нет данных для отображения</div>';
    }
  })();
});
