import { useState } from 'react'

function Welcome() {
  const [name, setName] = useState('')

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #646cff', 
      borderRadius: '8px', 
      margin: '20px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>Welcome to Your React App!</h2>
      <div>
        <input 
          type="text" 
          placeholder="Enter your name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: '8px',
            marginRight: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        {name && <p>Hello, <strong>{name}</strong>! 👋</p>}
      </div>
    </div>
  )
}

export default Welcome