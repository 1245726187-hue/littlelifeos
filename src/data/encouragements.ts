export const ENCOURAGEMENTS = [
  '慢一点也没关系。',
  '你已经做得很好了。',
  '今天也留下了一点痕迹。',
  '照顾自己也是一种生产力。',
  '允许自己暂时什么都不做。',
  '你的存在本身就是意义。',
  '今天也是认真生活的一天。',
  '不必每天都光芒万丈。',
  '累了就休息，这不叫放弃。',
  '你值得被温柔对待。',
  '小步前进也是前进。',
  '生活不只有效率和目标。',
  '记得呼吸。',
  '你比自己想象的更有力量。',
  '今天也辛苦了。',
  '温柔地对待自己吧。',
  '每一个今天都值得被记录。',
  '没有什么比照顾好自己更重要。',
  '你不需要证明什么。',
  '在这里，没有评判。',
]

export function getRandomEncouragement(): string {
  const index = Math.floor(Math.random() * ENCOURAGEMENTS.length)
  return ENCOURAGEMENTS[index]
}

export function getDailyEncouragement(): string {
  const today = new Date().toISOString().split('T')[0]
  const seed = today.split('-').reduce((acc, n) => acc + parseInt(n), 0)
  const index = seed % ENCOURAGEMENTS.length
  return ENCOURAGEMENTS[index]
}
