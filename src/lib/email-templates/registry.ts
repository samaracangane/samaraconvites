import type { ComponentType } from 'react'
import { template as orderPaidCustomer } from './order-paid-customer'
import { template as orderPaidAdmin } from './order-paid-admin'
import { template as orderDeliveredCustomer } from './order-delivered-customer'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'order-paid-customer': orderPaidCustomer,
  'order-paid-admin': orderPaidAdmin,
  'order-delivered-customer': orderDeliveredCustomer,
}
