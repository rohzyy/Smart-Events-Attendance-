const router = require('express').Router();
const Event = require('../models/Event');
const { verifyToken, authorize } = require('../middleware/auth');

// Create event (Lead or Faculty)
router.post('/create', verifyToken, authorize(['lead', 'faculty']), async (req, res) => {
  try {
    const { title, description, location, radius, requiredDuration, startTime, endTime } = req.body;
    
    const event = new Event({
      title,
      description,
      location,
      radius,
      requiredDuration,
      createdBy: req.user._id,
      startTime,
      endTime
    });
    
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all events
router.get('/', verifyToken, async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name email').sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific event
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name');
        if (!event) return res.status(404).json({error: "Event not found"});
        res.json(event);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Change event status
router.patch('/:id/status', verifyToken, authorize(['lead', 'faculty']), async (req, res) => {
  try {
      const { status } = req.body;
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({error: "Event not found"});
      
      event.status = status;
      await event.save();
      res.json(event);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

module.exports = router;
