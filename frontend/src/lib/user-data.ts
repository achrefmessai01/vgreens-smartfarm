import type { User } from './user-types'

// In-memory storage for demo purposes
// In a real app, this would be replaced with API calls
let users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main St, New York, NY 10001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 234 567 8901',
    address: '456 Oak Ave, Los Angeles, CA 90001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function getAllUsers(): User[] {
  return [...users]
}

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id)
}

export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  users.push(newUser)
  return newUser
}

export function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) {
    return null
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...userData,
    updatedAt: new Date().toISOString(),
  }
  return users[userIndex]
}

export function deleteUser(id: string): boolean {
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) {
    return false
  }
  users.splice(userIndex, 1)
  return true
}

export function searchUsers(query: string): User[] {
  const lowerQuery = query.toLowerCase()
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.phone.includes(lowerQuery) ||
      user.address.toLowerCase().includes(lowerQuery)
  )
}

