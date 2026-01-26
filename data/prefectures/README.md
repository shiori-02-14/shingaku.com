# 都道府県データの追加

- データは `data/prefectures/<pref>/` に置きます（例: `data/prefectures/tokyo/`）。
- 学校一覧は `schools.csv` に追記します。
- `ward` は検索/ランキングで使う地域名（市区町村や地域区分）です。
- 合格実績は `destinations_file` で `destinations/<slug>.csv` を指定するのがおすすめです。
- `year` を空欄にすると、合格実績CSV内の全年度を読み込みます（年度追加のたびに `schools.csv` を更新しなくてOK）。
- URL は `?pref=<pref>` で都道府県を切り替えます（未指定は `tokyo`）。

## schools.csv 例

```
year,slug,school_name,homepage_url,ward,type,gender,destinations,destinations_file,notes
,example-high,○○高等学校,https://example.jp/,○○市,公立,共学,,destinations/example-high.csv,2025進路状況
```
