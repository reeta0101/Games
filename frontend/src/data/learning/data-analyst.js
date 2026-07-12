// Data Analyst Learning Path
export const dataAnalystPath = {
    id: 'data-analyst',
    title: 'Data Analyst',
    subtitle: 'Excel, Python, SQL, Power BI',
    icon: '📊',
    color: '#217346',
    description: 'Analyze data, create visualizations, and derive insights using Excel, Python, SQL, and Power BI.',
    skills: ['Excel', 'Python', 'SQL', 'Power BI', 'Data Visualization', 'Statistics'],
    modules: [
        {
            id: 'excel-analytics',
            title: 'Excel for Data Analysis',
            icon: '📗',
            lessons: [
                {
                    id: 'excel-formulas',
                    title: 'Essential Excel Formulas',
                    duration: '25 min',
                    content: `
## Excel Formulas for Data Analysis

### Lookup Functions

#### VLOOKUP
\`\`\`
=VLOOKUP(lookup_value, table_array, col_index, [range_lookup])

Example:
=VLOOKUP(A2, Products!A:C, 3, FALSE)
\`\`\`

#### XLOOKUP (Modern alternative)
\`\`\`
=XLOOKUP(lookup_value, lookup_array, return_array)

Example:
=XLOOKUP(A2, Products[ID], Products[Price])
\`\`\`

#### INDEX-MATCH (Most flexible)
\`\`\`
=INDEX(return_range, MATCH(lookup_value, lookup_range, 0))

Example:
=INDEX(B:B, MATCH(A2, A:A, 0))
\`\`\`

### Statistical Functions
| Function | Description | Example |
|----------|-------------|---------|
| AVERAGE | Mean of values | \`=AVERAGE(A2:A100)\` |
| MEDIAN | Middle value | \`=MEDIAN(A2:A100)\` |
| STDEV | Standard deviation | \`=STDEV.S(A2:A100)\` |
| COUNTIF | Count with condition | \`=COUNTIF(A:A, ">100")\` |
| SUMIF | Sum with condition | \`=SUMIF(A:A, "Sales", B:B)\` |

### Conditional Logic
\`\`\`
=IF(A2>100, "High", "Low")

=IFS(A2>=90, "A", A2>=80, "B", A2>=70, "C", TRUE, "F")

=SWITCH(A2, 1, "One", 2, "Two", "Other")
\`\`\`

### Text Functions
\`\`\`
=LEFT(A2, 3)        // First 3 characters
=RIGHT(A2, 4)       // Last 4 characters
=MID(A2, 2, 5)      // 5 chars starting at pos 2
=TRIM(A2)           // Remove extra spaces
=CONCATENATE(A2, " ", B2)  // Join text
\`\`\`
          `
                },
                {
                    id: 'pivot-tables',
                    title: 'Pivot Tables & Charts',
                    duration: '30 min',
                    content: `
## Pivot Tables

Pivot tables summarize and analyze large datasets quickly.

### Creating a Pivot Table
1. Select your data range
2. Insert → PivotTable
3. Choose where to place it
4. Drag fields to Rows, Columns, Values, Filters

### Pivot Table Layout
\`\`\`
               Q1    Q2    Q3    Q4   │ Total
─────────────────────────────────────┼───────
North Region  150   180   200   175  │  705
South Region  120   140   160   150  │  570
East Region   200   220   240   230  │  890
─────────────────────────────────────┼───────
Total         470   540   600   555  │ 2165
\`\`\`

### Value Field Settings
- Sum, Count, Average, Max, Min
- Show as: % of row, % of column, % of grand total
- Running total, Rank

### Pivot Charts
- Create directly from Pivot Table
- Auto-updates when data changes
- Filter with slicers for interactivity

### Best Practices
- Keep source data in tabular format
- No merged cells in source data
- Use column headers
- Refresh pivot when source data changes
          `
                }
            ]
        },
        {
            id: 'sql-analytics',
            title: 'SQL for Data Analysis',
            icon: '🗄️',
            lessons: [
                {
                    id: 'sql-basics',
                    title: 'SQL Fundamentals',
                    duration: '30 min',
                    content: `
## SQL for Data Analysis

### SELECT Queries
\`\`\`sql
-- Basic SELECT
SELECT name, email, salary
FROM employees
WHERE department = 'Engineering'
ORDER BY salary DESC;

-- With aliases
SELECT
    first_name AS "First Name",
    last_name AS "Last Name",
    salary * 12 AS "Annual Salary"
FROM employees;
\`\`\`

### Filtering Data
\`\`\`sql
-- Multiple conditions
SELECT * FROM orders
WHERE status = 'Completed'
  AND order_date >= '2024-01-01'
  AND total_amount > 100;

-- IN, BETWEEN, LIKE
SELECT * FROM products
WHERE category IN ('Electronics', 'Books')
  AND price BETWEEN 10 AND 100
  AND name LIKE '%Phone%';
\`\`\`

### Aggregations
\`\`\`sql
SELECT
    department,
    COUNT(*) AS employee_count,
    AVG(salary) AS avg_salary,
    SUM(salary) AS total_salary,
    MAX(salary) AS max_salary
FROM employees
GROUP BY department
HAVING COUNT(*) > 5
ORDER BY avg_salary DESC;
\`\`\`

### Joins
\`\`\`sql
-- INNER JOIN
SELECT o.order_id, c.name, o.total
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id;

-- LEFT JOIN (keep all from left table)
SELECT p.name, COALESCE(SUM(s.quantity), 0) AS sold
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
GROUP BY p.name;
\`\`\`
          `
                },
                {
                    id: 'sql-advanced',
                    title: 'Advanced SQL Analytics',
                    duration: '35 min',
                    content: `
## Advanced SQL Techniques

### Window Functions
\`\`\`sql
-- Running total
SELECT
    order_date,
    amount,
    SUM(amount) OVER (ORDER BY order_date) AS running_total
FROM orders;

-- Rank within groups
SELECT
    department,
    name,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank
FROM employees;

-- Moving average
SELECT
    order_date,
    amount,
    AVG(amount) OVER (
        ORDER BY order_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_avg_7days
FROM orders;
\`\`\`

### CTEs (Common Table Expressions)
\`\`\`sql
WITH monthly_sales AS (
    SELECT
        DATE_TRUNC('month', order_date) AS month,
        SUM(amount) AS total_sales
    FROM orders
    GROUP BY DATE_TRUNC('month', order_date)
)
SELECT
    month,
    total_sales,
    LAG(total_sales) OVER (ORDER BY month) AS prev_month,
    (total_sales - LAG(total_sales) OVER (ORDER BY month)) /
        LAG(total_sales) OVER (ORDER BY month) * 100 AS growth_pct
FROM monthly_sales;
\`\`\`

### Subqueries
\`\`\`sql
-- Find above-average salaries
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Correlated subquery
SELECT name, department, salary
FROM employees e1
WHERE salary = (
    SELECT MAX(salary)
    FROM employees e2
    WHERE e2.department = e1.department
);
\`\`\`
          `
                }
            ]
        },
        {
            id: 'python-analytics',
            title: 'Python for Data Analysis',
            icon: '🐍',
            lessons: [
                {
                    id: 'pandas-basics',
                    title: 'Pandas Fundamentals',
                    duration: '35 min',
                    content: `
## Pandas for Data Analysis

### Loading Data
\`\`\`python
import pandas as pd

# Read CSV
df = pd.read_csv('data.csv')

# Read Excel
df = pd.read_excel('data.xlsx', sheet_name='Sheet1')

# Read SQL
df = pd.read_sql('SELECT * FROM table', connection)
\`\`\`

### Exploring Data
\`\`\`python
df.head()           # First 5 rows
df.tail(10)         # Last 10 rows
df.shape            # (rows, columns)
df.info()           # Data types, non-null counts
df.describe()       # Statistics for numeric columns
df.columns          # Column names
df.dtypes           # Data types
\`\`\`

### Selecting Data
\`\`\`python
# Select columns
df['name']
df[['name', 'age', 'salary']]

# Select rows
df[df['age'] > 30]
df[(df['age'] > 30) & (df['department'] == 'Sales')]

# loc (label-based) and iloc (integer-based)
df.loc[0:5, ['name', 'age']]
df.iloc[0:5, 0:3]
\`\`\`

### Data Cleaning
\`\`\`python
# Handle missing values
df.isnull().sum()
df.dropna()
df.fillna(0)
df['age'].fillna(df['age'].mean())

# Remove duplicates
df.drop_duplicates()

# Rename columns
df.rename(columns={'old_name': 'new_name'})

# Change data types
df['date'] = pd.to_datetime(df['date'])
df['price'] = df['price'].astype(float)
\`\`\`

### Aggregations
\`\`\`python
# Group by
df.groupby('department')['salary'].mean()

# Multiple aggregations
df.groupby('department').agg({
    'salary': ['mean', 'sum', 'count'],
    'age': 'mean'
})

# Pivot table
pd.pivot_table(df, values='sales', index='region',
               columns='quarter', aggfunc='sum')
\`\`\`
          `
                }
            ]
        },
        {
            id: 'powerbi',
            title: 'Power BI',
            icon: '📈',
            lessons: [
                {
                    id: 'powerbi-intro',
                    title: 'Power BI Essentials',
                    duration: '30 min',
                    content: `
## Power BI for Data Visualization

### Power BI Components
- **Power BI Desktop**: Create reports
- **Power BI Service**: Share and collaborate
- **Power BI Mobile**: View on mobile devices

### Loading Data
1. Get Data → Select source (Excel, SQL, Web, etc.)
2. Transform data in Power Query Editor
3. Load to data model

### DAX Formulas
\`\`\`
// Calculated column
Full Name = [First Name] & " " & [Last Name]

// Measure
Total Sales = SUM(Sales[Amount])

// Time intelligence
Sales YTD = TOTALYTD(SUM(Sales[Amount]), Dates[Date])

// Previous period
Sales LY = CALCULATE(
    SUM(Sales[Amount]),
    SAMEPERIODLASTYEAR(Dates[Date])
)

// Growth %
Growth % = DIVIDE(
    [Total Sales] - [Sales LY],
    [Sales LY]
)
\`\`\`

### Best Visualizations
| Data Type | Best Visual |
|-----------|-------------|
| Trends over time | Line chart |
| Part-to-whole | Pie/Donut chart |
| Comparison | Bar/Column chart |
| Geographic | Map |
| KPIs | Card, Gauge |
| Relationships | Scatter plot |

### Dashboard Best Practices
- Keep it simple (5-7 visuals max)
- Use consistent colors
- Add slicers for interactivity
- Include clear titles
- Mobile-friendly layout
          `
                }
            ]
        }
    ]
};

export default dataAnalystPath;
