// Supabaseサーバーコンポーネントクライアントの作成
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

/**
 * Supabaseクライアントの作成
 * @returns client instance
 */
export const createClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}
