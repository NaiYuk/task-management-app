import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Task, TaskStatus } from '@/types/task'
import { applyDueDateFilters } from "@/lib/date/date-filter";

/**
 * タスク作成処理
 * @param request 
 * @returns 
 */
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


/** * タスク一覧取得処理
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // パラメータ取得
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const statusesParam = searchParams.get('statuses') || ''
    const dueFilterParam = searchParams.get('dueFilters') || ''

    const statuses = statusesParam
      .split(',')
      .map(v => v.trim())
      .filter((v): v is TaskStatus => ['todo', 'in_progress', 'done'].includes(v))

    const dueFilters = dueFilterParam
      .split(',')
      .map(v => v.trim())
      .filter(v => ['overdue', 'due_soon'].includes(v))

    // クエリ作成関数
    const createFilteredQuery = (statusOverride?: TaskStatus, countOnly = false) => {
      let query = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: countOnly })
        .eq('user_id', user.id)

      // LIKE検索
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // ステータス検索
      if (statusOverride) {
        query = query.eq('status', statusOverride)
      } else if (statuses.length) {
        query = query.in('status', statuses)
      }

      return query
    }

    // ステータス集計クエリ
    const createStatsQuery = (statusOverride?: TaskStatus) => {
      let query = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (statusOverride) query = query.eq('status', statusOverride)

      return query
    }

    // 実データ取得
    const { data: rawTasks, error } = await createFilteredQuery()
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // 期限日フィルタリング
    const tasks = applyDueDateFilters(rawTasks, dueFilters)

    //  ステータス別カウント
    const [totalResult, todoResult, inProgressResult, doneResult] = await Promise.all([
      createStatsQuery(),
      createStatsQuery('todo'),
      createStatsQuery('in_progress'),
      createStatsQuery('done'),
    ])

    const countError =
      totalResult.error || todoResult.error || inProgressResult.error || doneResult.error

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 })
    }

    return NextResponse.json({
      tasks,
      statusCounts: {
        total: totalResult.count ?? 0,
        todo: todoResult.count ?? 0,
        in_progress: inProgressResult.count ?? 0,
        done: doneResult.count ?? 0,
      },
    }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}