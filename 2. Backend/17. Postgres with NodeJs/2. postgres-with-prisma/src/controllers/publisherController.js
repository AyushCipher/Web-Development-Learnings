const publisherService = require("../services/publisherService");

// Create publisher
exports.createPublisher = async (req, res) => {
  try {
    const { name, email, country } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Publisher name is required" });
    }

    const publisher = await publisherService.createPublisher({
      name,
      email,
      country,
    });

    res.status(201).json(publisher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all publishers
exports.getAllPublishers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await publisherService.getAllPublishers(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get publisher by ID
exports.getPublisherById = async (req, res) => {
  try {
    const publisher = await publisherService.getPublisherById(
      parseInt(req.params.id)
    );
    res.json(publisher);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Update publisher
exports.updatePublisher = async (req, res) => {
  try {
    const { name, email, country } = req.body;

    const publisher = await publisherService.updatePublisher(
      parseInt(req.params.id),
      { name, email, country }
    );

    res.json(publisher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete publisher
exports.deletePublisher = async (req, res) => {
  try {
    await publisherService.deletePublisher(parseInt(req.params.id));
    res.json({ message: `Publisher deleted with id ${req.params.id}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get publishers by country
exports.getPublishersByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await publisherService.getPublishersByCountry(
      country,
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
