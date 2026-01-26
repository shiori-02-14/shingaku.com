# 合格実績データの編集方法（福岡）

- `data/prefectures/fukuoka/schools.csv` の `destinations_file` にこのフォルダのCSVを指定します。
- `schools.csv` の `year` を空欄にすると、このCSV内の全年度が読み込まれます（年度追加のたびに `schools.csv` を更新しなくてOK）。
- `schools.csv` に `year` を入れると、その年度だけを読み込みます。
- ファイル名は「高校のローマ字表記」にします。例: `fukuoka-example.csv`
- 年度ごとに記録したい場合は、CSVに `year` 列を追加して同じファイルに複数年度を入れます。
- CSVの列は `year,name,count,is_overseas,category` です（1行目はヘッダー推奨）。
- `is_overseas` は `1` / `true` / `海外` のいずれかで海外大学扱いになります。
- `category` は任意で `国公立` / `私立` / `医学部` / `海外`（英語なら `public` / `private` / `medical` / `overseas`）を指定できます。
- 合格者数（`count`）からランク割合と進学偏差値は自動計算されます。

例:

```
year,name,count,is_overseas,category
2025,福岡大学,20,,国公立
2025,Harvard University,1,1,海外
2026,福岡大学,18,,国公立
```
