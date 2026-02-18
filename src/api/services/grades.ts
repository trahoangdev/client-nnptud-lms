/**
 * Grades API service
 */

import { api } from "../client";
import type { GradeItem } from "../types";

export const gradesService = {
  /** POST /grades — create/update grade */
  grade: (submissionId: number, score: number) =>
    api.post<GradeItem>("/grades", { submissionId, score }),
};
