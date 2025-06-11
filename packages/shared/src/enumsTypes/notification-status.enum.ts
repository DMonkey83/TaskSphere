import { z } from "zod"
import { enumToOptions } from "../utils/enum-to-options"

export enum NotificationStatusEnum {
  Pending = 'pending',
  Sent = 'sent',
  Delivered = 'delivered',
  Failed = 'failed',
}

export const NotifcationStausLabels: Record<NotificationStatusEnum, string> = {
  [NotificationStatusEnum.Pending]: 'Pending',
  [NotificationStatusEnum.Sent]: 'Sent',
  [NotificationStatusEnum.Delivered]: 'Delivered',
  [NotificationStatusEnum.Failed]: 'Failed',
}

export const NotificationStatusZodEnum = z.enum(Object.values(NotificationStatusEnum) as [string, ...string[]]);

export type NotificationStatus = {
  label: keyof typeof NotificationStatusEnum;
  value: NotificationStatusEnum;
}

export const NotificationStatuses = enumToOptions(NotificationStatusEnum) as NotificationStatus[];
