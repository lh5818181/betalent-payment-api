import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Client from '#models/client'
import Product from '#models/product'
import { getAuthToken } from '../../helpers/auth.js'

test.group('GET /clients', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('deve listar clientes autenticado', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_cli@teste.com')

    await Client.firstOrCreate({ email: 'cliente1@teste.com' }, { name: 'Cliente 1' })

    const response = await client.get('/clients').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('deve retornar 401 ao listar clientes sem autenticação', async ({ client }) => {
    const response = await client.get('/clients')
    response.assertStatus(401)
  })

  test('deve retornar detalhe do cliente com suas transações', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_cli_show@teste.com')

    const buyer = await Client.firstOrCreate(
      { email: 'buyer_detail@teste.com' },
      { name: 'Comprador Detalhe' }
    )
    const product = await Product.firstOrCreate({ name: 'Produto Client Test' }, { amount: 5000 })

    await client.post('/payments').json({
      clientId: buyer.id,
      products: [{ id: product.id, quantity: 1 }],
      cardNumber: '5569000000006063',
      cvv: '010',
    })

    const response = await client
      .get(`/clients/${buyer.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().id, buyer.id)
    assert.isArray(response.body().transactions)
    assert.isNotEmpty(response.body().transactions)
  })

  test('deve retornar cliente sem transações quando não houver compras', async ({
    client,
    assert,
  }) => {
    const token = await getAuthToken(client, 'admin_notx@teste.com')

    const buyer = await Client.firstOrCreate(
      { email: 'semcompra@teste.com' },
      { name: 'Sem Compra' }
    )

    const response = await client
      .get(`/clients/${buyer.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.isArray(response.body().transactions)
    assert.isEmpty(response.body().transactions)
  })

  test('deve retornar 404 para cliente inexistente', async ({ client }) => {
    const token = await getAuthToken(client, 'admin_cli404@teste.com')

    const response = await client.get('/clients/99999').header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })
})
