import { TransactionSchema } from '#database/schema'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'

export default class Transaction extends TransactionSchema {
  @manyToMany(() => Product, {
    pivotTable: 'transaction_products',
    pivotForeignKey: 'transaction_id',
    pivotRelatedForeignKey: 'product_id',
    pivotColumns: ['quantity'],
  })
  declare products: ManyToMany<typeof Product>
}
