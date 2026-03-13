import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Client from '#models/client'
import Product from '#models/product'
import { getAuthToken } from '../../helpers/auth.ts'

test.group('GET /transactions', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  async function criarPagamento(client: any) {
    const user = await Client.firstOrCreate({ email: 'buyer@teste.com' }, { name: 'Comprador' })
    const product = await Product.firstOrCreate({ name: 'Headset' }, { amount: 20000 })
    await client.post('/payments').json({
      clientId: user.id,
      products: [{ id: product.id, quantity: 1 }],
      cardNumber: '5569000000006063',
      cvv: '010',
    })
    return { user, product }
  }

  test('deve listar todas as transações autenticado', async ({ client, assert }) => {
    const token = await getAuthToken(client)
    await criarPagamento(client)

    const response = await client.get('/transactions').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('deve retornar detalhes de uma transação', async ({ client, assert }) => {
    const token = await getAuthToken(client)
    await criarPagamento(client)

    const lista = await client.get('/transactions').header('Authorization', `Bearer ${token}`)

    const id = lista.body()[0].id

    const response = await client
      .get(`/transactions/${id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.exists(response.body().externalId)
    assert.exists(response.body().amount)
  })

  test('deve retornar 401 sem autenticação', async ({ client }) => {
    const response = await client.get('/transactions')
    response.assertStatus(401)
  })

  test('deve retornar 404 para transação inexistente', async ({ client }) => {
    const token = await getAuthToken(client)

    const response = await client
      .get('/transactions/99999')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })
})
