import { computed, readonly, ref } from 'vue'
import { isSupabaseConfigured, supabase } from '../services/supabase'

const session = ref(null)
const loading = ref(false)
const initialized = ref(false)
let authSubscription

const ensureAdministrator = async () => {
  const { data, error } = await supabase.rpc('is_catalog_admin')
  if (error || !data) {
    await supabase.auth.signOut()
    if (error) throw error
    throw new Error('Esta conta não possui acesso administrativo.')
  }
}

export const useAdminAuth = () => {
  const initializeAuth = async () => {
    if (!isSupabaseConfigured || initialized.value) return session.value

    loading.value = true
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      session.value = data.session
      if (session.value) await ensureAdministrator()

      if (!authSubscription) {
        const listener = supabase.auth.onAuthStateChange((_event, nextSession) => {
          session.value = nextSession
        })
        authSubscription = listener.data.subscription
      }

      initialized.value = true
      return session.value
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email, password) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error

      session.value = data.session
      await ensureAdministrator()
      return session.value
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      session.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    session: readonly(session),
    user: computed(() => session.value?.user || null),
    loading: readonly(loading),
    initializeAuth,
    signIn,
    signOut,
  }
}
