import * as mockAPI from './mockAPI';
import * as realAPI from './realAPI';

const isDev = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';

export const api = isDev ? mockAPI : realAPI;
