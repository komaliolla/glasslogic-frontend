export interface InvoiceRecord {
  id: number;
  date: string;
  billTo: string;
  soldTo: string;
  installDate: string;
  status: 'Draft' | 'Saved' | 'Paid' | 'Overdue';
  amount: number;
  paidDate?: string;
  checkNumber?: string;
  checkAmount?: number;
  adjustment?: number;
}

export interface InvoiceLinePrefill {
  partNumber: string;
  description: string;
  type: string;
  qty: string;
  list: string;
  sell: string;
}

export interface InvoicePrefill {
  year: string;
  make: string;
  model: string;
  vin?: string;
  lines: InvoiceLinePrefill[];
  labor?: string;
  tax?: string;
}
