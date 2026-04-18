// 1 fil - 1 funktion
// parsers/bankDetector.ts – Central detektor + router for ALLE bank-CSV-filer (fuld version med Lunar)

import Papa from 'papaparse';
import type { Transaction } from './csvParser';

// Import af alle dedikerede parsers (én fil pr. bank/type)
import { parsePosteringerCSV } from './banks/posteringerParser';
import { parseDanskeBankCSV } from './banks/danskeBankParser';
import { parseNordeaCSV } from './banks/nordeaParser';
import { parseJyskeBankCSV } from './banks/jyskeBankParser';
import { parseSydbankCSV } from './banks/sydbankParser';
import { parseSparNordCSV } from './banks/sparnordParser';
import { parseAlmindeligEksporterCSV } from './banks/almindeligEksporterParser';
import { parseLunarCSV } from './banks/lunarParser';

export const detectAndParseCSV = (csvText: string, filename: string): Transaction[] => {
  const lower = filename.toLowerCase();

  // Posteringer (ingen header)
  if (lower.includes('posteringer')) {
    return parsePosteringerCSV(csvText);
  }

  // Danske Bank
  if (lower.includes('danske') || lower.includes('danskebank')) {
    return parseDanskeBankCSV(csvText);
  }

  // Nordea
  if (lower.includes('nordea')) {
    return parseNordeaCSV(csvText);
  }

  // Jyske Bank
  if (lower.includes('jyske')) {
    return parseJyskeBankCSV(csvText);
  }

  // Sydbank
  if (lower.includes('sydbank') || lower.includes('syd')) {
    return parseSydbankCSV(csvText);
  }

  // Spar Nord
  if (lower.includes('spar') && lower.includes('nord')) {
    return parseSparNordCSV(csvText);
  }

  // Lunar
  if (lower.includes('lunar')) {
    return parseLunarCSV(csvText);
  }

  // Almindelig / standard Eksporter (catch-all for alle andre banker)
  return parseAlmindeligEksporterCSV(csvText);
};