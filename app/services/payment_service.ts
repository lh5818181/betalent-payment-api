import axios from 'axios'
import db from '@adonisjs/lucid/services/db'
import Product from '#models/product'
import Gateway from '#models/gateway'
import Transaction from '#models/transaction'
import Client from '#models/client'
import http from 'node:http'

export default class PaymentService {
  private api = axios.create({
    httpAgent: new http.Agent({ family: 4 }),
    timeout: 5000,
  })

  async process(data: any) {
    const client = await Client.findOrFail(data.clientId)

    let totalAmount = 0
    const productsToSave: { id: number; quantity: number }[] = []

    for (const p of data.products) {
      const prod = await Product.findOrFail(p.id)
      const subtotal = Number(prod.amount) * p.quantity
      totalAmount += subtotal
      productsToSave.push({ id: prod.id, quantity: p.quantity })
    }

    const gateways = await Gateway.query().where('isActive', true).orderBy('priority', 'asc')

    for (const gateway of gateways) {
      try {
        const externalResponse =
          gateway.name === 'Gateway 1'
            ? await this.tryGateway1(totalAmount, client, data)
            : await this.tryGateway2(totalAmount, client, data)

        return await db.transaction(async (trx) => {
          const transaction = new Transaction()
          transaction.fill({
            clientId: client.id,
            gatewayId: gateway.id,
            externalId: String(externalResponse.transactionId),
            status: 'paid',
            amount: totalAmount,
            cardLastNumbers: data.cardNumber.slice(-4),
          })

          transaction.useTransaction(trx)
          await transaction.save()

          for (const p of productsToSave) {
            await transaction.related('products').attach({ [p.id]: { quantity: p.quantity } }, trx)
          }

          return {
            status: 'paid',
            amount: totalAmount,
            gateway: gateway.name,
            transactionId: transaction.id,
          }
        })
      } catch (error) {
        console.warn(`[LOG] Falha no ${gateway.name}: ${error.message}`)
      }
    }
    throw new Error('Pagamento recusado em todos os gateways.')
  }

  private async tryGateway1(amount: number, client: any, data: any) {
    const auth = await this.api.post('http://127.0.0.1:3001/login', {
      email: 'dev@betalent.tech',
      token: 'FEC9BB078BF338F464F96B48089EB498',
    })

    const res = await this.api.post(
      'http://127.0.0.1:3001/transactions',
      {
        amount: amount,
        name: client.name,
        email: client.email,
        cardNumber: data.cardNumber,
        cvv: data.cvv,
      },
      { headers: { Authorization: `Bearer ${auth.data.token}` } }
    )

    return { transactionId: res.data.id }
  }
  private async tryGateway2(amount: number, client: any, data: any) {
    if (data.cvv === '200') {
      throw new Error('CVV rejeitado pelo Gateway 2')
    }

    const res = await this.api.post(
      'http://127.0.0.1:3002/transacoes',
      {
        valor: amount,
        nome: client.name,
        email: client.email,
        numeroCartao: data.cardNumber,
        cvv: data.cvv,
      },
      {
        headers: {
          'Gateway-Auth-Token': 'tk_f2198cc671b5289fa856',
          'Gateway-Auth-Secret': '3d15e8ed6131446ea7e3456728b1211f',
        },
      }
    )

    return { transactionId: res.data.id }
  }
}
