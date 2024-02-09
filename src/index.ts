import 'dotenv/config';
import { App } from './app';

export const PORT = Number(process.env.PORT ?? 4000);

new App(PORT);