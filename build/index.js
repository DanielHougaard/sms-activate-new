"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
const handleExceptions_1 = require("./handleExceptions");
const BAD_RESPOSES = {
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
};
const ACTIONS = {
    'GET_BALANCE': 'getBalance',
    'GET_BALANCE_CASHBACK': 'getBalanceAndCashBack',
    'GET_NUMBER': 'getNumber',
    'SET_STATUS': 'getStatus',
    'GET_STATUS': 'getStatus'
};
class SMSActivate {
    constructor(apiKey) {
        this.apiKey = "";
        this.performRequest = (specifiedAction, data = undefined) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.session({
                method: 'POST',
                params: Object.assign({ api_key: this.apiKey, action: specifiedAction }, data)
            });
            for (const ERR_CODE in BAD_RESPOSES) {
                if (typeof response['data'] === 'string' && response['data'].includes(ERR_CODE)) {
                    const err = BAD_RESPOSES[ERR_CODE];
                    throw new handleExceptions_1.SMSActivateError(err);
                }
                // I truly hate the developers from SMS-Activate for doing this
                else if (typeof response['data'] === 'object' && response['data'].status === 'error') {
                    if (response['data']['status'] === BAD_RESPOSES['BAD_KEY2'] || BAD_RESPOSES['BAD_KEY']) {
                        throw new handleExceptions_1.SMSActivateError(BAD_RESPOSES['BAD_KEY']);
                    }
                }
            }
            return response['data'];
        });
        this.getBalance = (cashback = false) => __awaiter(this, void 0, void 0, function* () {
            const action = (cashback) ? ACTIONS['GET_BALANCE_CASHBACK'] : ACTIONS['GET_BALANCE'];
            const response = yield this.performRequest(action);
            const responseArray = response.split(':');
            if (responseArray[0] == 'ACCESS_BALANCE' && responseArray[1]) {
                return parseFloat(responseArray[1]);
            }
            return null;
        });
        this.getNumber = (service = "", country = 0, forwarded = false) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.performRequest(ACTIONS['GET_NUMBER'], {
                service: service,
                country: country,
                forward: Number(forwarded) // Since they only take 1 and 0, we might as well just convert it from a boolean like a sane person would do.
            });
            const responseArray = response.split(':');
            if (responseArray[0] === 'ACCESS_NUMBER' && responseArray[1] && responseArray[2]) {
                return {
                    id: parseInt(responseArray[1]),
                    number: parseInt(responseArray[2])
                };
            }
            throw new handleExceptions_1.SMSActivateError('Failed to get number!');
        });
        this.setStatus = (id = 0, status = 0, forwarded = false) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.performRequest(ACTIONS['SET_STATUS'], {
                id: id,
                status: status,
                forwards: Number(forwarded) // again like earlier
            });
            return response;
        });
        this.getStatus = (id = 0) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.performRequest(ACTIONS['GET_STATUS'], {
                id: id
            });
            const responseArray = response.split(':');
            return responseArray[0];
        });
        this.getCode = (id = 0) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.performRequest(ACTIONS['GET_STATUS'], {
                id: id
            });
            const responseArray = response.split(':');
            if (responseArray[0] === 'STATUS_OK' && responseArray[1]) {
                return responseArray[1];
            }
            return null;
        });
        if (apiKey) {
            this.apiKey = apiKey;
            this.session = axios_1.default.create({
                baseURL: 'https://api.sms-activate.org/stubs/handler_api.php'
            });
        }
    }
}
module.exports = SMSActivate;
