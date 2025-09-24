import { useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import './SettingsButton.css'

const SettingsButton = forwardRef(({ onDataManagerOpen }, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const settingsOptions = [
    { id: 'data-manager', label: 'Data manager', action: () => onDataManagerOpen && onDataManagerOpen() }
  ]

  const handleOptionSelect = (option) => {
    option.action()
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0)
    } else {
      setSelectedIndex(-1)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev < settingsOptions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < settingsOptions.length) {
            handleOptionSelect(settingsOptions[selectedIndex])
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
  }, [isOpen, selectedIndex, settingsOptions])

  useImperativeHandle(ref, () => ({
    openSettings: () => setIsOpen(true),
    closeSettings: () => setIsOpen(false),
    toggleSettings: () => setIsOpen(!isOpen)
  }))

  return (
    <div className="settings-button">
      <button 
        className="settings-button-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Settings"
      >
        ⚙
      </button>
      
      {isOpen && (
        <div className="settings-dropdown">
          <div className="dropdown-content">
            {settingsOptions.map((option, index) => (
              <div
                key={option.id}
                className={`settings-item ${
                  selectedIndex === index ? 'highlighted' : ''
                }`}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="settings-item-label">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isOpen && <div className="dropdown-overlay" onClick={() => setIsOpen(false)} />}
    </div>
  )
})

export default SettingsButton