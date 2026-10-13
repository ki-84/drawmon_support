# Drawmon サポートページ

ゲーム「Drawmon」の日本語サポートページ。静的HTMLとCSSで構成し、GitHub Pagesで公開します。

公開URL: https://ki-84.github.io/drawmon_support/

## 内容

- 不具合・要望・質問の受付（GitHub Issues）
- 不具合報告に必要な情報の案内
- お問い合わせに関するFAQ
- スマートフォン対応・キーボード操作対応

ゲーム本体が未登録のため、遊び方・対応OS・課金・データの保存方式・プライバシーポリシーは記載していません。正式な仕様を確認してから追加してください。

## 編集と公開

ページは `docs/index.html`、デザインは `docs/assets/style.css` を編集します。受付フォームは `.github/ISSUE_TEMPLATE/` にあります。問い合わせ先を変更する場合は、ページ内の各リンクとGitHub Issuesの案内文を更新してください。

`main` に `docs/` または公開ワークフローの変更をpushすると、GitHub Actionsが自動で公開します。公開対象は `docs/` のみで、READMEや受付フォームは含みません。

GitHubの **Settings → Pages → Build and deployment → Source** は **GitHub Actions** を選択します。公開状況は **Actions** の `Deploy support site to GitHub Pages` で確認できます。

GitHub Pages公開設定について: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## ローカル確認

```sh
python3 -m http.server 8000 --directory docs --bind 127.0.0.1
```

http://127.0.0.1:8000/ を開きます。ビルドやパッケージのインストールは不要です。
