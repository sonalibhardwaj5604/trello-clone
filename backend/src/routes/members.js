const router = require('express').Router();
const prisma = require('../db');

router.get('/board/:boardId', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      where: { boardId: Number(req.params.boardId) }
    });
    res.json(members);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;