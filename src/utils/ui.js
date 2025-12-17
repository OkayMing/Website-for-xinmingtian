// Toast Notification Utility
const Toast = {
    show(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
        } text-white`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            toast.classList.remove('translate-x-0');
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
};

// Confirm Dialog Utility
const ConfirmDialog = {
    show(message, onConfirm) {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        dialog.innerHTML = `
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                <p class="mb-4 text-gray-800 dark:text-gray-200">${message}</p>
                <div class="flex justify-end space-x-4">
                    <button id="confirm-cancel" class="px-4 py-2 rounded-lg border dark:border-gray-600">取消</button>
                    <button id="confirm-ok" class="px-4 py-2 rounded-lg bg-red-500 text-white">确认</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        dialog.querySelector('#confirm-cancel').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.querySelector('#confirm-ok').addEventListener('click', () => {
            onConfirm();
            document.body.removeChild(dialog);
        });
    }
};

// Pagination Utility
class Pagination {
    constructor(container, totalItems, itemsPerPage, onPageChange) {
        this.container = container;
        this.totalItems = totalItems;
        this.itemsPerPage = itemsPerPage;
        this.onPageChange = onPageChange;
        this.totalPages = Math.ceil(totalItems / itemsPerPage);
        this.currentPage = 1;
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        const controls = document.createElement('div');
        controls.className = 'flex justify-between items-center mt-4';
        
        const info = document.createElement('span');
        info.className = 'text-sm text-gray-600 dark:text-gray-400';
        info.textContent = `显示 ${this.currentPage} 到 ${Math.min(this.currentPage * this.itemsPerPage, this.totalItems)} 条，共 ${this.totalItems} 条`;
        controls.appendChild(info);

        const buttons = document.createElement('div');
        buttons.className = 'flex space-x-2';

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i data-lucide="chevron-left"></i>';
        prevButton.className = `p-2 rounded-lg border ${this.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`;
        prevButton.disabled = this.currentPage === 1;
        prevButton.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        buttons.appendChild(prevButton);

        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = `px-4 py-2 rounded-lg ${this.currentPage === i ? 'bg-primary-color text-white' : 'border'}`;
            button.addEventListener('click', () => this.goToPage(i));
            buttons.appendChild(button);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '<i data-lucide="chevron-right"></i>';
        nextButton.className = `p-2 rounded-lg border ${this.currentPage === this.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`;
        nextButton.disabled = this.currentPage === this.totalPages;
        nextButton.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        buttons.appendChild(nextButton);

        controls.appendChild(buttons);
        this.container.appendChild(controls);
        lucide.createIcons();
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.render();
            this.onPageChange(page);
        }
    }
}