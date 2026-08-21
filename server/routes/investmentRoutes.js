const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getStocksSearch,
  getStockDetails,
  getEducationalContent,
  getAllModules,
} = require("../controllers/investmentController");

const router = express.Router();

router.use(authMiddleware);

router.get("/stocks/search", getStocksSearch);
router.get("/stocks/:symbol", getStockDetails);
router.get("/modules", getAllModules);
router.get("/educational/:category", getEducationalContent);

module.exports = router;
