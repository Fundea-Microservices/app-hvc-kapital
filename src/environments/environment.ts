//const API_URL = 'http://localhost:3400/'//CAMBIAR A 3030
const API_URL = 'http://localhost:3030/'

export const environment = {
    production: true,
    path: API_URL,
    apiPath: (API_URL) + 'v1',
    tokenCheckInterval: 5,  // minutos
    diasAtrasMovimientos: 1,
};