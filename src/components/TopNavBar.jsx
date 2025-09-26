import React, { useState, forwardRef, useImperativeHandle } from 'react'
import CaseSelector from './CaseSelector'
import DashboardQuery from './DashboardQuery'
import DataManager from './DataManager'
import ResearchQuestions from './ResearchQuestions'
import NewProject from './NewProject'
import './TopNavBar.css'

const TopNavBar = forwardRef(({ cases, casesLoading, activeCase, currentQuery, onCaseSelect, onQuerySubmit, existingDashboards, queryHistory, queryInputRef, caseSelectorRef, onProjectCreated }, ref) => {
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false)
  const [isResearchQuestionsOpen, setIsResearchQuestionsOpen] = useState(false)
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)

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

  const handleNewProjectOpen = () => {
    setIsNewProjectOpen(true)
  }

  const handleNewProjectClose = () => {
    setIsNewProjectOpen(false)
  }

  const handleProjectCreated = (project) => {
    setIsNewProjectOpen(false)
    if (onProjectCreated) {
      onProjectCreated(project)
    }
  }

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openDataManager: handleDataManagerOpen,
    openResearchQuestions: handleResearchQuestionsOpen,
    openNewProject: handleNewProjectOpen
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
          
          <button 
            className="new-project-button"
            onClick={handleNewProjectOpen}
            title="Create New Project (Shift+N)"
          >
            New Project
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
      
      <NewProject
        isOpen={isNewProjectOpen}
        onClose={handleNewProjectClose}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
})

TopNavBar.displayName = 'TopNavBar'

export default TopNavBar