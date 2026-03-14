import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/gateway'
import Product from '#models/product'

export default class extends BaseSeeder {
  async run() {
    await Gateway.firstOrCreate({ name: 'Gateway 1' }, { isActive: true, priority: 1 })

    await Gateway.firstOrCreate({ name: 'Gateway 2' }, { isActive: true, priority: 2 })

    await Product.firstOrCreate({ name: 'Teclado Mecânico' }, { amount: 15000 })

    await Product.firstOrCreate({ name: 'Mouse Gamer' }, { amount: 8000 })

    await Product.firstOrCreate({ name: 'Monitor 144hz' }, { amount: 120000 })
  }
}
