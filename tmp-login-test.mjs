const password = process.env.ADMIN_PASSWORD;

const res = await fetch("http://localhost:10000/api/auth/sign-in/email", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: "http://localhost:10000" },
  body: JSON.stringify({
    email: "tasniaislam112233@gmail.com",
    password,
    rememberMe: true,
  }),
});

const text = await res.text();
console.log("STATUS:", res.status);
console.log("BODY:", text.slice(0, 400));
console.log("SET-COOKIE:", res.headers.getSetCookie?.().map((c) => c.split(";")[0]).join(" | "));
