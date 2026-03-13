export async function getAuthToken(client: any, email = 'admin@teste.com') {
  await client.post('/api/v1/auth/signup').json({
    fullName: 'Admin Teste',
    email,
    password: 'senha123',
    passwordConfirmation: 'senha123',
  })

  const login = await client.post('/api/v1/auth/login').json({
    email,
    password: 'senha123',
  })

  login.assertStatus(200)

  const token = login.body()?.data?.token

  if (!token) {
    throw new Error(`Token não encontrado: ${JSON.stringify(login.body())}`)
  }

  return token as string
}
