import { useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import './CaseSelector.css'

const CaseSelector = forwardRef(({ cases, casesLoading, activeCase, onCaseSelect }, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const handleCaseSelect = (selectedCase) => {
    onCaseSelect(selectedCase)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Reset selected index when opening/closing
  useEffect(() => {
    if (isOpen) {
      // Start with currently active case highlighted, or first case
      const activeIndex = cases.findIndex(c => c.id === activeCase?.id)
      setSelectedIndex(activeIndex >= 0 ? activeIndex : 0)
    } else {
      setSelectedIndex(-1)
    }
  }, [isOpen, cases, activeCase])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev < cases.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < cases.length) {
            handleCaseSelect(cases[selectedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, cases])

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    openSelector: () => setIsOpen(true),
    closeSelector: () => setIsOpen(false),
    toggleSelector: () => setIsOpen(!isOpen)
  }))

  return (
    <div className="case-selector">
      <button 
        className="case-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={casesLoading}
      >
        <span className="selector-value">
          {casesLoading ? 'LOADING CASES...' : (activeCase ? activeCase.name : 'SELECT CASE')}
        </span>
        <span className={`selector-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="case-dropdown">
          <div className="dropdown-content">
            {casesLoading ? (
              <div className="case-loading">
                <span>Loading cases...</span>
              </div>
            ) : cases.length === 0 ? (
              <div className="case-empty">
                <span>No cases available</span>
              </div>
            ) : (
              cases.map((caseItem, index) => (
                <div
                  key={caseItem.id}
                  className={`case-item ${
                    activeCase?.id === caseItem.id ? 'selected' : ''
                  } ${
                    selectedIndex === index ? 'highlighted' : ''
                  }`}
                  onClick={() => handleCaseSelect(caseItem)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="case-item-id">{caseItem.id} - {caseItem.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {isOpen && <div className="dropdown-overlay" onClick={() => setIsOpen(false)} />}
    </div>
  )
})

export default CaseSelector