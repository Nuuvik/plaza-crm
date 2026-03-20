import api from '.'
import type { User } from '../types'

export const getMe = () => api.get<User>('/users/me')