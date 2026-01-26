import { gql } from '@apollo/client'

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      clerkUserId
      email
      firstName
      lastName
      imageUrl
      role
      tenantId
      isActive
      status
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      clerkUserId
      email
      firstName
      lastName
      imageUrl
      role
      tenantId
      isActive
      createdAt
      updatedAt
    }
  }
`

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`
