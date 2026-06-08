/* =========================================================
   VIRTUAL SCROLLING UTILITIES
========================================================= */
export class VirtualScroller {
  constructor(options = {}) {
    this.itemHeight = options.itemHeight || 50;
    this.containerHeight = options.containerHeight || 400;
    this.overscan = options.overscan || 5;
    this.totalItems = options.totalItems || 0;
  }

  getVisibleRange(scrollTop) {
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.overscan);
    const endIndex = Math.min(
      this.totalItems - 1,
      Math.ceil((scrollTop + this.containerHeight) / this.itemHeight) + this.overscan
    );
    
    return { startIndex, endIndex };
  }

  getTotalHeight() {
    return this.totalItems * this.itemHeight;
  }

  getOffsetY(index) {
    return index * this.itemHeight;
  }

  updateConfig(options) {
    if (options.itemHeight) this.itemHeight = options.itemHeight;
    if (options.containerHeight) this.containerHeight = options.containerHeight;
    if (options.overscan) this.overscan = options.overscan;
    if (options.totalItems) this.totalItems = options.totalItems;
  }
}
