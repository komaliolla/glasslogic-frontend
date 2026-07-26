export interface InvoiceRecord {
  id: number;
  date: string;
  billTo: string;
  soldTo: string;
  installDate: string;
  status: 'Draft' | 'Saved' | 'Paid' | 'Overdue';
  amount: number;
}
