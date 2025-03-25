// Загрузка данных (можно заменить на fetch для JSON-файла)
const treeData = [
  { id: '1', name: 'Раздел 1', parent: null },
  { id: '1.1', name: 'Подраздел 1.1', parent: '1' },
  { id: '1.2', name: 'Подраздел 1.2', parent: '1' },
  { id: '2', name: 'Раздел 2', parent: null },
  { id: '2.1', name: 'Подраздел 2.1', parent: '2' }
];

// Инициализация дерева
function initTree() {
  const treeContainer = document.getElementById('tree');
  
  // Создаем узлы
  const nodes = {};
  treeData.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    li.dataset.id = item.id;
    nodes[item.id] = li;
    
    // Добавляем класс для папок/файлов
    const isFolder = treeData.some(i => i.parent === item.id);
    li.classList.add(isFolder ? 'folder' : 'file');
    
    if (isFolder) {
      const ul = document.createElement('ul');
      li.appendChild(ul);
      li.classList.add('collapsed');
    }
  });
  
  // Строим иерархию
  treeData.forEach(item => {
    if (item.parent) {
      const parentUl = nodes[item.parent].querySelector('ul');
      parentUl.appendChild(nodes[item.id]);
    } else {
      treeContainer.appendChild(nodes[item.id]);
    }
  });
  
  // Обработчики для папок
  document.querySelectorAll('.folder').forEach(folder => {
    folder.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.toggle('collapsed');
      }
    });
  });
}

// Поиск
document.querySelector('.search').addEventListener('input', function(e) {
  const searchText = e.target.value.toLowerCase();
  
  document.querySelectorAll('#tree li').forEach(li => {
    const text = li.textContent.toLowerCase();
    if (text.includes(searchText)) {
      li.style.display = '';
      // Раскрываем родителей
      let parent = li.parentElement.closest('li');
      while (parent) {
        parent.classList.remove('collapsed');
        parent = parent.parentElement.closest('li');
      }
    } else {
      li.style.display = 'none';
    }
  });
});

// Управление деревом
document.getElementById('expand-btn').addEventListener('click', () => {
  document.querySelectorAll('.folder').forEach(f => f.classList.remove('collapsed'));
});

document.getElementById('collapse-btn').addEventListener('click', () => {
  document.querySelectorAll('.folder').forEach(f => f.classList.add('collapsed'));
});

// Модальное окно
const modal = document.getElementById('help-modal');
const btn = document.getElementById('help-btn');
const span = document.getElementsByClassName('close')[0];

btn.onclick = () => modal.style.display = "block";
span.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
  if (e.target == modal) modal.style.display = "none";
};

// Инициализация
initTree();