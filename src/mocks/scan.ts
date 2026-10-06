/** Ported from `INITIAL_PARSED_ROWS` in Seller App.html. No backend for sheet parsing. */
export interface ParsedSheetRow {
  id: number;
  category: string;
  item: string;
  weight: string;
  price: string;
  featured: boolean;
}

export const INITIAL_PARSED_ROWS: ParsedSheetRow[] = [
  { id: 101, category: "Rajma", item: "Black", weight: "30KG", price: "12200", featured: false },
  { id: 102, category: "Dal", item: "Moong", weight: "30KG", price: "8100", featured: true },
  { id: 103, category: "Dal", item: "Dal Chana", weight: "30KG", price: "11800", featured: false },
  { id: 104, category: "Dal", item: "Dal Chana", weight: "30KG", price: "9450", featured: false },
  { id: 105, category: "Besan", item: "Besan", weight: "35KG", price: "2630", featured: false },
];
