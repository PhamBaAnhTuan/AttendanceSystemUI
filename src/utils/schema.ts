import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const todos = pgTable("todos", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	completed: boolean("completed").notNull().default(false),
	category: text("category").notNull().default("default"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTodoSchema = createInsertSchema(todos)
	.pick({
		title: true,
		description: true,
		category: true,
	})
	.extend({
		title: z.string().min(1, "Title is required").max(100),
		description: z.string().max(500).optional(),
		category: z.string().min(1).max(50),
	});

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;
