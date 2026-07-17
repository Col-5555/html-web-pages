// Translates challenges between the managers-app form/list shape and the NestJS
// API shape. The two disagree on field names, nesting, and types, so this is the
// seam that lets the pages/components stay unchanged while the data comes from a
// real backend.
//
//   form / list                          NestJS API
//   -----------------------------------  -------------------------------------------
//   id, level, createdAt (YYYY-MM-DD)     _id, difficulty, createdAt (ISO)
//   code.functionName / language / body   code.function_name / code_text[] / inputs[]
//   tests[{type,name,value,output,weight}] tests[{weight,inputs[{name,value}],expected_output}]

// The editor uses CodeMirror language ids; the API stores short codes.
const LANG_TO_API = { javascript: "js", python: "py" };
const LANG_FROM_API = { js: "javascript", py: "python" };

// A test's `type` tags whether its value/output are numbers or strings; the form
// keeps them as strings, the API stores them as real JSON values.
const coerce = (value, type) => (type === "number" ? Number(value) : value);
const inferType = (value) => (typeof value === "number" ? "number" : "string");

// Format an ISO timestamp as YYYY-MM-DD (what the dashboard table shows).
const toDateOnly = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

// form → NestJS create/update DTO.
export function toApi(form) {
  const tests = (form.tests ?? []).map((t) => ({
    weight: t.weight,
    inputs: [{ name: t.name, value: coerce(t.value, t.type) }],
    output: coerce(t.output, t.type),
  }));

  // Derive the function's input definitions from the tests (deduped by name).
  const inputs = [];
  const seen = new Set();
  for (const t of form.tests ?? []) {
    if (!seen.has(t.name)) {
      seen.add(t.name);
      inputs.push({ name: t.name, type: t.type });
    }
  }

  return {
    title: form.title,
    category: form.category,
    description: form.description,
    level: form.level,
    code: {
      function_name: form.code.functionName,
      code_text: [
        {
          language: LANG_TO_API[form.code.language] ?? "js",
          text: form.code.body ?? "",
        },
      ],
      inputs,
    },
    tests,
  };
}

// NestJS document → form/list shape.
export function fromApi(doc) {
  const codeText = doc.code?.code_text?.[0] ?? {};
  return {
    id: doc._id,
    title: doc.title,
    category: doc.category,
    level: doc.difficulty,
    description: doc.description,
    createdAt: toDateOnly(doc.createdAt),
    code: {
      functionName: doc.code?.function_name ?? "",
      language: LANG_FROM_API[codeText.language] ?? "javascript",
      body: codeText.content ?? "",
    },
    tests: (doc.tests ?? []).map((t) => {
      const input = t.inputs?.[0] ?? {};
      return {
        type: inferType(input.value),
        name: input.name ?? "",
        value: input.value != null ? String(input.value) : "",
        output: t.expected_output != null ? String(t.expected_output) : "",
        weight: t.weight,
      };
    }),
  };
}
