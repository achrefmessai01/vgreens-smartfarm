'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { ApolloClient } from '@apollo/client'
import { createApolloClient } from './apollo-client'
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react'

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth()
  const [client, setClient] = useState<ApolloClient | null>(null)

  useEffect(() => {
    const initApollo = async () => {
      const apolloClient = createApolloClient(getToken)
      setClient(apolloClient)
    }

    initApollo()
  }, [getToken])

  if (!client) return null

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>
}
