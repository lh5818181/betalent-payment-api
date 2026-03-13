import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Client from '#models/client'
import Product from '#models/product'
import { getAuthToken } from '../helpers/auth.ts'

test.group('GET /transactions', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  async function criarPagamento(client: any) {
    const buyer = await Client.firstOrCreate(
      { email: 'buyer_tx@teste.com' },
      { name: 'Comprador TX' }
    )
    const product = await Product.firstOrCreate({ name: 'Produto TX' }, { amount: 20000 })

    await client.post('/payments').json({
      clientId: buyer.id,
      products: [{ id: product.id, quantity: 1 }],
      cardNumber: '5569000000006063',
      cvv: '010',
    })

    return { buyer, product }
  }

  test('deve listar todas as transações autenticado', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_tx@teste.com')
    await criarPagamento(client)

    const response = await client.get('/transactions').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.isArray(response.body())
    assert.isNotEmpty(response.body())
  })

  test('deve retornar 401 ao listar transações sem autenticação', async ({ client }) => {
    const response = await client.get('/transactions')
    response.assertStatus(401)
  })

  test('deve retornar detalhes de uma transação com produtos', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_tx_show@teste.com')
    await criarPagamento(client)

    const lista = await client.get('/transactions').header('Authorization', `Bearer ${token}`)

    const id = lista.body()[0].id

    const response = await client
      .get(`/transactions/${id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.exists(response.body().id)
    assert.exists(response.body().amount)
    assert.exists(response.body().externalId)
    assert.exists(response.body().status)
    assert.isArray(response.body().products)
  })

  test('deve retornar transação com cardLastNumbers de 4 dígitos', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_tx_card@teste.com')
    await criarPagamento(client)

    const lista = await client.get('/transactions').header('Authorization', `Bearer ${token}`)

    const id = lista.body()[0].id

    const response = await client
      .get(`/transactions/${id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().cardLastNumbers, '6063')
    assert.lengthOf(response.body().cardLastNumbers, 4)
  })

  test('deve retornar 404 para transação inexistente', async ({ client }) => {
    const token = await getAuthToken(client, 'admin_tx404@teste.com')

    const response = await client
      .get('/transactions/99999')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })

  test('deve retornar 401 ao buscar transação sem autenticação', async ({ client }) => {
    const response = await client.get('/transactions/1')
    response.assertStatus(401)
  })
})
