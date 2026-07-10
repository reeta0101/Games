import json
import re
import sys
from datetime import datetime

import numpy as np
import pandas as pd

FILE = r"D:\Daily_Spend_Data_From_2023_Main (1).xlsx"


def parse_one(value):
    if pd.isna(value):
        return pd.NaT
    if isinstance(value, (pd.Timestamp, datetime)):
        return pd.Timestamp(value)
    text = str(value).strip()
    # ISO-like dates are unambiguous and should not be interpreted day-first.
    if re.match(r"^\d{4}[-/]\d{1,2}[-/]\d{1,2}", text):
        return pd.to_datetime(text, errors="coerce", yearfirst=True)
    return pd.to_datetime(text, errors="coerce", dayfirst=True)


def norm_string(s):
    return s.astype("string").fillna("(blank)").str.strip().replace("", "(blank)")


def table(frame, group, top=None, value="Amount"):
    out = (
        frame.groupby(group, dropna=False)
        .agg(Spend=(value, "sum"), Transactions=(value, "size"), Average=(value, "mean"), Median=(value, "median"))
        .sort_values("Spend", ascending=False)
        .reset_index()
    )
    out["Share"] = out["Spend"] / frame[value].sum()
    if top:
        out = out.head(top)
    return out


df = pd.read_excel(FILE, sheet_name="All Data")
df.columns = [str(c).strip() for c in df.columns]
brand_name_col = next((c for c in df.columns if c.startswith("Brand(Company)")), "Brand(Company)")
df = df.rename(columns={brand_name_col: "Brand/Description"})
df["ParsedDate"] = df["Date"].map(parse_one)
df["Amount"] = pd.to_numeric(df["Amount"], errors="coerce")

string_columns = [
    "Brand/Description", "Product Name", "Product Type", "Category", "Sub Category",
    "Payment Method", "Expense Type", "Merchant", "Day", "Month", "Quarter", "Unit"
]
for col in string_columns:
    if col in df.columns:
        df[col] = norm_string(df[col])

df["YearDerived"] = df["ParsedDate"].dt.year
df["MonthPeriod"] = df["ParsedDate"].dt.to_period("M")
df["MonthLabel"] = df["MonthPeriod"].astype(str)
df["Weekday"] = df["ParsedDate"].dt.day_name()
df["QuarterDerived"] = "Q" + df["ParsedDate"].dt.quarter.astype("Int64").astype(str)

valid = df[df["Amount"].notna() & df["ParsedDate"].notna()].copy()

all_amount = df[df["Amount"].notna()].copy()

monthly = (
    valid.groupby("MonthPeriod")
    .agg(Spend=("Amount", "sum"), Transactions=("Amount", "size"), Average=("Amount", "mean"), ActiveDays=("ParsedDate", "nunique"))
    .reset_index()
)
monthly["Month"] = monthly["MonthPeriod"].astype(str)
monthly["MoMGrowth"] = monthly["Spend"].pct_change()
monthly["Year"] = monthly["MonthPeriod"].dt.year
monthly["MonthNum"] = monthly["MonthPeriod"].dt.month

yearly = (
    valid.groupby("YearDerived")
    .agg(Spend=("Amount", "sum"), Transactions=("Amount", "size"), Average=("Amount", "mean"), ActiveDays=("ParsedDate", "nunique"))
    .reset_index()
    .rename(columns={"YearDerived": "Year"})
)
yearly["YoY"] = yearly["Spend"].pct_change()

quarterly = (
    valid.groupby(["YearDerived", valid["ParsedDate"].dt.quarter])
    .agg(Spend=("Amount", "sum"), Transactions=("Amount", "size"), Average=("Amount", "mean"))
    .reset_index()
    .rename(columns={"YearDerived": "Year", "ParsedDate": "QuarterNumber"})
)
quarterly["Quarter"] = "Q" + quarterly["QuarterNumber"].astype(int).astype(str)

weekday = table(valid, "Weekday")
weekday["WeekdayOrder"] = pd.Categorical(weekday["Weekday"], categories=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], ordered=True)
weekday = weekday.sort_values("WeekdayOrder").drop(columns="WeekdayOrder")

top_tx = valid.sort_values("Amount", ascending=False)[[
    "ParsedDate", "Amount", "Category", "Sub Category", "Brand/Description", "Product Name", "Merchant", "Expense Type", "Payment Method"
]].head(25).copy()
top_tx["ParsedDate"] = top_tx["ParsedDate"].dt.strftime("%Y-%m-%d")

latest_date = valid["ParsedDate"].max()
last_year_ytd_start = pd.Timestamp(year=latest_date.year - 1, month=1, day=1)
last_year_ytd_end = latest_date - pd.DateOffset(years=1)
current_ytd_start = pd.Timestamp(year=latest_date.year, month=1, day=1)
cur_ytd = valid[(valid.ParsedDate >= current_ytd_start) & (valid.ParsedDate <= latest_date)]
prev_ytd = valid[(valid.ParsedDate >= last_year_ytd_start) & (valid.ParsedDate <= last_year_ytd_end)]

def rounded_records(frame, columns=None, n=None):
    if columns is not None:
        frame = frame[columns]
    if n is not None:
        frame = frame.head(n)
    f = frame.copy()
    for c in f.select_dtypes(include=["number"]).columns:
        f[c] = f[c].round(2)
    return f.where(pd.notna(f), None).to_dict(orient="records")

result = {
    "data_quality": {
        "rows": int(len(df)),
        "valid_amount_and_date_rows": int(len(valid)),
        "total_amount_all_numeric": round(float(all_amount.Amount.sum()), 2),
        "total_spend_valid": round(float(valid.Amount.sum()), 2),
        "min_date": valid.ParsedDate.min().strftime("%Y-%m-%d"),
        "max_date": valid.ParsedDate.max().strftime("%Y-%m-%d"),
        "missing_dates": int(df.ParsedDate.isna().sum()),
        "missing_amounts": int(df.Amount.isna().sum()),
        "negative_or_zero_amount_rows": int((valid.Amount <= 0).sum()),
        "missing_by_dimension": {col: int((df[col] == "(blank)").sum()) for col in string_columns if col in df.columns},
    },
    "headline": {
        "transactions": int(len(valid)),
        "total_spend": round(float(valid.Amount.sum()), 2),
        "average_transaction": round(float(valid.Amount.mean()), 2),
        "median_transaction": round(float(valid.Amount.median()), 2),
        "daily_avg_full_span": round(float(valid.Amount.sum() / ((latest_date - valid.ParsedDate.min()).days + 1)), 2),
        "active_day_avg": round(float(valid.groupby("ParsedDate").Amount.sum().mean()), 2),
        "p90_transaction": round(float(valid.Amount.quantile(.90)), 2),
        "p95_transaction": round(float(valid.Amount.quantile(.95)), 2),
        "p99_transaction": round(float(valid.Amount.quantile(.99)), 2),
    },
    "yearly": rounded_records(yearly),
    "quarterly": rounded_records(quarterly),
    "monthly_highest": rounded_records(monthly.sort_values("Spend", ascending=False), ["Month", "Spend", "Transactions", "Average", "ActiveDays"], 15),
    "monthly_lowest": rounded_records(monthly.sort_values("Spend", ascending=True), ["Month", "Spend", "Transactions", "Average", "ActiveDays"], 15),
    "monthly_recent": rounded_records(monthly.sort_values("MonthPeriod", ascending=False), ["Month", "Spend", "Transactions", "Average", "ActiveDays", "MoMGrowth"], 18),
    "category": rounded_records(table(valid, "Category"), n=20),
    "subcategory": rounded_records(table(valid, "Sub Category"), n=30),
    "merchant": rounded_records(table(valid, "Merchant"), n=30),
    "brand_description": rounded_records(table(valid, "Brand/Description"), n=30),
    "product": rounded_records(table(valid, "Product Name"), n=30),
    "payment_method": rounded_records(table(valid, "Payment Method"), n=20),
    "expense_type": rounded_records(table(valid, "Expense Type"), n=20),
    "weekday": rounded_records(weekday),
    "top_transactions": rounded_records(top_tx),
    "ytd": {
        "current_period": f"{current_ytd_start:%Y-%m-%d} to {latest_date:%Y-%m-%d}",
        "previous_period": f"{last_year_ytd_start:%Y-%m-%d} to {last_year_ytd_end:%Y-%m-%d}",
        "current_spend": round(float(cur_ytd.Amount.sum()), 2),
        "previous_spend": round(float(prev_ytd.Amount.sum()), 2),
        "change": round(float(cur_ytd.Amount.sum() - prev_ytd.Amount.sum()), 2),
        "change_pct": round(float(cur_ytd.Amount.sum() / prev_ytd.Amount.sum() - 1), 4) if prev_ytd.Amount.sum() else None,
        "current_transactions": int(len(cur_ytd)),
        "previous_transactions": int(len(prev_ytd)),
    },
}

# Additional dashboard-focused cuts, with clear definitions so large, irregular
# education/electronics/investment items do not obscure recurring cash outflows.
major_commitment_categories = ["Education", "Electronics", "Investment"]
core = valid[~valid["Category"].isin(major_commitment_categories)].copy()

category_by_year = (
    valid.pivot_table(index="Category", columns="YearDerived", values="Amount", aggfunc="sum", fill_value=0)
    .assign(Total=lambda x: x.sum(axis=1))
    .sort_values("Total", ascending=False)
    .reset_index()
)
category_by_year.columns = [str(c) for c in category_by_year.columns]

monthly_core = (
    core.groupby("MonthPeriod")
    .agg(Spend=("Amount", "sum"), Transactions=("Amount", "size"), ActiveDays=("ParsedDate", "nunique"))
    .reset_index()
)
monthly_core["Month"] = monthly_core["MonthPeriod"].astype(str)
monthly_core["Average"] = monthly_core["Spend"] / monthly_core["Transactions"]

weekday_core = table(core, "Weekday")
weekday_core["WeekdayOrder"] = pd.Categorical(weekday_core["Weekday"], categories=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], ordered=True)
weekday_core = weekday_core.sort_values("WeekdayOrder").drop(columns="WeekdayOrder")

def period_summary(frame):
    return {
        "spend": round(float(frame.Amount.sum()), 2),
        "transactions": int(len(frame)),
        "average": round(float(frame.Amount.mean()), 2) if len(frame) else 0,
        "by_category": rounded_records(table(frame, "Category"), n=20),
    }

cur_core = cur_ytd[~cur_ytd["Category"].isin(major_commitment_categories)]
prev_core = prev_ytd[~prev_ytd["Category"].isin(major_commitment_categories)]

recurring = (
    valid.groupby(["Product Name", "Category", "Sub Category"], dropna=False)
    .agg(Spend=("Amount", "sum"), Transactions=("Amount", "size"), Average=("Amount", "mean"), Median=("Amount", "median"), ActiveMonths=("MonthPeriod", "nunique"), FirstDate=("ParsedDate", "min"), LastDate=("ParsedDate", "max"))
    .reset_index()
)
recurring = recurring[recurring["Transactions"] >= 5].sort_values(["Spend", "Transactions"], ascending=False)
recurring["FirstDate"] = recurring["FirstDate"].dt.strftime("%Y-%m-%d")
recurring["LastDate"] = recurring["LastDate"].dt.strftime("%Y-%m-%d")

top_n = valid.sort_values("Amount", ascending=False).reset_index(drop=True)
top_concentration = []
for n in [1, 5, 10, 20, 50]:
    amount = top_n.head(n).Amount.sum()
    top_concentration.append({"TopN": n, "Spend": round(float(amount), 2), "Share": round(float(amount / valid.Amount.sum()), 4)})

top_transaction_counts = []
for threshold in [100, 500, 1000, 3000, 10000, 40000]:
    sub = valid[valid.Amount >= threshold]
    top_transaction_counts.append({"AtLeast": threshold, "Transactions": int(len(sub)), "Spend": round(float(sub.Amount.sum()), 2), "Share": round(float(sub.Amount.sum()/valid.Amount.sum()), 4)})

date_checks = {
    "weekday_mismatches": int((norm_string(df["Day"]) != df["ParsedDate"].dt.day_name().astype("string")).sum()),
    "month_mismatches": int((norm_string(df["Month"]) != df["ParsedDate"].dt.month_name().astype("string")).sum()),
    "quarter_mismatches": int((norm_string(df["Quarter"]) != ("Q" + df["ParsedDate"].dt.quarter.astype("Int64").astype("string"))).sum()),
    "year_mismatches": int((pd.to_numeric(df["Year"], errors="coerce").astype("Int64") != df["ParsedDate"].dt.year.astype("Int64")).sum()),
}

result.update({
    "category_by_year": rounded_records(category_by_year),
    "monthly_excluding_education_electronics_investment": rounded_records(monthly_core.sort_values("Spend", ascending=False), ["Month", "Spend", "Transactions", "Average", "ActiveDays"], 20),
    "monthly_excluding_education_electronics_investment_recent": rounded_records(monthly_core.sort_values("MonthPeriod", ascending=False), ["Month", "Spend", "Transactions", "Average", "ActiveDays"], 18),
    "weekday_excluding_education_electronics_investment": rounded_records(weekday_core),
    "ytd_excluding_education_electronics_investment": {
        "current_period": f"{current_ytd_start:%Y-%m-%d} to {latest_date:%Y-%m-%d}",
        "previous_period": f"{last_year_ytd_start:%Y-%m-%d} to {last_year_ytd_end:%Y-%m-%d}",
        "current": period_summary(cur_core),
        "previous": period_summary(prev_core),
        "change": round(float(cur_core.Amount.sum() - prev_core.Amount.sum()), 2),
        "change_pct": round(float(cur_core.Amount.sum() / prev_core.Amount.sum() - 1), 4) if prev_core.Amount.sum() else None,
        "definition": "Excludes Education, Electronics, and Investment categories",
    },
    "recurring_candidates": rounded_records(recurring, n=50),
    "outlier_concentration": {"top_n": top_concentration, "thresholds": top_transaction_counts},
    "date_consistency": date_checks,
})

selected = result.get(sys.argv[1]) if len(sys.argv) > 1 else result
print(json.dumps(selected, ensure_ascii=False, indent=2, default=str))
