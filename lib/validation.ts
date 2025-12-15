export type SafeParseSuccess<T> = { success: true; data: T };
export type SafeParseError = { success: false; error: string };
export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseError;

export interface Schema<T> {
  parse(input: unknown): T;
  safeParse(input: unknown): SafeParseResult<T>;
  nullable(): Schema<T | null>;
}

abstract class BaseSchema<T> implements Schema<T> {
  parse(input: unknown): T {
    const result = this.safeParse(input);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  }

  abstract safeParse(input: unknown): SafeParseResult<T>;

  nullable(): Schema<T | null> {
    return new NullableSchema(this);
  }
}

class NullableSchema<T> extends BaseSchema<T | null> {
  constructor(private readonly inner: Schema<T>) {
    super();
  }

  safeParse(input: unknown): SafeParseResult<T | null> {
    if (input === null) {
      return { success: true, data: null };
    }
    return this.inner.safeParse(input);
  }
}

class StringSchema extends BaseSchema<string> {
  constructor(
    private readonly opts: {
      trim?: boolean;
      min?: number;
      message?: string;
    } = {}
  ) {
    super();
  }

  trim() {
    return new StringSchema({ ...this.opts, trim: true });
  }

  min(length: number, message?: string) {
    return new StringSchema({ ...this.opts, min: length, message });
  }

  safeParse(input: unknown): SafeParseResult<string> {
    if (typeof input !== "string") {
      return { success: false, error: "Expected string" };
    }

    const value = this.opts.trim ? input.trim() : input;

    if (this.opts.min !== undefined && value.length < this.opts.min) {
      return {
        success: false,
        error:
          this.opts.message ?? `Expected at least ${this.opts.min} characters`,
      };
    }

    return { success: true, data: value };
  }
}

class NumberSchema extends BaseSchema<number> {
  safeParse(input: unknown): SafeParseResult<number> {
    if (typeof input !== "number" || Number.isNaN(input)) {
      return { success: false, error: "Expected number" };
    }
    return { success: true, data: input };
  }
}

class LiteralSchema<T extends string | number | boolean> extends BaseSchema<T> {
  constructor(private readonly expected: T) {
    super();
  }

  safeParse(input: unknown): SafeParseResult<T> {
    if (input !== this.expected) {
      return { success: false, error: `Expected literal ${String(this.expected)}` };
    }
    return { success: true, data: this.expected };
  }
}

class ArraySchema<T> extends BaseSchema<T[]> {
  constructor(private readonly inner: Schema<T>) {
    super();
  }

  safeParse(input: unknown): SafeParseResult<T[]> {
    if (!Array.isArray(input)) {
      return { success: false, error: "Expected array" };
    }

    const results: T[] = [];

    for (let i = 0; i < input.length; i++) {
      const res = this.inner.safeParse(input[i]);
      if (!res.success) {
        return { success: false, error: `Invalid element at index ${i}: ${res.error}` };
      }
      results.push(res.data);
    }

    return { success: true, data: results };
  }
}

type Shape = Record<string, Schema<any>>;

type InferShape<S extends Shape> = {
  [K in keyof S]: S[K] extends Schema<infer U> ? U : never;
};

class ObjectSchema<S extends Shape> extends BaseSchema<InferShape<S>> {
  constructor(private readonly shape: S) {
    super();
  }

  safeParse(input: unknown): SafeParseResult<InferShape<S>> {
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
      return { success: false, error: "Expected object" };
    }

    const output: Partial<InferShape<S>> = {};

    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key];
      const value = (input as Record<string, unknown>)[key];
      const res = schema.safeParse(value);
      if (!res.success) {
        return { success: false, error: `Invalid field '${key}': ${res.error}` };
      }
      output[key as keyof S] = res.data as InferShape<S>[keyof S];
    }

    return { success: true, data: output as InferShape<S> };
  }
}

class UnionSchema<S extends readonly Schema<any>[]> extends BaseSchema<
  S[number] extends Schema<infer U> ? U : never
> {
  constructor(private readonly schemas: S) {
    super();
  }

  safeParse(input: unknown): SafeParseResult<S[number] extends Schema<infer U> ? U : never> {
    const errors: string[] = [];

    for (const schema of this.schemas) {
      const res = schema.safeParse(input);
      if (res.success) return res;
      errors.push(res.error);
    }

    return { success: false, error: `Input did not match any schema: ${errors.join("; ")}` };
  }
}

export const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  literal: <T extends string | number | boolean>(value: T) =>
    new LiteralSchema(value),
  array: <TSchema extends Schema<any>>(schema: TSchema) => new ArraySchema(schema),
  object: <S extends Shape>(shape: S) => new ObjectSchema(shape),
  union: <S extends readonly Schema<any>[]>(schemas: S) => new UnionSchema(schemas),
};

export type Infer<TSchema extends Schema<any>> = TSchema extends Schema<infer U>
  ? U
  : never;
