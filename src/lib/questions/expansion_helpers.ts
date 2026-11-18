// Shared framework bundles for the expansion bank items.
// Each bundle keeps the six-framework annotation consistent per cognitive move.
import { Question } from "./types";

export type Fw = Pick<Question, "bloom" | "dok" | "solo" | "marzano" | "ubd" | "udl" | "diff">;

export const FW = {
  rem1: { bloom: "Remember", dok: 1, solo: "Unistructural", marzano: "Retrieval", ubd: "Explain", udl: "Representation", diff: 1 } as Fw,
  und1: { bloom: "Understand", dok: 1, solo: "Unistructural", marzano: "Comprehension", ubd: "Explain", udl: "Representation", diff: 1 } as Fw,
  und2: { bloom: "Understand", dok: 2, solo: "Multistructural", marzano: "Comprehension", ubd: "Explain", udl: "Representation", diff: 2 } as Fw,
  app1: { bloom: "Apply", dok: 1, solo: "Unistructural", marzano: "Comprehension", ubd: "Apply", udl: "Action and Expression", diff: 1 } as Fw,
  app2: { bloom: "Apply", dok: 2, solo: "Relational", marzano: "Comprehension", ubd: "Apply", udl: "Action and Expression", diff: 2 } as Fw,
  app3: { bloom: "Apply", dok: 3, solo: "Relational", marzano: "Knowledge Utilization", ubd: "Apply", udl: "Action and Expression", diff: 3 } as Fw,
  ana2: { bloom: "Analyze", dok: 2, solo: "Relational", marzano: "Analysis", ubd: "Interpret", udl: "Representation", diff: 2 } as Fw,
  ana3: { bloom: "Analyze", dok: 3, solo: "Relational", marzano: "Analysis", ubd: "Interpret", udl: "Representation", diff: 3 } as Fw,
  ev2: { bloom: "Evaluate", dok: 2, solo: "Relational", marzano: "Analysis", ubd: "Perspective", udl: "Representation", diff: 2 } as Fw,
  ev3: { bloom: "Evaluate", dok: 3, solo: "Extended Abstract", marzano: "Analysis", ubd: "Perspective", udl: "Representation", diff: 3 } as Fw,
  cre2: { bloom: "Create", dok: 2, solo: "Multistructural", marzano: "Knowledge Utilization", ubd: "Self-Knowledge", udl: "Action and Expression", diff: 2 } as Fw,
  cre3: { bloom: "Create", dok: 3, solo: "Relational", marzano: "Knowledge Utilization", ubd: "Apply", udl: "Action and Expression", diff: 3 } as Fw,
};
