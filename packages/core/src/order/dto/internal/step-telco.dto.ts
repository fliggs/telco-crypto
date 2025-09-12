export enum TelcoAction {
	ACTIVATE = 'ACTIVATE',
	DEACTIVATE = 'DEACTIVATE',
	RENEW = 'RENEW',
	CHANGE_SIM = 'CHANGE_SIM',
	CHANGE_MSISDN = 'CHANGE_MSISDN',
	PORT_OUT = 'PORT_OUT',
}

export interface OrderStepTelcoDataDto {
	action: TelcoAction;
}
