export enum AttachPhoneNumberAction {
	NEW = 'NEW',
	UPDATE = 'UPDATE',
}

export interface OrderStepAttachPhoneNumberDataDto {
	action?: AttachPhoneNumberAction;
}
