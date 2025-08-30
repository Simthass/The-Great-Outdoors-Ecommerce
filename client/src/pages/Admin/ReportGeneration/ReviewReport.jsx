// src/pages/Admin/ReportGeneration/ReviewReport.jsx
import React, { useState } from "react";
// If you already have a helper like in ReviewsList, you can import it:
// import { listAdminReviews } from "../../../lib/ReviewsApi"; // adjust path

export default function ReviewReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSummary, setLastSummary] = useState(null);

  // ---- Fetch all reviews (admin) ----
  async function fetchAllReviews() {
    try {
      // Prefer your existing API helper if available:
      // const rows = await listAdminReviews();
      // return Array.isArray(rows) ? rows : [];

      const token = localStorage.getItem("token");
      const res = await fetch("/api/reviews/admin?limit=99999", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      // Support either array or {success, data} formats
      if (Array.isArray(data)) return data;
      if (data?.success && Array.isArray(data.data)) return data.data;
      if (data?.success && Array.isArray(data.reviews)) return data.reviews;
      return [];
    } catch (e) {
      console.error("ReviewReport: fetch error", e);
      return [];
    }
  }

  // ---- Crunch numbers for the report ----
  function buildStats(rows) {
    const total = rows.length;

    const byStatus = rows.reduce(
      (acc, r) => {
        const s = (r.status || "APPROVED").toUpperCase();
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      { APPROVED: 0, PENDING: 0, REJECTED: 0 }
    );

    const byRating = rows.reduce(
      (acc, r) => {
        const rt = Math.max(1, Math.min(5, Number(r.rating || 0)));
        if (!Number.isFinite(rt)) return acc;
        acc[rt] = (acc[rt] || 0) + 1;
        return acc;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    );

    const avgRating =
      total === 0
        ? 0
        : (
            rows.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / total
          ).toFixed(1);

    // Top products by volume + avg rating
    const productMap = new Map();
    rows.forEach((r) => {
      const pid = r.productId || "Unknown";
      const rating = Number(r.rating) || 0;
      if (!productMap.has(pid)) productMap.set(pid, { count: 0, sum: 0 });
      const rec = productMap.get(pid);
      rec.count += 1;
      rec.sum += rating;
    });
    const topProducts = [...productMap.entries()]
      .map(([productId, { count, sum }]) => ({
        productId,
        count,
        avg: count ? (sum / count).toFixed(2) : "0.00",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Trend: last 6 months by dateAdded
    const now = new Date();
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1, 0, 0, 0, 0);
      const count = rows.filter((r) => {
        const d = r.dateAdded ? new Date(r.dateAdded) : null;
        return d && d >= start && d < end;
      }).length;
      trend.push({ month: months[start.getMonth()], count });
    }

    return {
      total,
      avgRating: Number(avgRating),
      byStatus,
      byRating,
      topProducts,
      trend,
    };
  }

  // ---- Build the HTML for preview/print ----
  function buildHTML(stats) {
    const percent = (num, den) =>
      den ? ((num / den) * 100).toFixed(1) : "0.0";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Review Analytics Report</title>
  <style>
    :root {
      --brand:#22c55e;
      --dark:#1f2937;
      --muted:#6b7280;
      --border:#e5e7eb;
      --bg:#f9fafb;
    }
    * { box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; margin:0; padding:24px; color:#333; background:#fff; }
    .toolbar {
      position: sticky; top:0; background:#fff; padding:10px 0 16px; z-index: 10;
      border-bottom: 1px solid var(--border); margin-bottom: 18px;
    }
    .btn {
      display:inline-block; padding:10px 14px; border-radius:8px; text-decoration:none; border:1px solid var(--border);
      font-weight:600; margin-right:8px; color:#fff; background: var(--brand);
    }
    .btn.secondary { background:#fff; color:#111; }
    .header { display:flex; justify-content:space-between; align-items:center; padding-bottom:18px; border-bottom:3px solid var(--brand); margin-bottom:20px; }
    .logo { width:50px; height:50px; background:var(--brand); color:#fff; display:flex; align-items:center; justify-content:center; border-radius:10px; font-weight:800; font-size:20px; margin-right:12px; }
    .logo-row { display:flex; align-items:center; }
    .title { background: linear-gradient(135deg, var(--brand), #16a34a); color:#fff; padding:18px; border-radius:12px; margin:20px 0 24px; text-align:center; }
    .grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; }
    .card { background:#fff; border:1px solid var(--border); border-radius:10px; padding:16px; }
    .card h3 { margin:0; font-size:30px; color:#111; }
    .card p { margin:6px 0 0; color:var(--muted); }
    .card.blue { border-left:4px solid #3b82f6; }
    .card.green { border-left:4px solid #22c55e; }
    .card.amber { border-left:4px solid #f59e0b; }
    .card.red { border-left:4px solid #ef4444; }

    .section { margin-top:26px; }
    .section h2 { margin:0 0 12px; padding-bottom:8px; border-bottom:2px solid var(--border); color:var(--dark); font-size:20px; }
    .two { display:grid; grid-template-columns:1fr 1fr; gap:20px; }

    table { width:100%; border-collapse:collapse; background:#fff; border-radius:8px; overflow:hidden; }
    th, td { padding:12px 14px; border-bottom:1px solid var(--border); text-align:left; font-size:14px; }
    th { background:#f3f4f6; color:#374151; font-weight:600; }

    .badge { display:inline-block; padding:4px 8px; border-radius:999px; font-size:12px; font-weight:600; }
    .ok { color:#16a34a; }
    .warn { color:#ef4444; }

    .placeholder {
      background:#f9fafb; border:1px dashed #d1d5db; border-radius:8px; padding:32px; text-align:center; color:#6b7280; min-height:160px;
      display:flex; align-items:center; justify-content:center;
    }

    .footer { margin-top:28px; padding-top:14px; border-top:1px solid var(--border); color:var(--muted); font-size:12px; text-align:center; }

    @media print {
      .toolbar { display:none; }
      body { padding:12mm; }
      .grid { grid-template-columns: repeat(2, 1fr); }
      .two { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <a class="btn" href="#" onclick="window.print();return false;">Print / Save as PDF</a>
    <a class="btn secondary" href="#" onclick="window.close();return false;">Close</a>
  </div>

  <div class="header">
    <div class="logo-row">
      <div class="logo">⭐</div>
      <div>
        <div style="font-size:22px; font-weight:800; color:#111;">The Great Outdoors</div>
        <div style="color:#6b7280;">Review Analytics</div>
      </div>
    </div>
    <div style="text-align:right; color:#6b7280;">
      <div><strong>Report Date:</strong> ${new Date().toLocaleDateString("en-US", {year:"numeric", month:"long", day:"numeric"})}</div>
      <div><strong>Report ID:</strong> RR-${Date.now()}</div>
    </div>
  </div>

  <div class="title">
    <div style="font-size:24px; font-weight:700;">Review Analytics Report</div>
    <div style="opacity:0.9; margin-top:6px;">Quality, volume and trend of user reviews</div>
  </div>

  <div class="grid">
    <div class="card blue">
      <h3>${stats.total.toLocaleString()}</h3>
      <p>Total Reviews</p>
    </div>
    <div class="card green">
      <h3>${stats.avgRating.toFixed(1)}</h3>
      <p>Average Rating</p>
    </div>
    <div class="card amber">
      <h3>${(stats.byStatus.APPROVED || 0).toLocaleString()}</h3>
      <p>Approved (${percent(stats.byStatus.APPROVED || 0, stats.total)}%)</p>
    </div>
    <div class="card red">
      <h3>${(stats.byStatus.PENDING || 0).toLocaleString()}</h3>
      <p>Pending (${percent(stats.byStatus.PENDING || 0, stats.total)}%)</p>
    </div>
  </div>

  <div class="section">
    <h2>Ratings Distribution</h2>
    <table>
      <tr>
        <th>Stars</th>
        <th>Count</th>
        <th>Share</th>
      </tr>
      ${[5,4,3,2,1].map(stars => `
        <tr>
          <td>${stars} ★</td>
          <td>${(stats.byRating[stars] || 0).toLocaleString()}</td>
          <td>${percent(stats.byRating[stars] || 0, stats.total)}%</td>
        </tr>
      `).join("")}
    </table>
  </div>

  <div class="section">
    <h2>Top Products (by reviews)</h2>
    <div class="two">
      <div>
        <table>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Reviews</th>
            <th>Avg Rating</th>
          </tr>
          ${stats.topProducts.map((p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${p.productId}</td>
              <td>${p.count}</td>
              <td>${p.avg}</td>
            </tr>
          `).join("")}
        </table>
      </div>
      <div class="placeholder">
        <div>
          <strong>Chart Placeholder</strong><br/>
          <small>Bar chart of top products would be here in production</small>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Review Trend (Last 6 Months)</h2>
    <table>
      <tr>
        <th>Month</th>
        <th>Reviews</th>
        <th>MoM</th>
        <th>Trend</th>
      </tr>
      ${stats.trend.map((m, idx) => {
        const prev = idx > 0 ? stats.trend[idx - 1].count : m.count;
        const mom = prev ? (((m.count - prev) / prev) * 100).toFixed(1) : "0.0";
        const cls = parseFloat(mom) >= 0 ? "ok" : "warn";
        const arrow = parseFloat(mom) >= 0 ? "📈" : "📉";
        return `
          <tr>
            <td>${m.month}</td>
            <td>${m.count}</td>
            <td class="${cls}">${mom > 0 ? "+" : ""}${mom}%</td>
            <td>${arrow}</td>
          </tr>
        `;
      }).join("")}
    </table>
  </div>

  <div class="section">
    <h2>Summary</h2>
    <div class="card" style="background:#f0fdf4; border-color:#bbf7d0;">
      <p><strong>Quality:</strong> Average rating is <strong>${stats.avgRating.toFixed(1)}</strong>. ${stats.avgRating >= 4 ? "Great!" : stats.avgRating >= 3 ? "Acceptable." : "Needs improvement."}</p>
      <p><strong>Moderation:</strong> ${stats.byStatus.APPROVED || 0} approved, ${stats.byStatus.PENDING || 0} pending, ${stats.byStatus.REJECTED || 0} rejected.</p>
      <p><strong>Focus:</strong> The top product by review volume is <strong>${stats.topProducts[0]?.productId || "N/A"}</strong> with <strong>${stats.topProducts[0]?.count || 0}</strong> reviews (avg ${stats.topProducts[0]?.avg || "0.00"}).</p>
    </div>
  </div>

  <div class="footer">
    Generated ${new Date().toLocaleString()} &middot; Confidential – Internal Use Only
  </div>
</body>
</html>`;
  }

  // ---- Open a new tab with preview (no auto-print) ----
  function openPreview(htmlString) {
    const w = window.open("", "_blank");
    w.document.write(htmlString);
    w.document.close();
  }

  // ---- Open and immediately trigger print (optional) ----
  function openAndPrint(htmlString) {
    const w = window.open("", "_blank");
    w.document.write(htmlString);
    w.document.close();
    setTimeout(() => w.print(), 600);
  }

  async function handlePreview() {
    setIsGenerating(true);
    try {
      const rows = await fetchAllReviews();
      const stats = buildStats(rows);
      setLastSummary(stats);
      const html = buildHTML(stats);
      openPreview(html); // preview first, no auto-print
    } catch (e) {
      console.error(e);
      alert("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handlePrint() {
    setIsGenerating(true);
    try {
      const rows = await fetchAllReviews();
      const stats = buildStats(rows);
      setLastSummary(stats);
      const html = buildHTML(stats);
      openAndPrint(html); // opens + triggers Print dialog
    } catch (e) {
      console.error(e);
      alert("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 m-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Review Analytics Report
          </h3>
          <p className="text-sm text-gray-600">
            Preview the report before downloading as PDF.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {isGenerating ? "Preparing…" : "Preview"}
          </button>
          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {isGenerating ? "Preparing…" : "Print / Save PDF"}
          </button>
        </div>
      </div>

      {lastSummary && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 rounded-lg border">
            <div className="text-gray-600">Total Reviews</div>
            <div className="text-2xl font-bold">{lastSummary.total}</div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-gray-600">Average Rating</div>
            <div className="text-2xl font-bold">
              {lastSummary.avgRating.toFixed(1)}
            </div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-gray-600">Approved</div>
            <div className="text-2xl font-bold">
              {lastSummary.byStatus.APPROVED || 0}
            </div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-gray-600">Pending</div>
            <div className="text-2xl font-bold">
              {lastSummary.byStatus.PENDING || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
