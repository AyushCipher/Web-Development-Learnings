const libraryMemberService = require("../services/libraryMemberService");

// Create member
exports.createMember = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: "Name and email are required" });
    }

    const member = await libraryMemberService.createMember({
      name,
      email,
      phone,
      address,
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await libraryMemberService.getAllMembers(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
  try {
    const member = await libraryMemberService.getMemberById(
      parseInt(req.params.id)
    );
    res.json(member);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const { name, email, phone, address, isActive } = req.body;

    const member = await libraryMemberService.updateMember(
      parseInt(req.params.id),
      { name, email, phone, address, isActive }
    );

    res.json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete (deactivate) member
exports.deleteMember = async (req, res) => {
  try {
    await libraryMemberService.deleteMember(parseInt(req.params.id));
    res.json({ message: `Member deactivated with id ${req.params.id}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get active members
exports.getActiveMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await libraryMemberService.getActiveMembers(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search members
exports.searchMembers = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const result = await libraryMemberService.searchMembers(query, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
