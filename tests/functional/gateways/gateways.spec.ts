import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Gateway from '#models/gateway'
import { getAuthToken } from '../../helpers/auth.ts'

test.group('Gateways', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    await Gateway.query().delete()

    await Gateway.createMany([
      { name: 'Gateway 1', isActive: true, priority: 1 },
      { name: 'Gateway 2', isActive: true, priority: 2 },
    ])

    return () => db.rollbackGlobalTransaction()
  })

  test('deve listar gateways ordenados por prioridade', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_gw@teste.com')

    const response = await client.get('/gateways').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.isArray(response.body())

    const priorities: number[] = response.body().map((g: any) => g.priority)
    const sorted = [...priorities].sort((a, b) => a - b)
    assert.deepEqual(priorities, sorted)
  })

  test('deve retornar 401 ao listar gateways sem autenticação', async ({ client }) => {
    const response = await client.get('/gateways')
    response.assertStatus(401)
  })

  test('deve desativar gateway ativo', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_toggle@teste.com')

    const lista = await client.get('/gateways').header('Authorization', `Bearer ${token}`)

    const gateway = lista.body().find((g: any) => g.name === 'Gateway 1')
    assert.exists(gateway)

    const response = await client
      .patch(`/gateways/${gateway.id}/toggle`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().isActive, false)
  })

  test('deve reativar gateway inativo', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_reactivate@teste.com')

    const lista = await client.get('/gateways').header('Authorization', `Bearer ${token}`)

    const gateway = lista.body()[0]

    await client.patch(`/gateways/${gateway.id}/toggle`).header('Authorization', `Bearer ${token}`)

    const response = await client
      .patch(`/gateways/${gateway.id}/toggle`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().isActive, true)
  })

  test('deve retornar 404 ao tentar toggle em gateway inexistente', async ({ client }) => {
    const token = await getAuthToken(client, 'admin_toggle404@teste.com')

    const response = await client
      .patch('/gateways/99999/toggle')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })

  test('deve alterar prioridade do gateway', async ({ client, assert }) => {
    const token = await getAuthToken(client, 'admin_prio@teste.com')

    const lista = await client.get('/gateways').header('Authorization', `Bearer ${token}`)
    const gateway = lista.body().find((g: any) => g.name === 'Gateway 2')

    const response = await client
      .patch(`/gateways/${gateway.id}/priority`)
      .header('Authorization', `Bearer ${token}`)
      .json({ priority: 3 })

    response.assertStatus(200)
    assert.equal(response.body().priority, 3)
  })

  test('deve retornar 404 ao alterar prioridade de gateway inexistente', async ({ client }) => {
    const token = await getAuthToken(client, 'admin_prio404@teste.com')

    const response = await client
      .patch('/gateways/99999/priority')
      .header('Authorization', `Bearer ${token}`)
      .json({ priority: 1 })

    response.assertStatus(404)
  })

  test('deve retornar 401 ao tentar toggle sem autenticação', async ({ client }) => {
    const response = await client.patch('/gateways/1/toggle')
    response.assertStatus(401)
  })
})
