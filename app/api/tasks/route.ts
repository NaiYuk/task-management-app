import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// タスク作成API
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, status, priority, due_date } = body

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description: description || null,
        status: status || 'todo',
        priority: priority || 'medium',
        due_date: due_date || null,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Slack通知を送信
    try {
      await fetch(`${request.nextUrl.origin}/api/slack/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'created',
          task: {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
          },
          user_email: user.email,
        }),
      })
    } catch (slackError) {
      console.error('Slack通知エラー:', slackError)
      // Slack通知が失敗してもタスク作成は成功として扱う
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// タスク一覧取得API（検索・フィルタリング対応）
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // LIKE検索（タイトルまたは説明）
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // ステータスフィルター
    if (status) {
      query = query.eq('status', status)
    }

    // 優先度フィルター
    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data: tasks, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(tasks)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
