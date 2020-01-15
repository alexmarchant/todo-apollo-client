import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import {
  ApolloClient,
  HttpLink,
  ApolloLink,
  InMemoryCache,
  ApolloProvider,
  concat,
  Operation,
  NextLink,
} from '@apollo/client'

const httpLink = new HttpLink({
  uri: 'http://localhost:4000',
})

const authMiddleware = new ApolloLink((operation: Operation, forward: NextLink) => {
  let authHeader = null
  const token = localStorage.getItem('token')
  if (token) {
    authHeader = `Bearer ${token}`
  }

  // add the authorization to the headers
  operation.setContext({
    headers: {
      Authorization: authHeader,
    },
  })

  return forward(operation)
})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(authMiddleware, httpLink),
})

ReactDOM.render(<ApolloProvider client={client}><App /></ApolloProvider>, document.getElementById('root'))
