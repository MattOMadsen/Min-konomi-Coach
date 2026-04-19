import type { Transaction } from '../types';

// Brug de navne dine filer faktisk eksporterer
import { parsePosteringerCSV } from './banks/posteringerParser';
import { parseDanskeBankCSV } from './banks/danskeBankParser';
import { parseNordeaCSV } from './banks/nordeaParser';
import { parseJyskeBankCSV } from './banks/jyskeBankParser';
import { parseSydbankCSV } from './banks/sydbankParser';
import { parseSparNordCSV } from './banks/sparnordParser';
import { parseLunarCSV } from './banks/lunarParser';

// Fallback - brug det navn din fil faktisk har
import * as almindeligModule from './banks/almindeligEksporterParser';

export const detectAndParseCSV = (csvText: string, filename: string): Transaction[] => {
  const lower = filename.toLowerCase();

  if (lower.includes('posteringer')) return parsePosteringerCSV(csvText);
  if (lower.includes('danske')) return parseDanskeBankCSV(csvText);
  if (lower.includes('nordea')) return parseNordeaCSV(csvText);
  if (lower.includes('jyske')) return parseJyskeBankCSV(csvText);
  if (lower.includes('sydbank') || lower.includes('syd')) return parseSydbankCSV(csvText);
  if (lower.includes('spar') && lower.includes('nord')) return parseSparNordCSV(csvText);
  if (lower.includes('lunar')) return parseLunarCSV(csvText);

  // Fallback til almindelig eksporter (sikker måde)
  const almindeligParser = (almindeligModule as any).parseAlmindeligEksporterCSV 
    || (almindeligModule as any).parseAlmindeligEksporter 
    || (almindeligModule as any).default;

  if (typeof almindeligParser === 'function') {
    return almindeligParser(csvText);
  }

  console.error('Ingen gyldig parser fundet for fil:', filename);
  return [];
};