import { Invoice, InvoiceItem, Order, User } from '@prisma/client';

export interface PayInvoiceDto {
	user: User;
	order: Order;
	invoice: Invoice;
	items: InvoiceItem[];
}
