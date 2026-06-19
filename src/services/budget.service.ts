/**
 * BudgetService — Savings goals and sub-goals CRUD.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  SavingsGoalSerialized,
  SubGoalSerialized,
  GoalCreatePayload,
  SubGoalCreatePayload,
} from "@/types";

export const BudgetService = {
  createGoal(payload: GoalCreatePayload): SavingsGoalSerialized {
    const now = new Date().toISOString();
    return {
      id: uuidv4(),
      goalName: payload.goalName,
      goalType: payload.goalType,
      targetAmount: payload.targetAmount,
      currentAmount: payload.currentAmount,
      targetDate: payload.targetDate,
      description: payload.description,
      parentId: payload.parentId,
      subGoals: [],
      subGoalsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  },

  updateGoal(
    goals: SavingsGoalSerialized[],
    goalId: string,
    data: Partial<Pick<SavingsGoalSerialized, "goalName" | "goalType" | "targetAmount" | "currentAmount" | "targetDate" | "description">>
  ): SavingsGoalSerialized[] {
    return goals.map((g) =>
      g.id === goalId
        ? { ...g, ...data, updatedAt: new Date().toISOString() }
        : g
    );
  },

  deleteGoal(goals: SavingsGoalSerialized[], goalId: string): SavingsGoalSerialized[] {
    return goals.filter((g) => g.id !== goalId);
  },

  createSubGoal(goalId: string, payload: SubGoalCreatePayload): SubGoalSerialized {
    const now = new Date().toISOString();
    return {
      id: uuidv4(),
      goalId,
      subGoalName: payload.subGoalName,
      targetAmount: payload.targetAmount,
      currentAmount: payload.currentAmount,
      createdAt: now,
      updatedAt: now,
    };
  },

  addSubGoalToGoal(
    goals: SavingsGoalSerialized[],
    goalId: string,
    subGoal: SubGoalSerialized
  ): SavingsGoalSerialized[] {
    return goals.map((g) => {
      if (g.id !== goalId) return g;
      const newSubGoals = [...g.subGoals, subGoal];
      return {
        ...g,
        subGoals: newSubGoals,
        subGoalsCount: newSubGoals.length,
        updatedAt: new Date().toISOString(),
      };
    });
  },

  updateSubGoal(
    goals: SavingsGoalSerialized[],
    subGoalId: string,
    data: Partial<Pick<SubGoalSerialized, "subGoalName" | "targetAmount" | "currentAmount">>
  ): SavingsGoalSerialized[] {
    return goals.map((g) => {
      const hasTarget = g.subGoals.some((sg) => sg.id === subGoalId);
      if (!hasTarget) return g;

      const updatedSubGoals = g.subGoals.map((sg) =>
        sg.id === subGoalId
          ? { ...sg, ...data, updatedAt: new Date().toISOString() }
          : sg
      );

      return {
        ...g,
        subGoals: updatedSubGoals,
        currentAmount: updatedSubGoals.reduce((sum, sg) => sum + sg.currentAmount, 0),
        updatedAt: new Date().toISOString(),
      };
    });
  },

  deleteSubGoal(
    goals: SavingsGoalSerialized[],
    goalId: string,
    subGoalId: string
  ): SavingsGoalSerialized[] {
    return goals.map((g) => {
      if (g.id !== goalId) return g;
      const newSubGoals = g.subGoals.filter((sg) => sg.id !== subGoalId);
      return {
        ...g,
        subGoals: newSubGoals,
        subGoalsCount: newSubGoals.length,
        currentAmount: newSubGoals.reduce((sum, sg) => sum + sg.currentAmount, 0),
        updatedAt: new Date().toISOString(),
      };
    });
  },
};
