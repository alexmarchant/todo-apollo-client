import React, { useState, useEffect } from 'react'
import Login from './Login'
import Todos from './Todos'

const localToken = window.localStorage.getItem('token')

const App: React.FC = () => {
  const [token, setToken] = useState<string | null | undefined>(localToken)

  useEffect(() => {
    console.log(token)
    if (token) {
      window.localStorage.setItem('token', token)
    } else {
      window.localStorage.removeItem('token')
    }
  }, [token])
  
  if (token) {
    return <Todos setToken={setToken} />
  } else {
    return <Login setToken={setToken} />
  }
}

export default App
