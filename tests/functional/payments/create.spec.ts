import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Client from '#models/client'
import Product from '#models/product'
import Transaction from '#models/transaction'
import Gateway from '#models/gateway'

test.group('POST /payments', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    await Gateway.query().delete()

    await Gateway.createMany([
      { name: 'Gateway 1', isActive: true, priority: 1 },
      { name: 'Gateway 2', isActive: true, priority: 2 },
    ])

    return () => db.rollbackGlobalTransaction()
  })

  test('deve calcular total, processar pelo gateway 1 e salvar no banco', async ({
    client,
    assert,
  }) => {
    const user = await Client.firstOrCreate({ email: 'luis@teste.com' }, { name: 'Luís Henrique' })
    const product = await Product.firstOrCreate({ name: 'Teclado' }, { amount: 15000 })

    const response = await client.post('/payments').json({
      clientId: user.id,
      products: [{ id: product.id, quantity: 2 }],
      cardNumber: '5569000000006063',
      cvv: '010',
    })

    response.assertStatus(201)
    assert.equal(response.body().amount, 30000)
    assert.equal(response.body().gateway, 'Gateway 1')

    const transaction = await Transaction.query().where('amount', 30000).firstOrFail()
    assert.exists(transaction.externalId)
    assert.equal(transaction.cardLastNumbers, '6063')
  })

  test('deve tentar gateway 2 quando gateway 1 rejeitar o CVV', async ({ client, assert }) => {
    const user = await Client.firstOrCreate(
      { email: 'fallback@teste.com' },
      { name: 'Fallback User' }
    )
    const product = await Product.firstOrCreate({ name: 'Mouse' }, { amount: 8000 })

    const response = await client.post('/payments').json({
      clientId: user.id,
      products: [{ id: product.id, quantity: 1 }],
      cardNumber: '5569000000006063',
      cvv: '100',
    })

    response.assertStatus(201)
    assert.equal(response.body().amount, 8000)
    assert.equal(response.body().gateway, 'Gateway 2')
  })

  test('deve retornar erro quando CVV for rejeitado por todos os gateways', async ({
    client,
    assert,
  }) => {
    const user = await Client.firstOrCreate({ email: 'cvvfail@teste.com' }, { name: 'CVV Fail' })
    const product = await Product.firstOrCreate({ name: 'Monitor' }, { amount: 120000 })

    const response = await client.post('/payments').json({
      clientId: user.id,
      products: [{ id: product.id, quantity: 1 }],
      cardNumber: '5569000000006063',
      cvv: '200',
    })

    response.assertStatus(400)
    assert.exists(response.body().message)
  })

  test('deve calcular total corretamente com múltiplos produtos', async ({ client, assert }) => {
    const user = await Client.firstOrCreate(
      { email: 'multi@teste.com' },
      { name: 'Multi Produtos' }
    )
    const produto1 = await Product.firstOrCreate({ name: 'Teclado2' }, { amount: 10000 })
    const produto2 = await Product.firstOrCreate({ name: 'Mouse2' }, { amount: 5000 })

    const response = await client.post('/payments').json({
      clientId: user.id,
      products: [
        { id: produto1.id, quantity: 2 },
        { id: produto2.id, quantity: 3 },
      ],
      cardNumber: '5569000000006063',
      cvv: '010',
    })

    response.assertStatus(201)
    assert.equal(response.body().amount, 35000)
  })

  test('deve retornar 422 quando clientId não for informado', async ({ client }) => {
    const response = await client.post('/payments').json({
      products: [{ id: 1, quantity: 1 }],
      cardNumber: '5569000000006063',
      cvv: '010',
    })

    response.assertStatus(422)
  })

  test('deve retornar 422 quando products estiver vazio', async ({ client }) => {
    const response = await client.post('/payments').json({
      clientId: 1,
      products: [],
      cardNumber: '5569000000006063',
      cvv: '010',
    })

    response.assertStatus(422)
  })

  test('deve retornar 422 quando cardNumber não tiver 16 dígitos', async ({ client }) => {
    const user = await Client.firstOrCreate({ email: 'card@teste.com' }, { name: 'Card Test' })
    const product = await Product.firstOrCreate({ name: 'Produto Card' }, { amount: 1000 })

    const response = await client.post('/payments').json({
      clientId: user.id,
      products: [{ id: product.id, quantity: 1 }],
      cardNumber: '1234',
      cvv: '010',
    })

    response.assertStatus(422)
  })

  test('deve retornar 404 quando clientId não existir', async ({ client }) => {
    const product = await Product.firstOrCreate({ name: 'Produto 404' }, { amount: 1000 })

    const response = await client.post('/payments').json({
      clientId: 99999,
      products: [{ id: product.id, quantity: 1 }],
      cardNumber: '5569000000006063',
      cvv: '010',
    })

    response.assertStatus(404)
  })
})
