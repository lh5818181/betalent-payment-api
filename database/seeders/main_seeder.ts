import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/gateway'
import Product from '#models/product'

export default class extends BaseSeeder {
  async run() {
    await Gateway.createMany([
      { name: 'Gateway 1', isActive: true, priority: 1 },
      { name: 'Gateway 2', isActive: true, priority: 2 },
    ])

    await Product.createMany([
      { name: 'Teclado Mecânico', amount: 15000 },
      { name: 'Mouse Gamer', amount: 8000 },
      { name: 'Monitor 144hz', amount: 120000 },
    ])
  }
}
