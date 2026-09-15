import { describe, expect, it } from "bun:test";

describe("Dev Login (/dev/login)", () => {
  it("deve carregar o arquivo HTML do dev login e conter Google Identity Services", async () => {
    const template = await Bun.file(new URL("../src/html/dev-login.html", import.meta.url)).text();
    expect(template).toContain("https://accounts.google.com/gsi/client");
    expect(template).toContain("handleCredentialResponse");
    expect(template).toContain("id-token");
    expect(template).toContain("copyToken");
  });
});
