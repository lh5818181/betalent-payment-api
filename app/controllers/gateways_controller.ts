import type { HttpContext } from '@adonisjs/core/http'
import Gateway from '#models/gateway'

export default class GatewaysController {
  async index({ response }: HttpContext) {
    const gateways = await Gateway.query().orderBy('priority', 'asc')
    return response.ok(gateways)
  }

  async toggle({ params, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) return response.notFound({ message: 'Gateway não encontrado.' })

    gateway.isActive = !gateway.isActive
    await gateway.save()
    return response.ok(gateway)
  }

  async updatePriority({ params, request, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) return response.notFound({ message: 'Gateway não encontrado.' })

    const { priority } = request.only(['priority'])
    gateway.priority = priority
    await gateway.save()
    return response.ok(gateway)
  }
}
