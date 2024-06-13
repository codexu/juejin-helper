import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { knife4jSetup } from 'nest-knife4j';
import { WsAdapter } from '@nestjs/platform-ws';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { BaseExceptionFilter } from './common/exceptions/base.exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new WsAdapter(app));

  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: 'http://localhost:8101', // Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  knife4jSetup(app, [
    {
      name: '2.X版本',
      url: `/api-json`,
      swaggerVersion: '2.0',
      location: `/api-json`,
    },
  ]);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new BaseExceptionFilter(), new HttpExceptionFilter());
  await app.listen(8100);
}
bootstrap();
