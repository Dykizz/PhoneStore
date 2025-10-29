import { Module } from '@nestjs/common';
import { DiscountPoliciesService } from './discount-policies.service';
import { DiscountPoliciesController } from './discount-policies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountPolicy } from './entities/discount-policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountPolicy])],
  controllers: [DiscountPoliciesController],
  providers: [DiscountPoliciesService],
})
export class DiscountPoliciesModule {}
