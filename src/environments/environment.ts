const API_URL = 'http://localhost:3200/'

export const environment = {
    production: true,
    path: API_URL,
    apiPath: (API_URL) + 'v1',
    tokenCheckInterval: 5,  // minutos
    diasAtrasMovimientos: 1,
};