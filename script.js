/*jshint esversion: 8 */
document.addEventListener('DOMContentLoaded', function() {
  // DOM элементы
  var treeContainer = document.getElementById('tree');
  var searchInput = document.querySelector('.search');
  var expandBtn = document.getElementById('expand-btn');
  var collapseBtn = document.getElementById('collapse-btn');
  var helpBtn = document.getElementById('help-btn');
  var modal = document.getElementById('help-modal');
  var closeBtn = document.querySelector('.close');

  // Состояние приложения
  var treeData = [];
  var allNodes = [];

  // Улучшенная загрузка данных
  function loadData() {
    return fetch('data.txt')
      .then(function(response) {
        if (!response.ok) throw new Error('Не удалось загрузить data.txt');
        return response.text();
      })
      .then(function(text) {
        return text.split('\n')
          .map(function(line) { return line.trim(); })
          .filter(function(line) { return line; })
          .map(function(line) {
            var parts = line.split('\t');
            if (parts.length < 3) {
              console.warn('Пропущена строка с ошибкой:', line);
              return null;
            }
            return {
              code: parts[0].trim(),
              name: parts[1].trim(),
              level: parseInt(parts[2].trim()) || 0
            };
          })
          .filter(function(item) { return item !== null; });
      })
      .catch(function(error) {
        console.error('Ошибка загрузки:', error);
        alert('Ошибка: ' + error.message);
        return [];
      });
  }

  // Оптимизированное построение дерева
  function buildTree(parentElement, items, parentCode) {
    var ul = document.createElement('ul');
    var currentLevel = parentCode ? parentCode.split('.').length + 1 : 1;
    
    items.filter(function(item) {
      return parentCode ? 
        item.code.startsWith(parentCode + '.') && 
        item.code.split('.').length === currentLevel :
        item.level === 1;
    }).forEach(function(item) {
      var li = document.createElement('li');
      li.innerHTML = '<span>' + item.code + '_' + item.name + '</span>';
      li.dataset.code = item.code;
      li.dataset.level = item.level;
      
      var hasChildren = items.some(function(i) {
        return i.code.startsWith(item.code + '.');
      });
      
      if (hasChildren) {
        li.classList.add('folder', 'collapsed');
        li.addEventListener('click', function(e) {
          if (e.target.tagName !== 'INPUT') {
            this.classList.toggle('collapsed');
          }
        });
        buildTree(li, items, item.code);
      } else {
        li.classList.add('file');
      }
      
      ul.appendChild(li);
      allNodes.push(li);
    });
    
    parentElement.appendChild(ul);
  }

  // Надежный поиск по названию
  function searchByName(term) {
    var searchTerm = term.toLowerCase().trim();
    
    allNodes.forEach(function(node) {
      var nodeText = node.textContent.toLowerCase();
      var isMatch = searchTerm ? nodeText.includes(searchTerm) : true;
      
      node.style.display = isMatch ? '' : 'none';
      
      // Автораскрытие родительских веток
      if (isMatch) {
        var parent = node.closest('li.folder');
        while (parent) {
          parent.classList.remove('collapsed');
          parent.style.display = '';
          parent = parent.parentElement.closest('li.folder');
        }
      }
    });
  }

  // Инициализация с улучшенной обработкой ошибок
  loadData().then(function(data) {
    if (!data || data.length === 0) {
      throw new Error('Данные не загружены или файл пуст');
    }
    
    treeData = data;
    buildTree(treeContainer, treeData);
    
    // Основные обработчики
    searchInput.addEventListener('input', function(e) {
      searchByName(e.target.value);
    });

    expandBtn.addEventListener('click', function() {
      document.querySelectorAll('.folder').forEach(function(f) {
        f.classList.remove('collapsed');
      });
    });

    collapseBtn.addEventListener('click', function() {
      document.querySelectorAll('.folder').forEach(function(f) {
        f.classList.add('collapsed');
      });
    });

    helpBtn.addEventListener('click', function() {
      modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', function() {
      modal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
      if (e.target === modal) modal.style.display = 'none';
    });
    
  }).catch(function(error) {
    console.error('Инициализация не удалась:', error);
    treeContainer.innerHTML = '<div class="error">Ошибка: ' + error.message + '</div>';
  });
});
