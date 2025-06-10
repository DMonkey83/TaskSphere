import { enumToOptions } from "../utils/enum-to-options";
import { z } from "zod";

export enum IndustriesEnum {
  Programming = 'programming',
  Legal = 'legal',
  Logistics = 'logistics',
  Marketing = 'marketing',
  Product = 'product',
  Other = 'other',
}

export const IndustriesLabels: Record<IndustriesEnum, string> = {
  [IndustriesEnum.Programming]: 'Programming',
  [IndustriesEnum.Legal]: 'Legal',
  [IndustriesEnum.Logistics]: 'Logistics',
  [IndustriesEnum.Marketing]: 'Marketing',
  [IndustriesEnum.Product]: 'Product',
  [IndustriesEnum.Other]: 'Other',
}

export const IndustriesZodEnum = z.enum(Object.values(IndustriesEnum) as [string, ...string[]])


export type Industry = {
  label: keyof typeof IndustriesEnum;
  value: IndustriesEnum;
}
export const Industries = enumToOptions(IndustriesEnum) as Industry[];
