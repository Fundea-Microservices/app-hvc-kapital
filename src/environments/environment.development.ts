//const API_URL = 'http://localhost:3400/'//CAMBIAR A 3030
const API_URL = 'http://localhost:3030/'

export const environment = {
    production: false,
    path: API_URL,
    apiPath: (API_URL) + 'v1',
    tokenCheckInterval: 5, // minutos
    diasAtrasMovimientos: 1,
};