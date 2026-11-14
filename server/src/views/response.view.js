// Shapes standardized JSON response payloads sent to the client.

export const ResponseView = {
  success({ data, warnings = [] }) {
    return {
      ok: true,
      data,
      warnings,
    };
  },

  failure({ code, message }) {
    return {
      ok: false,
      error: {
        code,
        message,
      },
    };
  },
};
