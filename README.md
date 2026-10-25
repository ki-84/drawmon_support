# Drawmon — 描いた絵で、勝てる。

Drawmonの公式プロモーション・サポートサイト。公開先は **https://ki-84.github.io/drawmon_support/** です。

HTML・CSS・JavaScript・画像のみの静的サイトなので、GitHub Pagesで動作します。実行サーバー、APIキー、外部CDN、アクセス解析は不要です。

## 内容

- 勇者と手描きの仲間を大きく描いたHP専用のキャンペーンビジュアル（PC／スマホ・タブレット用の2構図）
- 勇者が案内する「相手を見る → 工夫を描く → アプリで仲間にする」の遊び方
- 現行アプリの5エリア・50階の冒険を紹介
- 本体と同じ128×128のドット描画、同じ16色枠と自由色、太さ1・2・4・8、塗りつぶし、消しゴム、拡大・移動、戻す・やり直す
- 保存は1024×1024の透過PNG（128×128を補間なしで8倍）。本体の現行UIを実際に操作して撮影した紹介画像
- FAQ、既存のGitHub Issues受付（不具合・要望・質問）
- 日英のプライバシーポリシー（`privacy.html`）と、全言語ページからのリンク
- 16言語・表記の静的ページ、言語切替、canonical、hreflang、サイトマップ

日本語、英語、韓国語、簡体字中国語、繁体字中国語、スペイン語、フランス語、ドイツ語、ポルトガル語、イタリア語、ベトナム語、トルコ語、オランダ語、スウェーデン語、デンマーク語、ノルウェー語ブークモールに対応します。追加14設定はApple Translationによる翻訳を起点にした文案です。公開後も母語話者による表現の確認を続けてください。

サイトの16言語と、アプリの通常選択（日本語・英語）／追加14設定の開発用プレビューを区別して記載しています。アプリは配信準備中で、未確定のApp Storeリンクや価格は掲載していません。

## 編集

- `src/index.template.html`: 共通HTML
- `src/privacy.html`: 日英のプライバシーポリシー。生成時に`docs/privacy.html`へコピー
- `src/base-copy.json`: 日本語・英語の元文案
- `src/locales/*.json`: 言語別本文（113項目）
- `src/editorial-overrides.json`: 追加14設定の見出し・用語などの推敲（翻訳の再生成後も維持）
- `docs/assets/style.css`, `app.js`: デザインとブラウザー内の操作
- `docs/assets/campaign-v5.css`: 勇者を主役にしたメインビジュアルと、大きなキャラクター配置
- `docs/assets/pixel-grid.mjs`: 本体の整数描画・四方向塗りつぶしに合わせた128×128ドット処理
- `docs/assets/art/`: 最適化済み素材
- `src/ART_DIRECTION.md`: 生成画像の最終プロンプト、保存先、素材の出典
- `src/CAMPAIGN_ART_V5.md`: 現在のHP専用メイン画像2枚と、視線・腕の姿勢を修正した生成プロンプト
- `src/CAMPAIGN_HAND_REPAIR_V6.md`: PC用メイン画像の女性の手を修正した最新版と生成プロンプト
- `.github/ISSUE_TEMPLATE/`: 既存の受付フォーム

ローカライズ済みHTMLは`docs/`に生成してコミットします。公開物は`docs/`だけです。

```sh
python3 scripts/build_site.py
python3 scripts/check_site.py
node --test scripts/pixel-grid.test.mjs
node --input-type=module --check < docs/assets/app.js
python3 -m http.server 8173 --directory docs --bind 127.0.0.1
```

http://127.0.0.1:8173/ を開きます。`/en/`など各言語の直リンクにも対応します。ビルドにはPython標準ライブラリのみを使い、Node.jsはドット描画の検証と構文確認時に使用します。

日本語・英語は`src/base-copy.json`を修正し、各言語を確認してから生成してください。`scripts/translate_site.py`は隣接するDrawmonアプリのMac用`AppleNativeBenchmark`とApple Translationがある開発環境で、追加14設定の翻訳文案を作るための任意ツールです。公開時には使いません。

## 公開

`main`に`docs/`、`src/`、生成・検証スクリプト、公開ワークフローの変更をpushすると、既存のGitHub Actionsが16ページを再生成・検証してGitHub Pagesへ公開します。PagesのSourceは**GitHub Actions**を使用します。

Web上でできるのはお絵描きとPNG保存です。絵の読み取り・仲間の誕生・戦いはアプリの機能として明記し、決められた絵を選ぶ疑似バトルは掲載しません。絵は送信・自動保存されず、PNG保存ボタンを押したときだけブラウザーから書き出します。
