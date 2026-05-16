import { Question } from "../types";

export interface QuizInput {
    name: string;
    code: number;
    questions: Question[];
}

export function validateQuizJson(jsonString: string): QuizInput {
    let parsed: any;
    try {
        parsed = JSON.parse(jsonString);
    } catch {
        throw new Error("El JSON es inválido.");
    }

    if (!parsed || typeof parsed !== 'object') {
        throw new Error("El JSON debe ser un objeto.");
    }

    if (typeof parsed.name !== 'string' || !parsed.name.trim()) {
        throw new Error("El campo 'name' debe ser un texto válido.");
    }

    if (typeof parsed.code !== 'number' || parsed.code < 1) {
        throw new Error("El campo 'code' debe ser un número válido mayor a 0.");
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("El campo 'questions' debe ser un array con al menos una pregunta.");
    }

    for (let i = 0; i < parsed.questions.length; i++) {
        const q = parsed.questions[i];
        if (typeof q.title !== 'string' || !q.title.trim()) {
            throw new Error(`La pregunta ${i + 1} debe tener un 'title' válido.`);
        }
        if (q.type !== 'multiple-choice' && q.type !== 'true-false') {
            throw new Error(`La pregunta ${i + 1} tiene un 'type' inválido (debe ser 'multiple-choice' o 'true-false').`);
        }
        if (!Array.isArray(q.options) || q.options.length === 0) {
            throw new Error(`La pregunta ${i + 1} debe tener un array de 'options'.`);
        }
        if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) {
            throw new Error(`La pregunta ${i + 1} tiene un 'answer' (índice) inválido.`);
        }
    }

    return parsed as QuizInput;
}
