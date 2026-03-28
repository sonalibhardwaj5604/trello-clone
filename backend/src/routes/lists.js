 const router = require('express').Router();
const prisma = require('../db');

router.post('/', async (req, res) => {
  try {
    const { title, boardId } = req.body;
    const last = await prisma.list.findFirst({ where: { boardId }, orderBy: { position: 'desc' } });
    const position = last ? last.position + 1000 : 1000;
    const list = await prisma.list.create({ data: { title, boardId, position } });
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const list = await prisma.list.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.list.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/reorder', async (req, res) => {
  try {
    const { lists } = req.body;
    await Promise.all(lists.map(l => prisma.list.update({
      where: { id: l.id },
      data: { position: l.position }
    })));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;