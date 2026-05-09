// ==================== المتغيرات العامة ====================
let tasks = [];
let currentEditIndex = null;
let currentPage = 'welcome';

// أيام الأسبوع
const weekDays = [
    { key: 'saturday', label: 'السبت' },
    { key: 'sunday', label: 'الأحد' },
    { key: 'monday', label: 'الإثنين' },
    { key: 'tuesday', label: 'الثلاثاء' },
    { key: 'wednesday', label: 'الأربعاء' },
    { key: 'thursday', label: 'الخميس' },
    { key: 'friday', label: 'الجمعة' }
];

// ==================== عند تحميل الصفحة ====================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    applyTheme();
    registerSW();
    showPage('welcome');
});

// ==================== تسجيل Service Worker ====================
function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((reg) => console.log('تم تسجيل Service Worker بنجاح'))
            .catch((err) => console.log('فشل تسجيل Service Worker:', err));
    }
}

// ==================== التنقل بين الصفحات ====================
function showPage(page) {
    currentPage = page;
    
    document.getElementById('welcomePage').classList.add('hidden');
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('settingsPage').classList.add('hidden');
    document.getElementById('mainHeader').classList.add('hidden');
    
    if (page === 'welcome') {
        document.getElementById('welcomePage').classList.remove('hidden');
    } else {
        document.getElementById('mainHeader').classList.remove('hidden');
        if (page === 'home') {
            document.getElementById('homePage').classList.remove('hidden');
            renderHomePage();
        } else if (page === 'settings') {
            document.getElementById('settingsPage').classList.remove('hidden');
            renderSettingsPage();
        }
    }
}

function goToHome() {
    showPage('home');
}

function goToSettings() {
    showPage('settings');
}

// ==================== إدارة البيانات ====================
function loadData() {
    const saved = localStorage.getItem('mhmty_tasks');
    if (saved) {
        try {
            tasks = JSON.parse(saved);
        } catch (e) {
            tasks = [];
        }
    }
    
    const savedTheme = localStorage.getItem('mhmty_theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    }
}

function saveData() {
    localStorage.setItem('mhmty_tasks', JSON.stringify(tasks));
}

function getTodayTasks() {
    const todayIndex = new Date().getDay();
    const todayKey = getDayKeyFromIndex(todayIndex);
    
    return tasks.filter(task => {
        const taskDays = task.days || [];
        return taskDays.includes(todayKey);
    });
}

function getDayKeyFromIndex(index) {
    const mapping = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return mapping[index];
}

// ==================== الصفحة الرئيسية ====================
function renderHomePage() {
    updateDateAndDay();
    renderTasks();
}

function updateDateAndDay() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    document.getElementById('dateDisplay').textContent = 
        `تاريخ اليوم : ${day} / ${monthNames[month - 1]} ( ${month} ) / ${year} م`;
    
    document.getElementById('dayDisplay').textContent = 
        `اليوم : ${dayNames[now.getDay()]}`;
}

function renderTasks() {
    const todayTasks = getTodayTasks();
    const tasksList = document.getElementById('tasksList');
    const emptyState = document.getElementById('emptyState');
    
    tasksList.innerHTML = '';
    
    if (todayTasks.length === 0) {
        tasksList.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        tasksList.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        todayTasks.forEach((task, index) => {
            const taskElement = createTaskElement(task, index);
            tasksList.appendChild(taskElement);
        });
    }
}

function createTaskElement(task, index) {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-shadow';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'w-5 h-5 rounded-sm border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 cursor-pointer accent-slate-800 dark:accent-slate-200';
    checkbox.checked = task.completed || false;
    checkbox.onchange = function() {
        task.completed = checkbox.checked;
        saveData();
        renderHomePage();
    };
    
    const label = document.createElement('span');
    label.textContent = task.name;
    label.className = `flex-1 text-base font-medium ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`;
    
    div.appendChild(checkbox);
    div.appendChild(label);
    
    return div;
}

// ==================== صفحة الإعدادات ====================
function renderSettingsPage() {
    const list = document.getElementById('settingsTasksList');
    const empty = document.getElementById('settingsEmpty');
    
    list.innerHTML = '';
    
    if (tasks.length === 0) {
        list.classList.add('hidden');
        empty.classList.remove('hidden');
    } else {
        list.classList.remove('hidden');
        empty.classList.add('hidden');
        
        tasks.forEach((task, index) => {
            const taskElement = createSettingsTaskElement(task, index);
            list.appendChild(taskElement);
        });
    }
}

function createSettingsTaskElement(task, index) {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700';
    
    // معلومات المهمة
    const info = document.createElement('div');
    info.className = 'flex-1';
    info.innerHTML = `
        <p class="font-medium text-slate-800 dark:text-slate-200">${task.name}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${getDaysLabels(task.days)}</p>
    `;
    
    // أزرار التحكم
    const controls = document.createElement('div');
    controls.className = 'flex items-center gap-1';
    
    // زر تحريك للأعلى
    if (index > 0) {
        const upBtn = document.createElement('button');
        upBtn.innerHTML = '⬆️';
        upBtn.className = 'p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-sm transition-colors';
        upBtn.title = 'تحريك للأعلى';
        upBtn.onclick = () => moveTask(index, index - 1);
        controls.appendChild(upBtn);
    }
    
    // زر تحريك للأسفل
    if (index < tasks.length - 1) {
        const downBtn = document.createElement('button');
        downBtn.innerHTML = '⬇️';
        downBtn.className = 'p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-sm transition-colors';
        downBtn.title = 'تحريك للأسفل';
        downBtn.onclick = () => moveTask(index, index + 1);
        controls.appendChild(downBtn);
    }
    
    // زر تعديل
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '✏️';
    editBtn.className = 'p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-sm transition-colors';
    editBtn.title = 'تعديل';
    editBtn.onclick = () => openEditModal(index);
    controls.appendChild(editBtn);
    
    // زر حذف
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.className = 'p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md text-sm transition-colors';
    deleteBtn.title = 'حذف';
    deleteBtn.onclick = () => deleteTask(index);
    controls.appendChild(deleteBtn);
    
    div.appendChild(info);
    div.appendChild(controls);
    
    return div;
}

function getDaysLabels(days) {
    if (!days || days.length === 0) return 'بدون أيام';
    if (days.length === 7) return 'كل الأيام';
    
    return days.map(d => {
        const day = weekDays.find(wd => wd.key === d);
        return day ? day.label : d;
    }).join('، ');
}

function moveTask(fromIndex, toIndex) {
    const task = tasks.splice(fromIndex, 1)[0];
    tasks.splice(toIndex, 0, task);
    saveData();
    renderSettingsPage();
    if (currentPage === 'home') renderHomePage();
}

function deleteTask(index) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
        tasks.splice(index, 1);
        saveData();
        renderSettingsPage();
        if (currentPage === 'home') renderHomePage();
    }
}

// ==================== النافذة المنبثقة ====================
function openAddModal() {
    currentEditIndex = null;
    document.getElementById('modalTitle').textContent = 'إضافة مهمة جديدة';
    document.getElementById('saveTaskBtn').textContent = 'إضافة';
    document.getElementById('taskName').value = '';
    renderDaysSelector([]);
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function openEditModal(index) {
    currentEditIndex = index;
    const task = tasks[index];
    document.getElementById('modalTitle').textContent = 'تعديل مهمة';
    document.getElementById('saveTaskBtn').textContent = 'حفظ التعديل';
    document.getElementById('taskName').value = task.name;
    renderDaysSelector(task.days || []);
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
    currentEditIndex = null;
}

function renderDaysSelector(selectedDays) {
    const container = document.getElementById('daysContainer');
    container.innerHTML = '';
    
    weekDays.forEach(day => {
        const label = document.createElement('label');
        label.className = 'flex items-center gap-2 p-2 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors text-sm';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = day.key;
        checkbox.checked = selectedDays.includes(day.key);
        checkbox.className = 'rounded-sm accent-slate-800 dark:accent-slate-200';
        
        const span = document.createElement('span');
        span.textContent = day.label;
        span.className = 'text-slate-700 dark:text-slate-300';
        
        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
    });
}

function saveTask() {
    const name = document.getElementById('taskName').value.trim();
    
    if (!name) {
        alert('الرجاء إدخال اسم المهمة');
        return;
    }
    
    const selectedDays = [];
    document.querySelectorAll('#daysContainer input[type="checkbox"]').forEach(cb => {
        if (cb.checked) {
            selectedDays.push(cb.value);
        }
    });
    
    if (selectedDays.length === 0) {
        alert('الرجاء اختيار يوم واحد على الأقل');
        return;
    }
    
    const taskData = {
        name: name,
        days: selectedDays,
        completed: false
    };
    
    if (currentEditIndex !== null) {
        taskData.completed = tasks[currentEditIndex].completed;
        tasks[currentEditIndex] = taskData;
    } else {
        tasks.push(taskData);
    }
    
    saveData();
    closeModal();
    renderSettingsPage();
    if (currentPage === 'home') renderHomePage();
}

// ==================== الوضع الداكن والفاتح ====================
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('mhmty_theme', isDark ? 'dark' : 'light');
    updateThemeIcons();
}

function applyTheme() {
    const saved = localStorage.getItem('mhmty_theme');
    if (saved === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }
    updateThemeIcons();
}

function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    document.getElementById('themeIconLight').classList.toggle('hidden', !isDark);
    document.getElementById('themeIconDark').classList.toggle('hidden', isDark);
}

// ==================== تصدير واستيراد JSON ====================
function downloadJSON() {
    const data = {
        tasks: tasks,
        theme: localStorage.getItem('mhmty_theme') || 'dark',
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مهماتي_بيانات_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.tasks || !Array.isArray(data.tasks)) {
                throw new Error('بيانات غير صالحة');
            }
            
            if (confirm('سيتم استبدال جميع المهام الحالية بالبيانات المستوردة. هل تريد المتابعة؟')) {
                tasks = data.tasks;
                saveData();
                
                if (data.theme) {
                    localStorage.setItem('mhmty_theme', data.theme);
                    applyTheme();
                }
                
                renderSettingsPage();
                if (currentPage === 'home') renderHomePage();
                alert('تم استيراد البيانات بنجاح!');
            }
        } catch (error) {
            alert('فشل استيراد الملف. تأكد من أنه ملف JSON صالح.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ==================== حذف جميع البيانات ====================
function deleteAllData() {
    if (confirm('تحذير: سيتم حذف جميع المهام والبيانات نهائياً. هل أنت متأكد؟')) {
        if (confirm('تأكيد نهائي: لا يمكن التراجع عن هذا الإجراء. هل تريد المتابعة؟')) {
            tasks = [];
            localStorage.removeItem('mhmty_tasks');
            saveData();
            renderSettingsPage();
            if (currentPage === 'home') renderHomePage();
            alert('تم حذف جميع البيانات بنجاح.');
        }
    }
}

// ==================== إغلاق النافذة المنبثقة ====================
document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});