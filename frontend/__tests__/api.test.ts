import { fetchProducts, API_BASE } from "../lib/api";

describe("fetchProducts", () => {
  const origFetch = global.fetch;

  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => [{ id: 1, name: "Chicken", price: 12.99 }],
      status: 200,
    }));
  });

  afterEach(() => {
    global.fetch = origFetch as any;
  });

  it("calls the products endpoint and returns data", async () => {
    const data = await fetchProducts();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toMatchObject({ id: 1, name: "Chicken" });
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      `${API_BASE}/products`
    );
  });
});

