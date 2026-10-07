import type { Database } from './database.types'

type Tables = Database['public']['Tables']
type Views = Database['public']['Views']

export type ContainerType = Tables['container_types']['Row']
export type Customer = Tables['customers']['Row']
export type Container = Tables['containers']['Row']
export type Transaction = Tables['transactions']['Row']

// One line of the history screen: a transaction with its container and customer details
export type TransactionHistoryRow = Views['transaction_history']['Row']

// Dashboard numbers: containers per status for one type, and customers holding containers
export type ContainerTypeSummary = Views['container_type_summary']['Row']
export type CustomerHolding = Views['customer_holdings']['Row']

export type ContainerStatus = Container['status']
export type TransactionType = Transaction['transaction_type']

// Shapes used when creating or changing records (id, timestamps etc. are filled in by the database)
export type NewContainerType = Tables['container_types']['Insert']
export type ContainerTypeUpdate = Tables['container_types']['Update']
export type NewCustomer = Tables['customers']['Insert']
export type NewContainer = Tables['containers']['Insert']