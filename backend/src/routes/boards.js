const router = require('express').Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const boards = await prisma.board.findMany({ include: { members: true } });
    res.json(boards);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        members: true,
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { archived: false },
              orderBy: { position: 'asc' },
              include: {
                labels: true,
                assignments: { include: { member: true } },
                checklists: { include: { items: true } }
              }
            }
          }
        }
      }
    });
    res.json(board);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const board = await prisma.board.create({ data: req.body });
    res.json(board);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const board = await prisma.board.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(board);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;