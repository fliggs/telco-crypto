export enum AttachSimAction {
	NEW = 'NEW',
	UPDATE = 'UPDATE',
}

export interface OrderStepAttachSimDataDto {
	action?: AttachSimAction;
}
