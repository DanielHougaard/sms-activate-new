## Install ##
NPM:  `npm install sms-activate-new`

Yarn:  `yarn install sms-activate-new`

## Usage ##
```javascript
const SMSActivate = require('sms-activate-new');
const smsActivate = new SMSActivate('token');

const balance = await smsActivate.getBalance();

if (balance > 0) {
  const numberDetails = await smsActivate.getNumber('ew', 0); // Full list of services and countries can be found here: https://sms-activate.org/en/api2
  await smsActivate.setStatus(numberDetails.id, 1);
  
  // Use number...

  const waitForCode = setInterval(async () => {
    const code = await sms.getCode(numberDetails.id);
    if (code) {
      clearInterval(waitForCode);
      await smsActivate.setStatus(numberDetails.id, 6);

      console.log(code);
    }
  }, 1500);
} 
else {
  console.log('Invalid balance');
}
```

## Documentation ##
```javascript
// The getBalance function is used to fetch the current balance assosicated with the api key. The parameter cashback determains if is should account for the cashback balance.
getBalance(cashback: boolean)

// getNumber is used to get a new number. Service and country defines the country and the service that the number is going to be used for (a service like Nike). The service and country codes can be found at https://sms-activate.org/en/api2
// (forwarded is optional, only use if if you are sure you need it)
getNumber(service: string, country: number, forwarded: boolean)

// setStatus is used to update the current status of a phone number, like when you're done using it.
// (forwarded is optional, only use if if you are sure you need it)
setStatus(id: number, status: number, forwarded: boolean) 

// getStatus is used for getting the current status of a phone number with the ID associated with it.
// (forwarded is optional, only use if if you are sure you need it)
getStatus(id: number)

// getCode works the same way as getStatus, except if the response says that the code is ready, it will return it. If the code isn't ready yet it will return null.
getCode(id: number)

// The getBalance function is used to fetch the current balance assosicated with the api key. The parameter cashback determains if is should account for the cashback balance.
getBalance(cashback: boolean)

// performRequest allows you to make your own specific requests related to SMS-Activate, incase the wrapper isn't sufficient.
performRequest(specifiedAction: string, data: any) 

```

#### Credits ####
At last, I would like to give credits to  [jsopn](https://github.com/jsopn/ "Github User") for his work on the now outdated SMS-Activate wrapper.
