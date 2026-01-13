import test from 'ava'
import { BotEngine } from '../index'

test('create a fake bot engine', (t) => {
  const bot = new BotEngine('AstrisBot')

  t.true(bot instanceof BotEngine)
})
