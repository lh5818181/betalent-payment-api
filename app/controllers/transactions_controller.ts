import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'

export default class TransactionsController {
  async index({ response }: HttpContext) {
    const transactions = await Transaction.query().preload('products')
    return response.ok(transactions)
  }

  async show({ params, response }: HttpContext) {
    const transaction = await Transaction.query().where('id', params.id).preload('products').first()

    if (!transaction) return response.notFound({ message: 'Transação não encontrada.' })
    return response.ok(transaction)
  }
}
