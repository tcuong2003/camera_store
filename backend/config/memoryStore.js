const slugify = require('slugify');

// Cleared mock products - only real database data
const initialProducts = [];

const initialCategories = [];

let memoryProducts = [...initialProducts];
let memoryCategories = [...initialCategories];

module.exports = {
  getMemoryProducts: () => memoryProducts,
  setMemoryProducts: (prods) => { memoryProducts = prods; },
  addMemoryProduct: (p) => {
    if (p.order && Number(p.order) > 0) {
      const targetPos = Math.max(1, Math.min(Number(p.order), memoryProducts.length + 1));
      memoryProducts.splice(targetPos - 1, 0, p);
    } else {
      memoryProducts.unshift(p);
    }
    memoryProducts.forEach((item, idx) => {
      item.order = idx + 1;
    });
    return p;
  },
  updateMemoryProduct: (id, updates) => {
    const idx = memoryProducts.findIndex((p) => p._id === id);
    if (idx !== -1) {
      const updated = { ...memoryProducts[idx], ...updates, updatedAt: new Date().toISOString() };
      memoryProducts[idx] = updated;

      if (updates.order !== undefined && Number(updates.order) > 0) {
        const targetPos = Math.max(1, Math.min(Number(updates.order), memoryProducts.length));
        if (targetPos - 1 !== idx) {
          const [moved] = memoryProducts.splice(idx, 1);
          memoryProducts.splice(targetPos - 1, 0, moved);
        }
        memoryProducts.forEach((p, i) => {
          p.order = i + 1;
        });
      }

      return updated;
    }
    return null;
  },
  reorderMemoryProduct: (id, newOrder) => {
    const currentIndex = memoryProducts.findIndex((p) => p._id === id);
    if (currentIndex === -1) return null;

    const targetPos = Math.max(1, Math.min(parseInt(newOrder, 10) || 1, memoryProducts.length));
    const targetIndex = targetPos - 1;

    if (currentIndex === targetIndex) {
      memoryProducts[currentIndex].order = targetPos;
      return memoryProducts[currentIndex];
    }

    const [moved] = memoryProducts.splice(currentIndex, 1);
    memoryProducts.splice(targetIndex, 0, moved);

    memoryProducts.forEach((p, idx) => {
      p.order = idx + 1;
    });

    return moved;
  },
  reorderMemoryProductsList: (orderedIds) => {
    const idMap = new Map(memoryProducts.map((p) => [p._id, p]));
    const newList = [];
    for (const id of orderedIds) {
      if (idMap.has(id)) {
        newList.push(idMap.get(id));
        idMap.delete(id);
      }
    }
    for (const remaining of idMap.values()) {
      newList.push(remaining);
    }
    memoryProducts = newList;
    memoryProducts.forEach((p, idx) => {
      p.order = idx + 1;
    });
    return memoryProducts;
  },
  deleteMemoryProduct: (id) => {
    memoryProducts = memoryProducts.filter((p) => p._id !== id);
    memoryProducts.forEach((p, idx) => {
      p.order = idx + 1;
    });
  },
  getMemoryCategories: () => memoryCategories,
  addMemoryCategory: (c) => {
    memoryCategories.push(c);
    return c;
  },
  updateMemoryCategory: (idOrSlug, updates) => {
    const idx = memoryCategories.findIndex(
      (c) => c._id === idOrSlug || c.slug === idOrSlug || c.name.toLowerCase() === String(idOrSlug).toLowerCase()
    );
    if (idx !== -1) {
      const oldName = memoryCategories[idx].name;
      const oldSlug = memoryCategories[idx].slug;
      memoryCategories[idx] = { ...memoryCategories[idx], ...updates };

      if (updates.name && updates.name !== oldName) {
        if (memoryCategories[idx].type === 'brand') {
          memoryProducts.forEach((p) => {
            if (p.brand && (p.brand.toLowerCase() === oldName.toLowerCase() || p.brand.toLowerCase() === (oldSlug || '').toLowerCase())) {
              p.brand = updates.name;
            }
          });
        } else if (memoryCategories[idx].type === 'category') {
          const newCatVal = updates.slug || updates.name.toLowerCase().replace(/\s+/g, '-');
          memoryProducts.forEach((p) => {
            if (p.category && (p.category.toLowerCase() === oldName.toLowerCase() || p.category.toLowerCase() === (oldSlug || '').toLowerCase())) {
              p.category = newCatVal;
            }
          });
        }
      }

      return memoryCategories[idx];
    }
    return null;
  },
  deleteMemoryCategory: (idOrSlug) => {
    const target = memoryCategories.find(
      (c) => c.slug === idOrSlug || c.name.toLowerCase() === String(idOrSlug).toLowerCase() || c._id === idOrSlug
    );
    if (target) {
      if (target.type === 'brand') {
        memoryProducts.forEach((p) => {
          if (p.brand && (p.brand.toLowerCase() === target.name.toLowerCase() || p.brand.toLowerCase() === (target.slug || '').toLowerCase())) {
            p.brand = '';
          }
        });
      } else if (target.type === 'category') {
        memoryProducts.forEach((p) => {
          if (p.category && (p.category.toLowerCase() === target.name.toLowerCase() || p.category.toLowerCase() === (target.slug || '').toLowerCase())) {
            p.category = '';
          }
        });
      }
    }
    memoryCategories = memoryCategories.filter(
      (c) => c.slug !== idOrSlug && c.name.toLowerCase() !== String(idOrSlug).toLowerCase() && c._id !== idOrSlug
    );
  },
};
