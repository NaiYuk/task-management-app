'use client'

export default function SlackHelpPage() {
  return (
    <div className="min-h-screen bg-indigo-200 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between border-b border-indigo-400 mb-2">
                <h1 className="text-3xl font-bold mb-4 text-[#1b2a41]">
                Slack通知の設定方法
                </h1>
                <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="text-blue-600 leading-relaxed underline hover:text-blue-800">
                    ダッシュボードに戻る
                </button>
            </div>

            <p className="mb-6 text-gray-700 leading-relaxed">
            タスク管理アプリからSlackに通知を送信するには、SlackのIncoming Webhooksを使用します。
            以下の手順でWebhook URLを取得し、アプリに設定してください。
            </p>

            <h2 className="text-2xl font-semibold mb-3 text-[#1b2a41]">
            1. SlackでIncoming Webhooksを有効化
            </h2>

            <ol className="list-decimal list-inside mb-8 space-y-3 text-gray-700 leading-relaxed">
            <li>
                <strong>Slackアプリを作成:</strong><br />
                <a
                href="https://api.slack.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline hover:text-blue-800"
                >
                https://api.slack.com/apps
                </a>
                にアクセスし、「Create New App」ボタンをクリックして新しいアプリを作成します。
            </li>

            <li>
                <strong>Incoming Webhooksを追加:</strong><br />
                アプリの設定ページで「Incoming Webhooks」を選択し、
                「Activate Incoming Webhooks」をオンにします。
            </li>

            <li>
                <strong>Webhook URLを作成:</strong><br />
                「Add New Webhook to Workspace」を選択し、通知先チャンネルを選び「許可する」をクリック。
                これでWebhook URLが生成されます。
            </li>
            </ol>

            <h2 className="text-2xl font-semibold mb-3 text-[#1b2a41]">
            2. Webhook URLをアプリに設定
            </h2>

            <ol className="list-decimal list-inside mb-8 space-y-3 text-gray-700 leading-relaxed">
            <li>
                <strong>Webhook URLをコピー:</strong><br />
                先ほど生成されたWebhook URLをコピーします。
            </li>

            <li>
                <strong>アプリの通知設定を開く:</strong><br />
                タスク管理アプリのダッシュボードにログインし、通知設定を開きます。
            </li>

            <li>
                <strong>Webhook URLを貼り付け:</strong><br />
                コピーしたWebhook URLを通知設定画面に貼り付けて保存します。
            </li>
            </ol>

            <p className="text-gray-700 leading-relaxed">
            以上で設定は完了です。タスクの作成や更新時にSlackへ通知が送信されるようになります。
            </p>
        </div>
        </div>
  )
}   