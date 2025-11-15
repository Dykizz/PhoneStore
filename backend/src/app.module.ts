import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfig } from './Configs/DatabaseConfig';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { SuppliersModule } from './suppliers/suppliers.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { BrandsModule } from './brands/brands.module';
import { ProductTypesModule } from './product-types/product-types.module';
import { ProductsModule } from './products/products.module';
import { DiscountPoliciesModule } from './discount-policies/discount-policies.module';
import { GoodsReceiptsModule } from './goods-receipts/goods-receipts.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM Module sử dụng DatabaseConfig function
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        DatabaseConfig(configService),
    }),
    UsersModule,
    AuthModule,
    SuppliersModule,
    BrandsModule,
    ProductTypesModule,
    ProductsModule,
    DiscountPoliciesModule,
    GoodsReceiptsModule,
    OrdersModule,
    PaymentModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
