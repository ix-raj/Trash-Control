const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || 'http://localhost:5000').replace(/\/$/, '');

const callAiService = async (path, payload) => {
  const response = await fetch(`${AI_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `AI service request failed with status ${response.status}`);
  }
  return data;
};

const optimizeRoute = async (req, res) => {
  try {
    const { points = [], start, region } = req.body || {};
    if (!Array.isArray(points) || points.some((point) => !Array.isArray(point) || point.length !== 2)) {
      return res.status(400).json({ success: false, message: 'points must be an array of [latitude, longitude] pairs' });
    }

    const data = await callAiService('/route-optimize', { points, start, region });
    res.json(data);
  } catch (error) {
    res.status(502).json({ success: false, message: `AI service unavailable: ${error.message}` });
  }
};

const predictWaste = async (req, res) => {
  try {
    const data = await callAiService('/predict', req.body || {});
    res.json(data);
  } catch (error) {
    res.status(502).json({ success: false, message: `AI service unavailable: ${error.message}` });
  }
};

const classifyWaste = async (req, res) => {
  try {
    const data = await callAiService('/classify', req.body || {});
    res.json(data);
  } catch (error) {
    res.status(502).json({ success: false, message: `AI service unavailable: ${error.message}` });
  }
};

const findHotspots = async (req, res) => {
  try {
    const data = await callAiService('/hotspots', req.body || {});
    res.json(data);
  } catch (error) {
    res.status(502).json({ success: false, message: `AI service unavailable: ${error.message}` });
  }
};

module.exports = { optimizeRoute, predictWaste, classifyWaste, findHotspots };
