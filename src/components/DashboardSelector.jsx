import { dashboardTypes } from '../data/dashboardTypes'
import './DashboardSelector.css'

function DashboardSelector({ activeDashboard, onDashboardSelect, disabled }) {
  if (disabled) {
    return (
      <div className="dashboard-nav disabled">
        <div className="dashboard-nav-label">DASHBOARD:</div>
        <div className="dashboard-message">Select a case to view dashboards</div>
      </div>
    )
  }

  return (
    <div className="dashboard-nav">
      <div className="dashboard-nav-label">DASHBOARD:</div>
      <div className="dashboard-tabs">
        {dashboardTypes.map((dashboard) => (
          <button
            key={dashboard.id}
            className={`dashboard-tab ${activeDashboard?.id === dashboard.id ? 'active' : ''}`}
            onClick={() => onDashboardSelect(dashboard)}
            title={dashboard.description}
          >
            <span className="dashboard-icon">{dashboard.icon}</span>
            <span className="dashboard-name">{dashboard.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default DashboardSelector