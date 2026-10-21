import pandas as pd
import json
import math
import glob
import os

# === 自动在当前目录及子目录中寻找 data.xlsx ===
excel_files = glob.glob("**/data.xlsx", recursive=True)
if not excel_files:
    print("❌ 找不到 data.xlsx，请检查文件名是否拼写正确。")
    exit()

SRC = excel_files[0]
print(f"✅ 成功找到数据文件: {SRC}")

OUT = "data/heatmap-panel.js"

# 中文列名 → 内部 metric key
METRIC_MAP = {
    "Gross domestic product": "gdp",
    "Total exports and imports": "trade",
    "Percentage of secondary industry": "secondary_share",
    "Technology market turnover": "tech_turnover",
    "Energy consumption intensity": "energy_intensity",
    "Energy consumption ratio": "energy_ratio",
    "Population density": "pop_density",
    "CO2 Emissions": "co2",
}

print("正在读取 Excel...")
df = pd.read_excel(SRC, sheet_name="Sheet1")
df.columns = [str(c).strip() for c in df.columns]

# 清理数据
df["年份"] = pd.to_numeric(df["年份"], errors="coerce")
df["省份"] = df["省份"].astype(str).str.strip()
df = df.dropna(subset=["年份", "省份"])
df["年份"] = df["年份"].astype(int)

years = sorted(df["年份"].unique().astype(str))
provinces = list(dict.fromkeys(df["省份"].tolist()))

print(f"数据包含 {len(years)} 个年份，{len(provinces)} 个省份。")

metrics = {}
for col, key in METRIC_MAP.items():
    if col not in df.columns:
        continue
    values = {}
    for p in provinces:
        sub = df[df["省份"] == p].set_index("年份")
        arr = []
        for y in years:
            try:
                v = sub.loc[int(y), col]
                if pd.notna(v) and math.isfinite(float(v)):
                    arr.append(round(float(v), 6))
                else:
                    arr.append(None)
            except KeyError:
                arr.append(None)
        values[p] = arr
    metrics[key] = {
        "label": col,
        "years": years,
        "provinces": provinces,
        "values": values,
    }

payload = {"source": SRC, "metrics": metrics}

# 确保 data 文件夹存在
os.makedirs("data", exist_ok=True)

with open(OUT, "w", encoding="utf-8") as f:
    f.write("window.HEATMAP_PANEL = ")
    json.dump(payload, f, ensure_ascii=False)
    f.write(";\n")

print(f"🎉 导出成功！文件已保存到: {OUT}")
print(f"包含指标: {list(metrics.keys())}")