// A reusable filter component for tables
const FilterComponent = {
    render(container, filters, onFilterChange) {
        container.innerHTML = `
            <div class="flex flex-wrap gap-4 mb-4">
                ${filters.map(filter => `
                    <div>
                        <label for="${filter.name}" class="block text-sm font-medium mb-1">${filter.label}</label>
                        <select id="${filter.name}" class="border rounded-md p-2">
                            <option value="">全部</option>
                            ${filter.options.map(option => `<option value="${option.value}">${option.label}</option>`).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>
        `;

        filters.forEach(filter => {
            const element = container.querySelector(`#${filter.name}`);
            element.addEventListener('change', () => {
                const filterValues = {};
                filters.forEach(f => {
                    filterValues[f.name] = container.querySelector(`#${f.name}`).value;
                });
                onFilterChange(filterValues);
            });
        });
    }
};

// A reusable search component
const SearchComponent = {
    render(container, placeholder, onSearch) {
        container.innerHTML = `
            <div class="relative">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                    type="text" 
                    placeholder="${placeholder || '搜索...'}" 
                    class="pl-10 pr-4 py-2 rounded-lg border focus:ring-primary-color focus:border-primary-color dark:bg-gray-700 dark:border-gray-600 w-full"
                >
            </div>
        `;
        lucide.createIcons();
        const input = container.querySelector('input');
        input.addEventListener('input', (e) => onSearch(e.target.value));
    }
};