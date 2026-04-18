import Papa from 'papaparse'

export interface Transaction {
  dato: string
  beskrivelse: string
  beløb: number
}

export const parsePosteringerCSV = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      delimiter: ';',
      complete: (results) => {
        const parsed = results.data
          .map((row: any) => ({
            dato: row[3] || '',
            beskrivelse: row[4] || row[9] || '',
            beløb: parseFloat(
              String(row[5] || row[6] || '0')
                .replace(/\./g, '')
                .replace(',', '.')
                .replace(/\s/g, '')
            ) || 0
          }))
          .filter(t => t.dato && t.beløb !== 0)

        resolve(parsed)
      }
    })
  })
}