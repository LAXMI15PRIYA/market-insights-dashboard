# 📈 Stock Price Analyzer

A modern market intelligence dashboard for analyzing historical stock prices, trends, and technical indicators — built for both global and Indian markets, powered by real-time Yahoo Finance data.

---

## 🚀 Overview

**Stock Price Analyzer** lets you search any stock symbol and instantly explore its historical performance through interactive charts, moving averages, and OHLC (Open-High-Low-Close) data — all in a clean, responsive dashboard.

Whether you're tracking **AAPL**, **TSLA**, **INFY.NS**, or **RELIANCE.NS**, the tool gives you a quick, visual snapshot of market trends over any custom date range.

---

## ✨ Features

- 🔍 **Symbol Search** — Look up any stock across global and Indian markets (NSE-listed stocks supported via `.NS` suffix)
- 📊 **Interactive OHLC Charts** — Visualize Open, High, Low, and Close prices over time
- 📉 **Moving Averages** — Spot short-term and long-term trends with built-in technical indicators
- 🗓️ **Custom Date Range** — Analyze any historical period, from days to years
- 🌏 **Global + Indian Market Support** — One tool for both NYSE/NASDAQ and NSE stocks
- ⚡ **Live Data via Yahoo Finance** — Real-time and historical price data
- 🎨 **Clean, Responsive UI** — Dark-themed dashboard built for clarity

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Data Source | Yahoo Finance API |
| Build Platform | [Lovable](https://lovable.dev) |
| Package Manager | Bun |

---

## 🖥️ Live Demo

🔗 **[Try the live app →](https://id-preview--4552a1e1-334b-4936-9cd4-bb87a8f6003a.lovable.app)**

---

## 📓 Notebook Analysis

This repo also includes [`stock_price_analyser.ipynb`](./stock_price_analyser.ipynb) — a companion Jupyter notebook covering exploratory stock price analysis using Python (`pandas`, `matplotlib`, `yfinance`).

The notebook pulls historical price data and computes **7-day** and **30-day moving averages** to visualize short-term vs long-term trend behavior.

### Sample Output — RELIANCE.NS Price Trend
![Stock Analysis Output](chart-output.png)

*Daily closing price plotted against 7-day and 30-day moving averages, showing trend reversals and momentum shifts over a 12-month window.*

---

## ⚙️ Getting Started

Clone the repo and run the dashboard locally:

```bash
git clone https://github.com/LAXMI15PRIYA/market-insights-dashboard.git
cd market-insights-dashboard
bun install
bun run dev
```

To run the notebook analysis:

```bash
pip install pandas matplotlib yfinance
jupyter notebook stock_price_analyser.ipynb
```

---

## 📌 Roadmap

- [ ] Add RSI and MACD indicators
- [ ] Portfolio comparison view
- [ ] Export chart data as CSV
- [ ] Add candlestick chart view

---

## 👩‍💻 Author

**Lakshmi**
Aspiring AI Engineer / Data Analyst | M.Tech AI & Data Science, SRMIST

- GitHub: [@LAXMI15PRIYA](https://github.com/LAXMI15PRIYA)

---

⭐ *If you found this project useful, consider giving it a star!*


