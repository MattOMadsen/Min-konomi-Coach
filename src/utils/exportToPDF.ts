import type { Transaction } from '../types';
import { categorizeTransaction } from './categorize';

export const exportToPDF = (transactions: Transaction[]) => {
  if (transactions.length === 0) return;

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const balance = totalIncome - totalExpenses;

  // Top 5 kategorier
  const categoryMap = new Map<string, number>();
  transactions.forEach(t => {
    if (t.amount >= 0) return;
    const cat = categorizeTransaction(t.description);
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount));
  });

  const topCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const html = `
    <html>
      <head>
        <title>Min Økonomi Rapport</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;display=swap');
          body { font-family: 'Inter', system-ui, sans-serif; padding: 50px; line-height: 1.6; color: #1e2937; }
          h1 { color: #10b981; font-size: 32px; margin-bottom: 8px; }
          .header { margin-bottom: 50px; border-bottom: 3px solid #10b981; padding-bottom: 20px; }
          .summary { background: #f8fafc; padding: 30px; border-radius: 16px; margin-bottom: 50px; display: flex; gap: 40px; }
          .summary-item { flex: 1; }
          .summary-item h3 { font-size: 14px; color: #64748b; margin-bottom: 8px; }
          .summary-item .value { font-size: 28px; font-weight: 700; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th, td { padding: 16px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f1f5f9; font-weight: 600; color: #475569; }
          .top-categories { background: #f8fafc; padding: 25px; border-radius: 16px; margin: 40px 0; }
          .category-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
          .category-row:last-child { border-bottom: none; }
          .footer { margin-top: 60px; font-size: 13px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Min Økonomi Coach</h1>
          <p style="color: #64748b; margin: 0; font-size: 16px;">
            Rapport genereret ${new Date().toLocaleDateString('da-DK', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}
          </p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <h3>Indtægter</h3>
            <div class="value positive">+${totalIncome.toLocaleString('da-DK')} kr</div>
          </div>
          <div class="summary-item">
            <h3>Udgifter</h3>
            <div class="value negative">-${totalExpenses.toLocaleString('da-DK')} kr</div>
          </div>
          <div class="summary-item">
            <h3>Saldo</h3>
            <div class="value" style="color: ${balance >= 0 ? '#10b981' : '#ef4444'}">
              ${balance.toLocaleString('da-DK')} kr
            </div>
          </div>
        </div>

        <h2 style="font-size: 22px; margin-bottom: 20px;">Top 5 udgiftskategorier</h2>
        <div class="top-categories">
          ${topCategories.length > 0 ? topCategories.map(([cat, amount]) => `
            <div class="category-row">
              <span style="font-weight: 600;">${cat}</span>
              <span style="font-weight: 700; color: #ef4444;">-${amount.toLocaleString('da-DK')} kr</span>
            </div>
          `).join('') : '<p>Ingen udgifter fundet.</p>'}
        </div>

        <h2 style="font-size: 22px; margin: 40px 0 20px;">Alle transaktioner (${transactions.length} stk.)</h2>
        <table>
          <thead>
            <tr>
              <th>Dato</th>
              <th>Beskrivelse</th>
              <th style="text-align: right">Beløb</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td style="text-align: right; font-weight: 600; color: ${t.amount >= 0 ? '#10b981' : '#ef4444'}">
                  ${t.amount >= 0 ? '+' : ''}${t.amount.toLocaleString('da-DK')} kr
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Genereret med Min Økonomi Coach • Tak for at bruge appen!
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 650);
};