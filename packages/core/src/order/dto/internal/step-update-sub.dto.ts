export enum UpdateSubscriptionAction {
	CHANGE_OFFER = 'CHANGE_OFFER',
	UPDATE_PERIOD_TIMESTAMPS = 'UPDATE_PERIOD_TIMESTAMPS',
}

export interface OrderStepUpdateSubscriptionDataDto {
	action: UpdateSubscriptionAction;
}
