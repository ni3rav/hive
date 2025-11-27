import 'dotenv/config';
import { env } from './env';
import { app } from './server';
import logger from './logger';

app.listen(env.PORT, () =>
  logger.info(
    `Server running at port ${env.PORT} in ${env.NODE_ENV} with DMA: ${env.DMA}`,
  ),
);
