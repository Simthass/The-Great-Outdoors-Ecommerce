import { Router } from "express";
import Review from "../models/Review.js";

const router = Router();

/**
 * GET /api/reviews
 * Optional query: q (search), sort ("asc"|"desc")
 */
router.get("/", async (req, res, next) => {
  try {
    const { q = "", sort = "desc" } = req.query;
    const find = q
      ? {
          $or: [
            { productId: new RegExp(q, "i") },
            { customerId: new RegExp(q, "i") },
            { reviewId: new RegExp(q, "i") },
          ],
        }
      : {};
    const reviews = await Review.find(find).sort({
      dateAdded: sort === "asc" ? 1 : -1,
    });
    res.json(reviews);
  } catch (e) {
    next(e);
  }
});

/** GET /api/reviews/:id  (id is reviewId like R001) */
router.get("/:id", async (req, res, next) => {
  try {
    const doc = await Review.findOne({ reviewId: req.params.id });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

/** POST /api/reviews  (create) */
router.post("/", async (req, res, next) => {
  try {
    const payload = req.body;
    // dateAdded can be string; normalize
    if (payload.dateAdded) payload.dateAdded = new Date(payload.dateAdded);
    const doc = await Review.create(payload);
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

/** PUT /api/reviews/:id (update by reviewId) */
router.put("/:id", async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.dateAdded) payload.dateAdded = new Date(payload.dateAdded);
    const doc = await Review.findOneAndUpdate(
      { reviewId: req.params.id },
      payload,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/reviews/:id */
router.delete("/:id", async (req, res, next) => {
  try {
    const out = await Review.findOneAndDelete({ reviewId: req.params.id });
    if (!out) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
