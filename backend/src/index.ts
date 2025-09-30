import 'dotenv/config';
import { env } from './env';
import { app } from './server';

app.listen(env.PORT, () => console.log(`server is up at port${env.PORT}`));
