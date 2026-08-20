import React, { createContext, useContext, useState, useEffect } from 'react';

const initialFilters = {
  districtId: 'ALL',
  talukId: 'ALL',
  stationId: 'ALL',
  checkpostId: 'ALL',
  categoryId: 'ALL',
  sourceId: 'ALL',
  verificationStatus: 'ALL',
  riskLevel: 'ALL',
  isEnforcement: 'ALL',
  startDate: '',
  endDate: '',
  search: ''
};

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem('nrise_global_filters');
      return saved ? JSON.parse(saved) : initialFilters;
    } catch {
      return initialFilters;
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nrise_global_filters', JSON.stringify(filters));
    } catch {
      // ignore
    }
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // If district changes, reset taluk/station/checkpost
      ...(key === 'districtId' ? { talukId: 'ALL', stationId: 'ALL', checkpostId: 'ALL' } : {})
    }));
  };

  const setBulkFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, val]) => {
      if (val && val !== 'ALL' && val !== '') count++;
    });
    return count;
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        updateFilter,
        setBulkFilters,
        resetFilters,
        activeFilterCount: getActiveFilterCount(),
        isDrawerOpen,
        setIsDrawerOpen
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  return useContext(FilterContext);
}
