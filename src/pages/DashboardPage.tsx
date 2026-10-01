import { useEffect, useState } from 'react'
import { useAuth } from '../features/auth/useAuth'
import { supabase } from '../lib/supabase'

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const [readCheck, setReadCheck] = useState('Checking database access…')

  useEffect(() => {
    async function checkDatabaseAccess() {
      const { count, error } = await supabase
        .from('container_types')
        .select('*', { count: 'exact', head: true })

      setReadCheck(
        error
          ? `❌ Database read failed: ${error.message}`
          : `✅ Logged-in database read works (${count} container types so far)`,
      )
    }

    checkDatabaseAccess()
  }, [])

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>AquaTrack Dashboard</h1>
      <p>Signed in as {user?.email}</p>
      <p>{readCheck}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </main>
  )
}