// Supabaseクライアントコンポーネントクライアントの作成
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

/**
 * Supabaseクライアントの作成
 * @returns client instance
 */
export const createClient = () => {
  return createClientComponentClient<Database>()
}
