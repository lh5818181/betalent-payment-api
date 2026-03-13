import type { HttpContext } from '@adonisjs/core/http'
import { createPaymentValidator } from '#validators/payment'
import PaymentService from '#services/payment_service'
import { inject } from '@adonisjs/core'

@inject()
export default class PaymentsController {
  constructor(protected paymentService: PaymentService) {}

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPaymentValidator)

    try {
      const result = await this.paymentService.process(payload)
      return response.created(result)
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND' || error.status === 404) {
        return response.notFound({
          message: 'Cliente não encontrado',
        })
      }

      return response.badRequest({
        message: 'Não foi possível processar o pagamento em nenhum dos provedores.',
        error: error.message,
      })
    }
  }
}
