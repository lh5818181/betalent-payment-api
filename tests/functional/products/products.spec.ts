import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { getAuthToken } from '../../helpers/auth.js'

test.group('CRUD /products', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('deve listar produtos autenticado', async ({ client }) => {
    const token = await getAuthToken(client, 'admin_list@teste.com')

    const response = await client.get('/products').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })

  test('deve retornar 401 ao listar produtos sem autenticação', async ({ client }) => {
    const response = await client.get('/products')
    response.assertStatus(401)
  })

  test('deve criar produto com dados válidos', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_create@teste.com')

    const response = await client
      .post('/products')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Headset Gamer', amount: 25000 })

    response.assertStatus(201)
    assert.equal(response.body().name, 'Headset Gamer')
    assert.equal(response.body().amount, 25000)
    assert.exists(response.body().id)
  })

  test('deve retornar 401 ao criar produto sem autenticação', async ({ client }) => {
    const response = await client.post('/products').json({ name: 'Produto', amount: 1000 })

    response.assertStatus(401)
  })

  test('deve retornar detalhe de um produto', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_show@teste.com')

    const created = await client
      .post('/products')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Produto Detalhe', amount: 3000 })

    const id = created.body().id

    const response = await client.get(`/products/${id}`).header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().id, id)
  })

  test('deve retornar 404 para produto inexistente', async ({ client }) => {
    const token = await getAuthToken(client, 'admin_404@teste.com')

    const response = await client.get('/products/99999').header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })

  test('deve atualizar produto existente', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_update@teste.com')

    const created = await client
      .post('/products')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Produto Antigo', amount: 5000 })

    const id = created.body().id

    const response = await client
      .put(`/products/${id}`)
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Produto Atualizado', amount: 7500 })

    response.assertStatus(200)
    assert.equal(response.body().name, 'Produto Atualizado')
    assert.equal(response.body().amount, 7500)
  })

  test('deve retornar 404 ao atualizar produto inexistente', async ({ client }) => {
    const token = await getAuthToken(client, 'admin_upd404@teste.com')

    const response = await client
      .put('/products/99999')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'X', amount: 100 })

    response.assertStatus(404)
  })

  test('deve deletar produto existente', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_delete@teste.com')

    const created = await client
      .post('/products')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Para Deletar', amount: 1000 })

    const id = created.body().id

    const response = await client
      .delete(`/products/${id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.exists(response.body().message)
  })

  test('deve retornar 404 ao deletar produto inexistente', async ({ client }) => {
    const token = await getAuthToken(client, 'admin_del404@teste.com')

    const response = await client
      .delete('/products/99999')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })
})
