import './DashboardContent.css'

function DashboardContent({ activeCase, activeDashboard }) {
  if (!activeDashboard) {
    return (
      <div className="dashboard-placeholder">
        <h3>Select a dashboard to view analysis</h3>
      </div>
    )
  }

  const renderMarketLandscape = () => (
    <div className="dashboard-grid">
      <div className="dashboard-panel">
        <h3>Market Size</h3>
        <div className="panel-content">
          <div className="data-row">
            <span>Total Addressable Market:</span>
            <span className="value-up">$45.2B</span>
          </div>
          <div className="data-row">
            <span>Serviceable Market:</span>
            <span>$12.8B</span>
          </div>
          <div className="data-row">
            <span>CAGR (2024-2029):</span>
            <span className="value-up">23.5%</span>
          </div>
          <div className="data-row">
            <span>Market Maturity:</span>
            <span className="value-warning">Early Growth</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-panel">
        <h3>Key Players</h3>
        <div className="panel-content">
          <div className="competitor-item">
            <div className="competitor-name">iRobot (Roomba)</div>
            <div className="competitor-share">Market Leader - 35%</div>
          </div>
          <div className="competitor-item">
            <div className="competitor-name">Dyson</div>
            <div className="competitor-share">Premium Segment - 18%</div>
          </div>
          <div className="competitor-item">
            <div className="competitor-name">Shark</div>
            <div className="competitor-share">Value Segment - 12%</div>
          </div>
          <div className="competitor-item">
            <div className="competitor-name">Others</div>
            <div className="competitor-share">Fragmented - 35%</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-panel">
        <h3>Market Trends</h3>
        <div className="panel-content">
          <div className="trend-item">
            <div className="trend-icon">📈</div>
            <div className="trend-text">AI-powered autonomous navigation</div>
          </div>
          <div className="trend-item">
            <div className="trend-icon">🌱</div>
            <div className="trend-text">Sustainable cleaning solutions</div>
          </div>
          <div className="trend-item">
            <div className="trend-icon">📱</div>
            <div className="trend-text">IoT integration & smart home</div>
          </div>
          <div className="trend-item">
            <div className="trend-icon">🏢</div>
            <div className="trend-text">Commercial market expansion</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderInvestmentProspects = () => (
    <div className="dashboard-grid">
      <div className="dashboard-panel">
        <h3>Valuation Metrics</h3>
        <div className="panel-content">
          <div className="data-row">
            <span>Current Valuation:</span>
            <span className="value-up">{activeCase.fundingAmount || '$15M'}</span>
          </div>
          <div className="data-row">
            <span>Revenue Multiple:</span>
            <span>8.5x</span>
          </div>
          <div className="data-row">
            <span>Growth Rate:</span>
            <span className="value-up">180% YoY</span>
          </div>
          <div className="data-row">
            <span>Burn Rate:</span>
            <span className="value-warning">$450K/month</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-panel">
        <h3>Financial Projections</h3>
        <div className="panel-content">
          <div className="data-row">
            <span>2024 Revenue:</span>
            <span>$2.1M</span>
          </div>
          <div className="data-row">
            <span>2025 Revenue:</span>
            <span className="value-up">$6.8M</span>
          </div>
          <div className="data-row">
            <span>Break-even:</span>
            <span>Q3 2025</span>
          </div>
          <div className="data-row">
            <span>5-year Revenue:</span>
            <span className="value-up">$125M</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-panel">
        <h3>Investment Highlights</h3>
        <div className="panel-content">
          <div className="highlight-item">
            <div className="highlight-icon positive">✓</div>
            <div className="highlight-text">Strong product-market fit</div>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon positive">✓</div>
            <div className="highlight-text">Experienced founding team</div>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon positive">✓</div>
            <div className="highlight-text">Proprietary AI technology</div>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon warning">!</div>
            <div className="highlight-text">High capital requirements</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTechnologyAnalysis = () => (
    <div className="dashboard-grid">
      <div className="dashboard-panel">
        <h3>Technology Stack</h3>
        <div className="panel-content">
          <div className="tech-item">
            <div className="tech-category">AI/ML Framework:</div>
            <div className="tech-detail">TensorFlow, Computer Vision</div>
          </div>
          <div className="tech-item">
            <div className="tech-category">Hardware:</div>
            <div className="tech-detail">Custom sensors, LIDAR</div>
          </div>
          <div className="tech-item">
            <div className="tech-category">Cloud Platform:</div>
            <div className="tech-detail">AWS, Real-time analytics</div>
          </div>
          <div className="tech-item">
            <div className="tech-category">Mobile App:</div>
            <div className="tech-detail">React Native, IoT integration</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-panel">
        <h3>IP Portfolio</h3>
        <div className="panel-content">
          <div className="data-row">
            <span>Patents Filed:</span>
            <span className="value-up">12</span>
          </div>
          <div className="data-row">
            <span>Patents Granted:</span>
            <span>4</span>
          </div>
          <div className="data-row">
            <span>Trademarks:</span>
            <span>3</span>
          </div>
          <div className="data-row">
            <span>Trade Secrets:</span>
            <span className="value-up">Proprietary algorithms</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-panel">
        <h3>Technical Risks</h3>
        <div className="panel-content">
          <div className="risk-item low">
            <span>Hardware reliability</span>
            <span className="risk-level">Low</span>
          </div>
          <div className="risk-item medium">
            <span>AI accuracy in complex environments</span>
            <span className="risk-level">Medium</span>
          </div>
          <div className="risk-item high">
            <span>Manufacturing scalability</span>
            <span className="risk-level">High</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDefaultDashboard = () => (
    <div className="dashboard-grid">
      <div className="dashboard-panel">
        <h3>{activeDashboard.name} Overview</h3>
        <div className="panel-content">
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <div className="coming-soon-text">
              <h4>Dashboard in Development</h4>
              <p>{activeDashboard.description}</p>
              <p>This dashboard will be available in the next release.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDashboardContent = () => {
    switch (activeDashboard.id) {
      case 'market-landscape':
        return renderMarketLandscape()
      case 'investment-prospects':
        return renderInvestmentProspects()
      case 'technology-analysis':
        return renderTechnologyAnalysis()
      default:
        return renderDefaultDashboard()
    }
  }

  return (
    <div className="case-dashboard">
      <div className="dashboard-header">
        <h2>{activeDashboard.name}: {activeCase.name}</h2>
        <div className="case-meta">
          <span>Sector: {activeCase.sector}</span>
          <span>Stage: {activeCase.stage}</span>
          <span>Funding: {activeCase.fundingAmount}</span>
          <span>Analyst: {activeCase.analyst}</span>
          <span>Last Updated: {activeCase.lastUpdated}</span>
        </div>
      </div>
      
      {renderDashboardContent()}
    </div>
  )
}

export default DashboardContent