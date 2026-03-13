import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

test.group('Auth', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('deve criar conta com dados válidos', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Novo Usuário',
      email: 'novo@teste.com',
      password: 'senha123',
      passwordConfirmation: 'senha123',
    })

    response.assertStatus(201)
    assert.exists(response.body().data.token)
  })

  test('deve retornar 422 ao criar conta sem email', async ({ client }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Sem Email',
      password: 'senha123',
      email: '',
      passwordConfirmation: 'senha123',
    })

    response.assertStatus(422)
  })

  test('deve retornar 422 ao criar conta com email duplicado', async ({ client }) => {
    await client.post('/api/v1/auth/signup').json({
      fullName: 'Usuário 1',
      email: 'duplicado@teste.com',
      password: 'senha123',
      passwordConfirmation: 'senha123',
    })

    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Usuário 2',
      email: 'duplicado@teste.com',
      password: 'outrasenha',
      passwordConfirmation: 'senha123',
    })

    response.assertStatus(422)
  })

  test('deve logar com credenciais válidas e retornar token', async ({ client, assert }) => {
    await client.post('/api/v1/auth/signup').json({
      fullName: 'Login Teste',
      email: 'login@teste.com',
      password: 'senha123',
      passwordConfirmation: 'senha123',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'login@teste.com',
      password: 'senha123',
    })

    response.assertStatus(200)
    assert.exists(response.body().data.token)
  })

  test('deve retornar 401 com senha incorreta', async ({ client }) => {
    await client.post('/api/v1/auth/signup').json({
      fullName: 'Auth Fail',
      email: 'fail@teste.com',
      password: 'senha123',
      passwordConfirmation: 'senha123',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'fail@teste.com',
      password: 'senhaerrada',
    })

    response.assertStatus(401)
  })

  test('deve retornar 401 com email inexistente', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'naoexiste@teste.com',
      password: 'qualquercoisa',
    })

    response.assertStatus(401)
  })

  test('deve retornar 422 sem email no login', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      password: 'senha123',
      email: '',
    })

    response.assertStatus(422)
  })

  test('deve fazer logout e invalidar token', async ({ client }) => {
    await client.post('/api/v1/auth/signup').json({
      fullName: 'Logout Teste',
      email: 'logout@teste.com',
      password: 'senha123',
      passwordConfirmation: 'senha123',
    })

    const login = await client.post('/api/v1/auth/login').json({
      email: 'logout@teste.com',
      password: 'senha123',
    })

    const token = login.body().data.token

    const response = await client
      .post('/api/v1/auth/logout')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })

  test('deve retornar 401 ao tentar logout sem token', async ({ client }) => {
    const response = await client.post('/api/v1/auth/logout')
    response.assertStatus(401)
  })
})
