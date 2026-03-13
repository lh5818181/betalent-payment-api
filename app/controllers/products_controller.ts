import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'

export default class ProductsController {
  async index({ response }: HttpContext) {
    const products = await Product.all()
    return response.ok(products)
  }

  async show({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) return response.notFound({ message: 'Produto não encontrado.' })
    return response.ok(product)
  }

  async store({ request, response }: HttpContext) {
    const { name, amount } = request.only(['name', 'amount'])
    const product = await Product.create({ name, amount })
    return response.created(product)
  }

  async update({ params, request, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) return response.notFound({ message: 'Produto não encontrado.' })

    const { name, amount } = request.only(['name', 'amount'])
    product.merge({ name, amount })
    await product.save()
    return response.ok(product)
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) return response.notFound({ message: 'Produto não encontrado.' })

    await product.delete()
    return response.ok({ message: 'Produto removido com sucesso.' })
  }
}
