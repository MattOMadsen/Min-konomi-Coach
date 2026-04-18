// 1 fil - 1 funktion
// parsers/localCoach.ts – nu meget bedre til spørgsmål om besparelser + "ud fra min bankudtog"

import type { Transaction } from './csvParser';

export const getLocalCoachResponse = (userMessage: string, transactions: Transaction[]): string => {
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const msg = userMessage.toLowerCase().trim();

  // Ny: Direkte spørgsmål om besparelser / "ud fra min bankudtog"
  if (msg.includes('spare') || msg.includes('besparelse') || msg.includes('bankudtog') || msg.includes('ud fra min') || msg.includes('hvad kan jeg spare')) {
    // Find de største udgiftskategorier
    const categoryMap = new Map<string, number>();
    transactions.forEach(t => {
      if (t.amount >= 0) return;
      const desc = t.description.toLowerCase();
      let cat = 'Diverse';
      if (desc.includes('takeaway') || desc.includes('wolt') || desc.includes('just eat') || desc.includes('pizza') || desc.includes('sushi')) cat = 'Takeaway';
      else if (desc.includes('netto') || desc.includes('føtex') || desc.includes('rema') || desc.includes('dagligvarer')) cat = 'Dagligvarer';
      else if (desc.includes('café') || desc.includes('coffee') || desc.includes('espresso')) cat = 'Café';
      else if (desc.includes('benzin') || desc.includes('shell') || desc.includes('circle k')) cat = 'Benzin & bil';
      else if (desc.includes('husleje') || desc.includes('leje')) cat = 'Husleje';
      else if (desc.includes('netflix') || desc.includes('spotify')) cat = 'Abonnementer';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount));
    });

    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    let advice = `💰 **Personlige besparelsesforslag ud fra dit bankudtog**\n\n`;
    topCategories.forEach(([cat, amount]) => {
      const monthly = Math.round(amount / 3);
      advice += `• **${cat}**: ${amount.toLocaleString('da-DK')} kr (ca. ${monthly.toLocaleString('da-DK')} kr/måned)\n`;
    });

    advice += `\n**Mine 3 bedste råd til dig lige nu:**\n`;
    advice += `1. **Takeaway & mad ude** er ofte den største synder – prøv at lave mad hjemme 3 aftener mere om ugen.\n`;
    advice += `2. **Dagligvarer** – lav en indkøbsliste og køb kun én gang om ugen.\n`;
    advice += `3. **Café & abonnementer** – små udgifter der hurtigt løber op.\n\n`;
    advice += `Vil du have et konkret månedligt budgetforslag?`;
    return advice;
  }

  // Resten af de gamle funktioner (uændret)
  if (msg.includes('vis alle') || msg.includes('alle poster') || msg.includes('liste')) {
    return `📋 **Alle dine ${transactions.length} poster**\n\n` +
           transactions
             .map(t => `${t.date} │ ${t.description} │ ${t.amount > 0 ? '➕' : '➖'} ${t.amount.toFixed(0)} kr`)
             .join('\n') +
           `\n\n────────────────────\n` +
           `**Samlet ind:** +${totalIncome.toLocaleString('da-DK')} kr\n` +
           `**Samlet ud:** -${totalExpenses.toLocaleString('da-DK')} kr`;
  }

  if (msg.includes('største') || msg.includes('top') || msg.includes('udgift')) {
    const topExpenses = transactions
      .filter(t => t.amount < 0)
      .sort((a, b) => a.amount - b.amount)
      .slice(0, 8);
    return `🔥 **Dine 8 største udgifter**\n\n` +
           topExpenses
             .map(t => `• ${t.date} │ ${t.description} │ ${Math.abs(t.amount).toLocaleString('da-DK')} kr`)
             .join('\n') +
           `\n\n────────────────────\n` +
           `**Samlet udgift:** ${totalExpenses.toLocaleString('da-DK')} kr`;
  }

  if (msg.includes('budget') || msg.includes('mål') || msg.includes('oversigt')) {
    const saldo = totalIncome - totalExpenses;
    return `📊 **Økonomisk oversigt**\n\n` +
           `**Indtægter**     ${totalIncome.toLocaleString('da-DK')} kr\n` +
           `**Udgifter**      ${totalExpenses.toLocaleString('da-DK')} kr\n` +
           `**Saldo**         ${saldo.toLocaleString('da-DK')} kr\n\n` +
           `Vil du have hjælp til at sætte konkrete budgetmål?`;
  }

  if (msg.includes('spareråd') || msg.includes('råd')) {
    return `💡 **3 hurtige spareråd baseret på dine poster**\n\n` +
           `1. **Takeaway & mad ude** er ofte den største post – prøv at lave mad hjemme 2-3 dage mere om ugen.\n` +
           `2. **Dagligvarer** – køb ind én gang om ugen i stedet for mange små ture.\n` +
           `3. **Benzin & café** – små vaner der hurtigt løber op.\n\n` +
           `Vil du have mere specifikke råd til netop dine poster?`;
  }

  // Generelt fallback
  return `👋 **Hej!** Jeg har kigget på alle dine ${transactions.length} poster.\n\n` +
         `**Indtægter:** +${totalIncome.toLocaleString('da-DK')} kr\n` +
         `**Udgifter:**  -${totalExpenses.toLocaleString('da-DK')} kr\n\n` +
         `Prøv at spørge om:\n` +
         `• "vis alle poster"\n` +
         `• "største udgifter"\n` +
         `• "budget"\n` +
         `• "hvad kan jeg spare på"`;
};