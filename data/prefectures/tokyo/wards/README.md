# 東京23区 CSV

- 23区は `wards/` フォルダで管理します。
- 各区ごとに個別フォルダ（例: `wards/adachi/`）を作成します。
- `index.json` の `enabled: true` にしたファイルだけ読み込みます。
- 各区フォルダ内に `schools.csv` を作成してください。
- `destinations_file` は `destinations/<slug>.csv` を推奨します（各区フォルダ内の `destinations/` 配下）。

## 年度ごとのデータ管理（推奨方法）

**`schools.csv` の `year` 列は空欄にしてください。** これにより、`destinations` CSVから年度を自動的に読み取り、各年度ごとの学校データが自動生成されます。

### schools.csv（年度列は空欄）

```csv
year,slug,school_name,homepage_url,ward,type,gender,destinations,destinations_file,notes
,adachi-gakuen,足立学園高等学校,https://www.adachigakuen-jh.ed.jp/,足立区,私立,男子校,,destinations/adachi-gakuen.csv,合格実績
```

**メリット：**
- 年度ごとの行を追加する必要がない
- `destinations` CSVに年度を追加するだけで、自動的にその年度のデータが読み込まれる
- 年度追加のたびに `schools.csv` を更新する必要がない

### destinations CSVに年度を追加

`destinations/<slug>.csv` に `year` 列で年度を指定し、複数年度のデータを同じファイルに入れることができます：

```csv
year,name,count,is_overseas,category
2025,麗澤大学,80,,
2025,日本大学,76,,
2026,麗澤大学,85,,
2026,日本大学,78,,
```

**年度の追加方法：**
1. `destinations/adachi-gakuen.csv` に2026年度のデータを追加するだけ
2. `schools.csv` は変更不要
3. 自動的に2025年度と2026年度の両方が読み込まれる

### 特定年度のみを表示したい場合

特定の年度だけを表示したい場合は、`schools.csv` の `year` 列に年度を指定できます：

```csv
year,slug,school_name,homepage_url,ward,type,gender,destinations,destinations_file,notes
2025,adachi-gakuen,足立学園高等学校,https://www.adachigakuen-jh.ed.jp/,足立区,私立,男子校,,destinations/adachi-gakuen.csv,2025合格実績のみ
```
