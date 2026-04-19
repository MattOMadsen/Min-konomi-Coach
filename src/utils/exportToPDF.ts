import type { Transaction } from '../types';

export const exportToPDF = (transactions: Transaction[]) => {
  if (transactions.length === 0) return;

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const balance = totalIncome - totalExpenses;

  const html = `
    <html>
      <head>
        <title>Min Økonomi Rapport</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; line-height: 1.6; }
          h1 { color: #10b981; margin-bottom: 8px; }
          .header { margin-bottom: 40px; }
          .summary { background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 40px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 14px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f1f5f9; font-weight: 600; }
          .positive { color: #10b981; font-weight: 600; }
          .negative { color: #ef4444; font-weight: 600; }
          .total { font-size: 1.3em; font-weight: 700; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Min Økonomi Coach</h1>
          <p style="color: #64748b; margin: 0;">Genereret ${new Date().toLocaleDateString('da-DK', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          })}</p>
        </div>

        <div class="summary">
          <h2 style="margin-top:0">Økonomisk Oversigt</h2>
          <p><strong>Indtægter:</strong> <span class="positive">+${totalIncome.toLocaleString('da-DK')} kr</span></p>
          <p><strong>Udgifter:</strong> <span class="negative">-${totalExpenses.toLocaleString('da-DK')} kr</span></p>
          <p class="total">Saldo: ${balance.toLocaleString('da-DK')} kr</p>
        </div>

        <h2>Transaktioner (${transactions.length} stk.)</h2>
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
                <td style="text-align: right" class="${t.amount >= 0 ? 'positive' : 'negative'}">
                  ${t.amount >= 0 ? '+' : ''}${t.amount.toLocaleString('da-DK')} kr
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
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
  }, 600);
};