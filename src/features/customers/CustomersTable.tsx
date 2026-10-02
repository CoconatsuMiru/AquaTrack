import type { CustomerWithHeldCount } from '../../services/customers'

type CustomersTableProps = {
  customers: CustomerWithHeldCount[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-slate-500">
        No customers found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-6 py-3 font-medium">Customer</th>
            <th className="px-6 py-3 font-medium">Phone</th>
            <th className="px-6 py-3 font-medium">Address</th>
            <th className="px-6 py-3 font-medium">Containers held</th>
            <th className="px-6 py-3 font-medium">Registered</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <p className="font-medium text-slate-900">{customer.full_name}</p>
                {!customer.is_active && (
                  <span className="text-xs font-medium text-slate-500">Inactive</span>
                )}
              </td>
              <td className="px-6 py-4 text-slate-700">{customer.phone ?? '—'}</td>
              <td className="px-6 py-4 text-slate-700">{customer.address ?? '—'}</td>
              <td className="px-6 py-4">
                <span
                  className={
                    customer.containers_held > 0
                      ? 'rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700'
                      : 'text-slate-500'
                  }
                >
                  {customer.containers_held}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-600">
                {new Date(customer.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}