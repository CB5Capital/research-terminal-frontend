/**
 * Bloomberg Terminal-style Dashboard Layout Optimizer
 * Dynamically calculates optimal sizes and positions for dashboard components
 * based on screen size, component types, and content complexity
 */

export class DashboardLayoutOptimizer {
  constructor(containerWidth, containerHeight) {
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;
    this.gap = 0; // NO gaps between components - 100% space utilization
    this.minPadding = 0; // NO padding around container
    
    // Cache for layout calculations to improve performance
    this.layoutCache = new Map();
    this.gridCache = new Map();
  }

  /**
   * Calculate optimal layout for dashboard components
   */
  optimizeLayout(components) {
    return this.maximizeSpaceUtilization(components, this.containerWidth, this.containerHeight);
  }

  /**
   * Categorize components by type and priority
   */
  categorizeComponents(components) {
    const categories = {
      critical: [], // Key metrics, alerts
      primary: [],  // Charts, tables, main analysis
      secondary: [], // Supporting text, lists
      supplementary: [] // Sources, additional details
    };

    components.forEach(component => {
      const priority = this.getComponentPriority(component);
      const category = this.getComponentCategory(component);
      
      categories[priority].push({
        ...component,
        category,
        complexity: this.calculateContentComplexity(component)
      });
    });

    return categories;
  }

  /**
   * Determine component priority based on type and content
   */
  getComponentPriority(component) {
    const highPriorityTypes = ['metric_card', 'financial_chart', 'alert', 'status'];
    const mediumPriorityTypes = ['data_table', 'competitor_analysis', 'risk_assessment'];
    const lowPriorityTypes = ['text_analysis', 'long_text'];
    
    if (highPriorityTypes.includes(component.type)) return 'critical';
    if (mediumPriorityTypes.includes(component.type)) return 'primary';
    if (lowPriorityTypes.includes(component.type)) return 'secondary';
    return 'supplementary';
  }

  /**
   * Get component category for sizing calculations
   */
  getComponentCategory(component) {
    const typeMapping = {
      'metric_card': 'compact',
      'progress_bar': 'compact',
      'short_text': 'compact',
      'data_table': 'medium',
      'financial_chart': 'medium',
      'competitor_analysis': 'medium',
      'risk_assessment': 'medium',
      'list_items': 'medium',
      'text_analysis': 'large',
      'long_text': 'large'
    };
    
    return typeMapping[component.type] || 'medium';
  }

  /**
   * Calculate content complexity to influence sizing
   */
  calculateContentComplexity(component) {
    let complexity = 1;
    
    // Analyze content to determine complexity
    if (component.data) {
      if (component.type === 'data_table' && component.data.rows) {
        complexity = Math.min(3, component.data.rows.length / 5); // More rows = larger table
      } else if (component.type === 'financial_chart' && component.data.data) {
        complexity = Math.min(2.5, component.data.data.length / 4); // More data points = larger chart
      } else if (component.type === 'text_analysis' && component.data.content) {
        complexity = Math.min(2, component.data.content.length / 500); // Longer text = larger component
      } else if (component.type === 'list_items' && component.data.items) {
        complexity = Math.min(2, component.data.items.length / 6); // More items = larger list
      }
    }
    
    return Math.max(0.5, complexity); // Minimum 0.5x, maximum based on content
  }

  /**
   * Calculate base sizes for components
   */
  calculateBaseSizes(categorizedComponents, availableWidth, availableHeight) {
    const totalComponents = Object.values(categorizedComponents).flat().length;
    const sizingStrategy = this.determineSizingStrategy(totalComponents, availableWidth, availableHeight);
    
    const baseSizes = {
      compact: sizingStrategy.compact,
      medium: sizingStrategy.medium,
      large: sizingStrategy.large
    };

    const componentSizes = [];

    // Process components by priority
    ['critical', 'primary', 'secondary', 'supplementary'].forEach(priority => {
      categorizedComponents[priority].forEach(component => {
        const baseSize = baseSizes[component.category];
        const size = this.calculateOptimalSize(component, baseSize, sizingStrategy);
        
        componentSizes.push({
          ...component,
          width: size.width,
          height: size.height,
          priority: priority
        });
      });
    });

    return componentSizes;
  }

  /**
   * Determine sizing strategy based on screen space and component count
   */
  determineSizingStrategy(componentCount, availableWidth, availableHeight) {
    const screenArea = availableWidth * availableHeight;
    const density = componentCount / screenArea * 1000000; // Components per million pixels
    
    let strategy;
    
    if (density > 8) {
      // High density - make components smaller but still readable
      strategy = {
        compact: { width: 220, height: 100 },
        medium: { width: 350, height: 150 },
        large: { width: 500, height: 200 },
        maxColumns: Math.floor(availableWidth / 230)
      };
    } else if (density > 4) {
      // Medium density - balanced sizing
      strategy = {
        compact: { width: 280, height: 120 },
        medium: { width: 450, height: 180 },
        large: { width: 650, height: 260 },
        maxColumns: Math.floor(availableWidth / 290)
      };
    } else {
      // Low density - larger components
      strategy = {
        compact: { width: 350, height: 150 },
        medium: { width: 550, height: 220 },
        large: { width: 800, height: 320 },
        maxColumns: Math.floor(availableWidth / 360)
      };
    }

    // Ensure we don't exceed available space
    strategy.maxColumns = Math.max(1, Math.min(strategy.maxColumns, 6));
    
    return strategy;
  }

  /**
   * Calculate optimal size for individual component
   */
  calculateOptimalSize(component, baseSize, sizingStrategy) {
    const complexityMultiplier = component.complexity;
    
    let width = Math.round(baseSize.width * complexityMultiplier);
    let height = Math.round(baseSize.height * complexityMultiplier);

    // Apply component-specific constraints
    switch (component.type) {
      case 'metric_card':
        width = Math.max(180, Math.min(width, 300));
        height = Math.max(100, Math.min(height, 150));
        break;
      case 'data_table':
        width = Math.max(350, Math.min(width, 700));
        height = Math.max(150, Math.min(height, 400));
        break;
      case 'financial_chart':
        width = Math.max(400, Math.min(width, 800));
        height = Math.max(180, Math.min(height, 400));
        break;
      case 'text_analysis':
        width = Math.max(450, Math.min(width, 900));
        height = Math.max(200, Math.min(height, 500));
        break;
      case 'progress_bar':
        width = Math.max(200, Math.min(width, 400));
        height = Math.max(80, Math.min(height, 120));
        break;
      case 'list_items':
        width = Math.max(250, Math.min(width, 500));
        height = Math.max(120, Math.min(height, 300));
        break;
      case 'short_text':
        width = Math.max(300, Math.min(width, 600));
        height = Math.max(100, Math.min(height, 200));
        break;
      case 'long_text':
        width = Math.max(500, Math.min(width, 1000));
        height = Math.max(200, Math.min(height, 500));
        break;
    }

    return { width, height };
  }

  /**
   * Simple grid layout that actually works
   */
  maximizeSpaceUtilization(components, availableWidth, availableHeight) {
    if (components.length === 0) return [];

    // Simple grid calculation
    const cols = Math.ceil(Math.sqrt(components.length));
    const rows = Math.ceil(components.length / cols);
    const cellWidth = Math.floor(availableWidth / cols);
    const cellHeight = Math.floor(availableHeight / rows);

    console.log('Simple Grid:', { components: components.length, cols, rows, cellWidth, cellHeight });

    // Create positioned components
    return components.map((component, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = col * cellWidth;
      const y = row * cellHeight;

      console.log(`Component ${index}: row=${row}, col=${col}, x=${x}, y=${y}`);

      return {
        ...component,
        style: {
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: `${cellWidth}px`,
          height: `${cellHeight}px`,
          boxSizing: 'border-box'
        }
      };
    });
  }

  /**
   * Calculate grid that perfectly fills 100% of available space
   */
  calculateFullScreenGrid(componentCount, availableWidth, availableHeight) {
    if (componentCount === 0) return { rows: 0, cols: 0, cellWidth: 0, cellHeight: 0 };
    
    // Simple, reliable grid calculation
    // Calculate columns based on square root for balanced layout
    let cols = Math.ceil(Math.sqrt(componentCount));
    
    // Ensure we don't exceed component count
    cols = Math.min(cols, componentCount);
    
    // Calculate rows needed
    const rows = Math.ceil(componentCount / cols);
    
    // Calculate cell dimensions to fill entire space
    const cellWidth = Math.floor(availableWidth / cols);
    const cellHeight = Math.floor(availableHeight / rows);
    
    // Apply reasonable limits to prevent extremely wide or tall components
    const maxWidth = Math.min(cellWidth, 800);
    const maxHeight = Math.min(cellHeight, 600);
    const minWidth = Math.max(cellWidth, 200);
    const minHeight = Math.max(cellHeight, 150);
    
    const constrainedCellWidth = Math.max(minWidth, Math.min(maxWidth, cellWidth));
    const constrainedCellHeight = Math.max(minHeight, Math.min(maxHeight, cellHeight));
    
    const result = { 
      rows, 
      cols, 
      cellWidth: constrainedCellWidth, 
      cellHeight: constrainedCellHeight,
      originalCellWidth: cellWidth,
      originalCellHeight: cellHeight
    };
    console.log('Grid calculation result:', result);
    
    return result;
  }
  
  /**
   * Clear all caches - useful for memory management
   */
  clearCache() {
    this.layoutCache.clear();
    this.gridCache.clear();
  }
  
  /**
   * Get cache statistics for performance monitoring
   */
  getCacheStats() {
    return {
      layoutCacheSize: this.layoutCache.size,
      gridCacheSize: this.gridCache.size,
      containerDimensions: {
        width: this.containerWidth,
        height: this.containerHeight
      }
    };
  }
}

/**
 * Hook to use dashboard layout optimization
 */
import { useState, useEffect } from 'react';

export function useDashboardLayout(dashboardData, containerRef) {
  const [layout, setLayout] = useState([]);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current || !dashboardData?.components) return;

    const updateLayout = () => {
      // Get the full container dimensions
      const rect = containerRef.current.getBoundingClientRect();
      
      const width = rect.width;
      const height = rect.height;

      if (width < 100 || height < 100) return;

      setContainerDimensions({ width, height });

      const optimizer = new DashboardLayoutOptimizer(width, height);
      const optimizedLayout = optimizer.optimizeLayout(dashboardData.components);
      setLayout(optimizedLayout);
    };

    // Initial layout calculation with a small delay to ensure DOM is ready
    const initialTimeout = setTimeout(updateLayout, 100);

    // Recalculate on window resize with debouncing for performance
    let resizeTimeout;
    const debouncedUpdate = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateLayout, 150);
    };

    // Use both ResizeObserver and window resize for maximum compatibility
    const resizeObserver = new ResizeObserver(debouncedUpdate);
    resizeObserver.observe(containerRef.current);
    
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', debouncedUpdate);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', debouncedUpdate);
    };
  }, [dashboardData]);

  return { layout, containerDimensions };
}