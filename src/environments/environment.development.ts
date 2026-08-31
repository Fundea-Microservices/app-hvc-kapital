const API_URL = 'http://localhost:3200/'
//const API_URL = 'http://172.25.5.11:3030/'

export const environment = {
    production: false,
    path: API_URL,
    apiPath: (API_URL) + 'dev',
    tokenCheckInterval: 5, // minutos
    diasAtrasMovimientos: 1,
};