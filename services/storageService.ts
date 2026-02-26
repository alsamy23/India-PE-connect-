
export interface SavedItem {
  id: string;
  type: 'Lesson Plan' | 'Theory' | 'Skill' | 'Rule' | 'Physics' | 'Tool';
  title: string;
  content: any;
  timestamp: number;
  metadata?: any;
}

const STORAGE_KEY = 'smartpe_saved_items';

export const storageService = {
  saveItem: (item: Omit<SavedItem, 'id' | 'timestamp'>): SavedItem => {
    const items = storageService.getAllItems();
    const newItem: SavedItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50))); // Keep last 50
    return newItem;
  },

  getAllItems: (): SavedItem[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored items", e);
      return [];
    }
  },

  deleteItem: (id: string) => {
    const items = storageService.getAllItems();
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
