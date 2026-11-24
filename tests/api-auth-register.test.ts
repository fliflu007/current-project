import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/register/route";

const { mockSignUp, mockCreateClient, mockInsert } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
  mockCreateClient: vi.fn(),
  mockInsert: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("@/db", () => ({
  db: {
    insert: mockInsert,
  },
}));

const mockUser = {
  id: "user-123",
  email: "test@example.com",
};

const mockCompany = {
  id: "company-123",
  name: "Test Company",
};

const mockProfile = {
  id: "user-123",
  companyId: "company-123",
  role: "admin",
};

function createRequest(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockDatabaseSuccess() {
  const mockReturning = vi.fn();

  mockInsert.mockImplementation(() => ({
    values: vi.fn().mockReturnValue({
      returning: mockReturning,
    }),
  }));

  mockReturning
    .mockResolvedValueOnce([mockCompany])
    .mockResolvedValueOnce([mockProfile]);
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateClient.mockResolvedValue({
      auth: {
        signUp: mockSignUp,
      },
    });

    mockSignUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockDatabaseSuccess();
  });

  it("returns 400 when the request contains invalid JSON", async () => {
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: "{invalid-json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("returns 400 when validation fails", async () => {
    const response = await POST(
      createRequest({
        companyName: "",
        email: "invalid-email",
        password: "123",
      }),
    );

    expect(response.status).toBe(400);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("returns 400 when Supabase signup fails", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: "Signup failed" },
    });

    const response = await POST(
      createRequest({
        companyName: "Test Company",
        email: "test@example.com",
        password: "password123",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 500 when Supabase throws", async () => {
    mockCreateClient.mockRejectedValue(new Error("Supabase connection failed"));

    const response = await POST(
      createRequest({
        companyName: "Test Company",
        email: "test@example.com",
        password: "password123",
      }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when company insertion throws", async () => {
    mockInsert.mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });

    const response = await POST(
      createRequest({
        companyName: "Test Company",
        email: "test@example.com",
        password: "password123",
      }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when profile insertion throws", async () => {
    const mockReturning = vi.fn();

    mockInsert.mockImplementation(() => ({
      values: vi.fn().mockReturnValue({
        returning: mockReturning,
      }),
    }));

    mockReturning
      .mockResolvedValueOnce([mockCompany])
      .mockRejectedValueOnce(new Error("Profile insertion failed"));

    const response = await POST(
      createRequest({
        companyName: "Test Company",
        email: "test@example.com",
        password: "password123",
      }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when company insertion returns no row", async () => {
    const mockReturning = vi.fn().mockResolvedValueOnce([]);

    mockInsert.mockImplementation(() => ({
      values: vi.fn().mockReturnValue({
        returning: mockReturning,
      }),
    }));

    const response = await POST(
      createRequest({
        companyName: "Test Company",
        email: "test@example.com",
        password: "password123",
      }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when profile insertion returns no row", async () => {
    const mockReturning = vi
      .fn()
      .mockResolvedValueOnce([mockCompany])
      .mockResolvedValueOnce([]);

    mockInsert.mockImplementation(() => ({
      values: vi.fn().mockReturnValue({
        returning: mockReturning,
      }),
    }));

    const response = await POST(
      createRequest({
        companyName: "Test Company",
        email: "test@example.com",
        password: "password123",
      }),
    );

    expect(response.status).toBe(500);
  });

  it("successfully registers a user, company and admin profile", async () => {
    const response = await POST(
      createRequest({
        companyName: "Test Company",
        email: "test@example.com",
        password: "password123",
      }),
    );

    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.error).toBeNull();
    expect(result.data.user.id).toBe("user-123");
    expect(result.data.company.id).toBe("company-123");
    expect(result.data.profile.role).toBe("admin");

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });

    expect(mockInsert).toHaveBeenCalledTimes(2);
  });
});
