# Helm Analytics: Current Capabilities & Features

**Version:** MVP + Active Defense & AI Layer
**Date:** January 5, 2026

## 🚀 Overview
Helm Analytics is a privacy-first, self-hostable web analytics and security platform. It goes beyond passive tracking by actively defending websites against bots and providing AI-powered insights.

## 📊 Core Analytics (The "What")
*   **Privacy-First Tracking:** No cookies, GDPR compliant. Tracks page views, unique visitors, and sessions without invasive fingerprinting.
*   **Real-Time Dashboard:**
    *   **Traffic Stats:** Total Views, Unique Visitors, Bounce Rate, Average Visit Time.
    *   **Breakdowns:** Top Pages, Referrers, Countries, Browsers, Operating Systems.
    *   **Visualizations:** Time-series charts for traffic trends.
*   **Web Vitals:** Monitors Core Web Vitals (LCP, CLS, FID) to help optimize site performance.

## 🛡️ Active Defense (The "Shield")
*   **Bot Detection & Trust Score:**
    *   Every visitor is assigned a **Trust Score (0-100)** based on their User-Agent and IP ASN (Data Center detection).
    *   **Traffic Quality Score:** A unique metric showing the percentage of "human" traffic vs. bots.
*   **Firewall:**
    *   **Manual Blocking:** Block traffic by **IP Address**, **Country**, or **ASN** (Data Center).
    *   **Shield Mode (Panic Button):** A toggle that instantly blocks all low-trust traffic (Trust Score < 80) during an attack or viral spike.
    *   **Honey Pot:** A hidden "trap" link. If a bot follows it, their IP is **automatically and permanently banned**.

## 🧠 Intelligence Layer (The "Why")
*   **AI Insights (Gemini Powered):**
    *   **Smart Summary:** Automatically analyzes 30 days of data to highlight anomalies, trends, and actionable recommendations (e.g., "Mobile bounce rate spiked 20%").
    *   **"Ask Sentinel":** A conversational chat interface where users can ask questions like *"Why is my traffic down today?"* and get data-backed answers in plain English.

## 🎥 Experience & Optimization
*   **Session Replay:** Record and replay user sessions to see exactly how they interact with your site (using `rrweb`).
*   **Heatmaps:** Visualize click density on your pages to understand user engagement.
*   **Funnels:** Define and track multi-step conversion flows to identify drop-off points.

## 💻 Tech Stack
*   **Backend:** Go (Golang) for high-performance event ingestion.
*   **Database:** ClickHouse (Analytics Data) + PostgreSQL (User/Site Data).
*   **Frontend:** React (Vite) with Tailwind CSS and Recharts.
*   **AI:** Google Gemini 1.5 Flash API.
*   **Infrastructure:** Docker & Docker Compose for easy self-hosting.
