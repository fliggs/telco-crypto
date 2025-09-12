import { Invoice } from '@prisma/client';

export interface RefundInvoiceDto {
	invoice: Invoice;
}
