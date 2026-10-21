# China Provincial Panel Dataset on Economic Development, Energy and CO₂ Emissions (2000–2022)

This repository provides a balanced annual panel for **31 Chinese provincial-level administrative regions** (provinces, autonomous regions, and municipalities) over **2000–2022**. It is designed for transparent empirical work on regional economic development, energy use, environmental performance, and carbon emissions.

## Data at a glance

| Item | Description |
|---|---|
| Observation unit | Province–year |
| Coverage | 31 provincial-level regions in China |
| Period | 2000–2022 (23 annual observations per region; 713 rows) |
| File | [`data.xlsx`](data.xlsx), worksheet `Sheet1` |
| Key fields | Year, province, GDP, total exports and imports, secondary-industry share, technology-market turnover, energy-consumption intensity, energy-consumption ratio, population density, CO₂ emissions |

## Variable guide

The first two columns identify the panel (`年份`/year and `省份`/province). The remaining columns are numeric indicators supplied in the workbook. English headers are retained to make the file easier to use in R, Python, Stata, and other statistical software. **Check the original source definitions and units before combining variables across studies**; the workbook is a research data release, not a claim that all fields share a common price base or measurement convention.

## Quick start

```python
import pandas as pd

df = pd.read_excel("data.xlsx", sheet_name="Sheet1")
df = df.sort_values(["省份", "年份"])
print(df.shape, df["省份"].nunique(), df["年份"].min(), df["年份"].max())
```

For panel regressions, verify that the province labels are consistent, inspect missing and duplicate province–year keys, document any deflation or logarithmic transformation, and report the exact sample used. Descriptive correlations should not be interpreted as causal effects without a credible identification strategy.

## Reuse and citation

Please cite the Zenodo record associated with the release version once its DOI is assigned, and cite this GitHub repository when sharing derived datasets or code. When possible, also cite the original statistical sources for each indicator. If you identify a coding, unit, or coverage issue, open an Issue with the affected variable, observation, and proposed correction.

The repository currently does not declare a blanket license. Public availability does not by itself grant permission to redistribute or commercially reuse every component; check upstream source terms and contact the authors when use exceeds applicable legal exceptions.

## Versioning

Each Zenodo DOI is tied to an immutable GitHub release. Use the version-specific DOI for published analyses and the concept DOI (if Zenodo provides one) when referring to the dataset family.
