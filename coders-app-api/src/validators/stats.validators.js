import Joi from "joi";

// Optional date-range filter for the heatmap. Both are ISO dates (YYYY-MM-DD)
// and either may be omitted; the "end must not precede start" rule only applies
// when start_date is actually present (otherwise the ref has nothing to compare).
export const heatmapQuerySchema = Joi.object({
  start_date: Joi.date().iso(),
  end_date: Joi.date()
    .iso()
    .when("start_date", {
      is: Joi.exist(),
      then: Joi.date().iso().min(Joi.ref("start_date")),
    }),
});
