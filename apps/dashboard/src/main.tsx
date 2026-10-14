import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  return <main className="shell">
    <header><span className="moon">🌙</span><div><h1>Yanagi Dashboard</h1><p>夜凪 管理画面 — Starter</p></div></header>
    <section className="panel">
      <h2>システム状態</h2>
      <p>ここは管理画面の土台です。実際の状態表示にはAPI接続と管理者認証が必要です。</p>
      <ul><li>API: 未接続</li><li>ポイント管理: 未実装</li><li>監査ログ: 未実装</li></ul>
    </section>
    <footer>Yanagi · Build safely, grow gradually.</footer>
  </main>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
