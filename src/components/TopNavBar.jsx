import React, { useState, forwardRef, useImperativeHandle } from 'react'
import CaseSelector from './CaseSelector'
import DashboardQuery from './DashboardQuery'
import DataManager from './DataManager'
import './TopNavBar.css'

const TopNavBar = forwardRef(({ cases, casesLoading, activeCase, currentQuery, onCaseSelect, onQuerySubmit, existingDashboards, queryHistory, queryInputRef, caseSelectorRef }, ref) => {
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false)

  const handleDataManagerOpen = () => {
    setIsDataManagerOpen(true)
  }

  const handleDataManagerClose = () => {
    setIsDataManagerOpen(false)
  }

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openDataManager: handleDataManagerOpen
  }))

  return (
    <div className="top-nav-bar">
      <div className="nav-content">
        <div className="nav-left">
          <button 
            className="add-data-button"
            onClick={handleDataManagerOpen}
            title="Add Data (Shift+D for sidebar)"
          >
            Add Data
          </button>
          
          <CaseSelector 
            cases={cases}
            casesLoading={casesLoading}
            activeCase={activeCase}
            onCaseSelect={onCaseSelect}
            ref={caseSelectorRef}
          />
          
          {activeCase && (
            <DashboardQuery 
              activeCase={activeCase}
              currentQuery={currentQuery}
              onQuerySubmit={onQuerySubmit}
              existingDashboards={existingDashboards}
              queryHistory={queryHistory}
              inputRef={queryInputRef}
            />
          )}
        </div>
      </div>
      
      <DataManager
        isOpen={isDataManagerOpen}
        onClose={handleDataManagerClose}
        cases={cases}
        initialCaseId={activeCase?.id}
      />
    </div>
  )
})

TopNavBar.displayName = 'TopNavBar'

export default TopNavBar