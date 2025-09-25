import React, { useState, forwardRef, useImperativeHandle } from 'react'
import CaseSelector from './CaseSelector'
import DashboardQuery from './DashboardQuery'
import DataManager from './DataManager'
import ResearchQuestions from './ResearchQuestions'
import './TopNavBar.css'

const TopNavBar = forwardRef(({ cases, casesLoading, activeCase, currentQuery, onCaseSelect, onQuerySubmit, existingDashboards, queryHistory, queryInputRef, caseSelectorRef }, ref) => {
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false)
  const [isResearchQuestionsOpen, setIsResearchQuestionsOpen] = useState(false)

  const handleDataManagerOpen = () => {
    setIsDataManagerOpen(true)
  }

  const handleDataManagerClose = () => {
    setIsDataManagerOpen(false)
  }

  const handleResearchQuestionsOpen = () => {
    setIsResearchQuestionsOpen(true)
  }

  const handleResearchQuestionsClose = () => {
    setIsResearchQuestionsOpen(false)
  }

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openDataManager: handleDataManagerOpen,
    openResearchQuestions: handleResearchQuestionsOpen
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
          
          <button 
            className="research-questions-button"
            onClick={handleResearchQuestionsOpen}
            title="Research Questions (Shift+R)"
          >
            Research Questions
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
      
      <ResearchQuestions
        isOpen={isResearchQuestionsOpen}
        onClose={handleResearchQuestionsClose}
        activeCase={activeCase}
      />
    </div>
  )
})

TopNavBar.displayName = 'TopNavBar'

export default TopNavBar