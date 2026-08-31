const API_URL = 'http://172.25.5.11:3200/'

export const environment = {
    production: true,
    path: API_URL,
    apiPath: (API_URL) + 'v1',
    tokenCheckInterval: 5,  // minutos
    diasAtrasMovimientos: 1,
};