# 東京の市 CSV

- 市は `cities/` フォルダで管理します。
- 各市ごとに個別フォルダ（例: `cities/hachioji/`）を作成します。
- `index.json` の `enabled: true` にしたファイルだけ読み込みます。
- 各市フォルダ内に `schools.csv` を作成してください。
- `destinations_file` は `destinations/<slug>.csv` を推奨します（各市フォルダ内の `destinations/` 配下）。

## 年度ごとのデータ管理（推奨方法）

**`schools.csv` の `year` 列は空欄にしてください。** これにより、`destinations` CSVから年度を自動的に読み取り、各年度ごとの学校データが自動生成されます。

### schools.csv（年度列は空欄）

```csv
year,slug,school_name,homepage_url,ward,type,gender,destinations,destinations_file,notes
,example-high,サンプル高等学校,https://example.com/,市名,私立,共学,,destinations/example-high.csv,合格実績
```

**メリット：**
- 年度ごとの行を追加する必要がない
- `destinations` CSVに年度を追加するだけで、自動的にその年度のデータが読み込まれる
- 年度追加のたびに `schools.csv` を更新する必要がない

### destinations CSVに年度を追加

`destinations/<slug>.csv` に `year` 列で年度を指定し、複数年度のデータを同じファイルに入れることができます：

```csv
year,name,count,is_overseas,category
2025,東京大学,20,,国公立
2025,早稲田大学,15,,
2026,東京大学,22,,国公立
2026,早稲田大学,18,,
```

**年度の追加方法：**
1. `destinations/example-high.csv` に2026年度のデータを追加するだけ
2. `schools.csv` は変更不要
3. 自動的に2025年度と2026年度の両方が読み込まれる

### 特定年度のみを表示したい場合

特定の年度だけを表示したい場合は、`schools.csv` の `year` 列に年度を指定できます：

```csv
year,slug,school_name,homepage_url,ward,type,gender,destinations,destinations_file,notes
2025,example-high,サンプル高等学校,https://example.com/,市名,私立,共学,,destinations/example-high.csv,2025合格実績のみ
```
