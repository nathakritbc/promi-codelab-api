import { DocumentBuilder } from '@nestjs/swagger';
import { accessKeyToken } from './jwt.config';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Catalog Promotions API')
  .setDescription('The Catalog Promotions API description')
  .setVersion('1.0')
  .addTag('Catalog Promotions')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
    },
    accessKeyToken,
  )
  .build();
