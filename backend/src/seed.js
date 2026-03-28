const prisma = require('./db');

async function main() {
  const board = await prisma.board.create({
    data: {
      title: 'My First Project',
      bgColor: '#0052cc',
      members: {
        create: [
          { name: 'Sonali Bhardwaj', avatar: 'SB', color: '#0052cc' },
          { name: 'Priya Singh',     avatar: 'PS', color: '#e6007a' },
          { name: 'Arjun Mehta',    avatar: 'AM', color: '#00875a' },
          { name: 'Neha Sharma',    avatar: 'NS', color: '#ff8b00' },
        ]
      }
    },
    include: { members: true }
  });

  const listData = [
    { title: 'To Do',       position: 1000 },
    { title: 'In Progress', position: 2000 },
    { title: 'Review',      position: 3000 },
    { title: 'Done',        position: 4000 },
  ];

  for (const l of listData) {
    await prisma.list.create({
      data: {
        ...l,
        boardId: board.id,
        cards: {
          create: [
            {
              title: `Sample card in ${l.title}`,
              description: 'This is a sample card.',
              position: 1000,
              labels: { create: [{ color: '#0052cc', text: 'Feature' }] }
            },
            {
              title: `Another task in ${l.title}`,
              position: 2000,
              labels: { create: [{ color: '#e6007a', text: 'Bug' }] }
            }
          ]
        }
      }
    });
  }

  console.log('✅ Seed complete! Board ID:', board.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());