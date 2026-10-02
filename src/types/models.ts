import type { Database } from './database.types'

type Tables = Database['public']['Tables']

export type ContainerType = Tables['container_types']['Row']
export type Customer = Tables['customers']['Row']
export type Container = Tables['containers']['Row']
export type Transaction = Tables['transactions']['Row']

export type ContainerStatus = Container['status']
export type TransactionType = Transaction['transaction_type']

// Shapes used when creating or changing records (id, timestamps etc. are filled in by the database)
export type NewContainerType = Tables['container_types']['Insert']
export type ContainerTypeUpdate = Tables['container_types']['Update']
export type NewCustomer = Tables['customers']['Insert']
export type NewContainer = Tables['containers']['Insert']