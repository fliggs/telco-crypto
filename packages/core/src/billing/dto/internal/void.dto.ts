import { Invoice } from '@prisma/client';

export interface VoidInvoiceDto {
	invoice: Invoice;
}
