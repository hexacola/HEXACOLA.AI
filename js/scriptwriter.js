document.addEventListener('DOMContentLoaded', () => {
    // Initialize Quill
    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        },
        placeholder: 'Start writing your script...'
    });

    // Auto-save functionality
    let typingTimer;
    const doneTypingInterval = 1000; // 1 second

    quill.on('text-change', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(saveContent, doneTypingInterval);
    });

    // Save content to localStorage
    function saveContent() {
        const content = quill.getContents();
        const title = document.getElementById('document-title').value;
        localStorage.setItem('scriptContent', JSON.stringify(content));
        localStorage.setItem('scriptTitle', title);
        showSaveIndicator();
    }

    // Show save indicator
    function showSaveIndicator() {
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        }, 2000);
    }

    // Load saved content
    const savedContent = localStorage.getItem('scriptContent');
    const savedTitle = localStorage.getItem('scriptTitle');
    if (savedContent) {
        quill.setContents(JSON.parse(savedContent));
    }
    if (savedTitle) {
        document.getElementById('document-title').value = savedTitle;
    }

    // Manual save button
    document.getElementById('saveBtn').addEventListener('click', saveContent);

    // Export functionality
    document.getElementById('exportBtn').addEventListener('click', () => {
        const content = quill.root.innerHTML;
        const blob = new Blob([content], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${document.getElementById('document-title').value || 'script'}.html`;
        a.click();
        window.URL.revokeObjectURL(url);
    });

    // Dark mode handling
    function updateEditorTheme() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        document.querySelector('.editor-container').classList.toggle('dark', isDarkMode);
    }

    // Listen for dark mode changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                updateEditorTheme();
            }
        });
    });

    observer.observe(document.body, { attributes: true });
    updateEditorTheme();

    // Navigation functions
    window.navigateToHome = () => window.location.href = 'index.html';
    window.showGenerator = () => window.location.href = 'generator.html';
    window.navigateToStoryboard = () => window.location.href = 'storyboard.html';
    window.navigateToScriptwriter = () => window.location.href = 'scriptwriter.html';
    window.navigateToChat = () => window.location.href = 'chat.html';
    window.toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        updateEditorTheme();
    };
});
