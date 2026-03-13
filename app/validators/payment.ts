import vine from '@vinejs/vine'

export const createPaymentValidator = vine.compile(
  vine.object({
    clientId: vine.number(),
    products: vine
      .array(
        vine.object({
          id: vine.number().exists({ table: 'products', column: 'id' }),
          quantity: vine.number().min(1),
        })
      )
      .minLength(1),
    cardNumber: vine.string().minLength(16).maxLength(16),
    cvv: vine.string().minLength(3).maxLength(4),
  })
)
