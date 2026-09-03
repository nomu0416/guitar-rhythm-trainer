# FRETRUSH (guitar-rhythm-trainer)

エレキギター練習用のリズムゲーム。譜面(TAB譜)が流れてくる画面に合わせて実際にギターを演奏し、
マイク入力から音を解析して音程・タイミングを判定する。

- v1スコープ: 単音メロディのみ判定、譜面はTAB譜ファイルをインポートして使用
- 将来拡張: コード(和音)判定、音源(mp3等)からのTAB譜自動生成

詳細な仕様は [spec.md](spec.md)、構想設計は [design.md](design.md)、画面イメージは [FretRush Screens](https://claude.ai/code/artifact/4f717382-3d66-4ec6-b319-ee3c9f29a598) を参照。

## 開発

```bash
npm install
npm run dev      # http://localhost:5173
npx vitest run   # テスト
npm run lint
```

`public/samples/` に動作確認用のTAB譜(.gp)を同梱している。いずれもalphaTexで自作した
著作権フリーのオリジナルフレーズ、またはパブリックドメインの旋律(Ode to Joy)で、実在の
楽曲データではない。

- `practice-phrase.gp` — 単音フレーズ(6弦全体を使用)
- `ode-to-joy.gp` — ベートーヴェン「歓喜の歌」冒頭(パブリックドメイン)
- `tempo-change-phrase.gp` — 曲中でテンポが変わるフレーズ(tick→ms変換の確認用)
