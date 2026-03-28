const router = require('express').Router();
const prisma = require('../db');

router.post('/', async (req, res) => {
  try {
    const { title, listId } = req.body;
    const last = await prisma.card.findFirst({ where: { listId }, orderBy: { position: 'desc' } });
    const position = last ? last.position + 1000 : 1000;
    const card = await prisma.card.create({
      data: { title, listId, position },
      include: { labels: true, assignments: { include: { member: true } }, checklists: { include: { items: true } } }
    });
    res.json(card);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { assignMemberId, removeMemberId, addLabel, removeLabelId, ...cardData } = req.body;

    if (assignMemberId) {
      await prisma.cardMember.upsert({
        where: { cardId_memberId: { cardId: Number(req.params.id), memberId: assignMemberId } },
        update: {},
        create: { cardId: Number(req.params.id), memberId: assignMemberId }
      });
    }
    if (removeMemberId) {
      await prisma.cardMember.delete({
        where: { cardId_memberId: { cardId: Number(req.params.id), memberId: removeMemberId } }
      });
    }
    if (addLabel) {
      await prisma.cardLabel.create({ data: { ...addLabel, cardId: Number(req.params.id) } });
    }
    if (removeLabelId) {
      await prisma.cardLabel.delete({ where: { id: removeLabelId } });
    }

    const card = await prisma.card.update({
      where: { id: Number(req.params.id) },
      data: cardData,
      include: { labels: true, assignments: { include: { member: true } }, checklists: { include: { items: true } } }
    });
    res.json(card);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.card.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/reorder', async (req, res) => {
  try {
    const { cards } = req.body;
    await Promise.all(cards.map(c => prisma.card.update({
      where: { id: c.id },
      data: { position: c.position, listId: c.listId }
    })));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/checklists', async (req, res) => {
  try {
    const checklist = await prisma.checklist.create({
      data: { title: req.body.title, cardId: Number(req.params.id) },
      include: { items: true }
    });
    res.json(checklist);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/checklists/:checklistId/items', async (req, res) => {
  try {
    const item = await prisma.checklistItem.create({
      data: { text: req.body.text, checklistId: Number(req.params.checklistId) }
    });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/checklist-items/:itemId', async (req, res) => {
  try {
    const item = await prisma.checklistItem.update({
      where: { id: Number(req.params.itemId) },
      data: req.body
    });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;