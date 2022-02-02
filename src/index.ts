import axios, { AxiosInstance, AxiosPromise } from 'axios';
import { SMSActivateError } from './handleExceptions'



const BAD_RESPOSES: { [key: string]: string; } = {
    'BAD_KEY': "Invalid API Key",
    'BAD_KEY2': 'API-ключ не задан',
    'ERROR_SQL': "SQL Error (internal server error)",
    'BAD_ACTION': 'Incorrect action',
    'BAD_SERVICE': 'Incorrect service name',
    'BANNED': "API key is banned",
    'NO_ACTIVATION': 'Activation ID does not exist',
    'BAD_STATUS': "Incorrect status",
    'NO_NUMBERS': 'No numbers',
    'NO_BALANCE': 'Not enough funds',
}

const ACTIONS: { [key: string]: string; } = {
    'GET_BALANCE': 'getBalance',
    'GET_BALANCE_CASHBACK': 'getBalanceAndCashBack',
    'GET_NUMBER': 'getNumber',
    'SET_STATUS': 'setStatus',
    'GET_STATUS': 'getStatus'

}

class SMSActivate {
    private apiKey: string = "";
    private session: any;

    constructor(apiKey: string) {
        if (apiKey) {
            this.apiKey = apiKey;

            this.session = axios.create({
                baseURL: 'https://api.sms-activate.org/stubs/handler_api.php'
            })
        }
    }

    performRequest = async (specifiedAction: string, data: any = undefined) => {
        const response = await this.session({
            method: 'POST',
            params: {
                api_key: this.apiKey,
                action: specifiedAction,
                ...data
            }
        });


        for (const ERR_CODE in BAD_RESPOSES) {
            if (typeof response['data'] === 'string' && response['data'].includes(ERR_CODE)) {
                const err: string = BAD_RESPOSES[ERR_CODE]
                throw new SMSActivateError(err);
            }

            // I truly hate the developers from SMS-Activate for doing this
            else if (typeof response['data'] === 'object' && response['data'].status === 'error') {
                if (response['data']['status'] === BAD_RESPOSES['BAD_KEY2'] || BAD_RESPOSES['BAD_KEY']) {
                    throw new SMSActivateError(BAD_RESPOSES['BAD_KEY']);
                }
            }
        }
        return response['data'];
    }

    getBalance = async (cashback: boolean = false) => {
        const action = (cashback) ? ACTIONS['GET_BALANCE_CASHBACK'] : ACTIONS['GET_BALANCE'];
        const response = await this.performRequest(action);

        const responseArray = response.split(':');

        if (responseArray[0] == 'ACCESS_BALANCE' && responseArray[1]) {
            return parseFloat(responseArray[1]);
        }
        return null;
    }

    getNumber = async (service: string = "", country: number = 0, forwarded: boolean = false) => {
        const response = await this.performRequest(ACTIONS['GET_NUMBER'], {
            service: service,
            country: country,
            forward: Number(forwarded) // Since they only take 1 and 0, we might as well just convert it from a boolean like a sane person would do.
        })

        const responseArray = response.split(':');

        if (responseArray[0] === 'ACCESS_NUMBER' && responseArray[1] && responseArray[2]) {
            return {
                id: parseInt(responseArray[1]),
                number: parseInt(responseArray[2])
            };
        }
        throw new SMSActivateError('Failed to get number!');
    }

    setStatus = async (id: number = 0, status: number = 0, forwarded: boolean = false) => {
        const response = await this.performRequest(ACTIONS['SET_STATUS'], {
            id: id,
            status: status,
            forwards: Number(forwarded) // again like earlier
        })
        return response;
    }

    getStatus = async (id: number = 0) => {
        const response = await this.performRequest(ACTIONS['GET_STATUS'], {
            id: id
        })
        const responseArray = response.split(':');

        return responseArray[0];
    }
    getCode = async (id: number = 0) => {
        const response = await this.performRequest(ACTIONS['GET_STATUS'], {
            id: id
        })
        const responseArray = response.split(':');

        if (responseArray[0] === 'STATUS_OK' && responseArray[1]) {
            return responseArray[1];
        }

        return null;
    }

}

export = SMSActivate;
