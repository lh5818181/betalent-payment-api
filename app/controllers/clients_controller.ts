import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'

export default class ClientsController {
  async index({ response }: HttpContext) {
    const clients = await Client.all()
    return response.ok(clients)
  }

  async show({ params, response }: HttpContext) {
    const client = await Client.query()
      .where('id', params.id)
      .preload('transactions', (q) => q.preload('products'))
      .first()

    if (!client) return response.notFound({ message: 'Cliente não encontrado.' })
    return response.ok(client)
  }
}
