import { Module } from '@nestjs/common';
import { GoodsReceiptsService } from './goods-receipts.service';
import { GoodsReceiptsController } from './goods-receipts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { GoodsReceiptDetail } from './entities/goods-receipt-detail.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoodsReceipt, GoodsReceiptDetail]),
    ProductsModule,
  ],
  controllers: [GoodsReceiptsController],
  providers: [GoodsReceiptsService],
})
export class GoodsReceiptsModule {}
