import crypto from "crypto";
import { getUsers, saveUsers } from "../utils/storage.js";
import { signUserToken } from "../utils/jwt.js";

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function issueAuthResponse(user, res, status = 200) {
  const token = signUserToken(user);
  res.status(status).json({ token, user: sanitizeUser(user) });
}

export function signup(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });
  if (String(password).length < 4) return res.status(400).json({ message: "Password too short" });

  const users = getUsers();
  const exists = users.some((u) => u.username.toLowerCase() === String(username).toLowerCase());
  if (exists) return res.status(409).json({ message: "Username already exists" });

  const user = {
    id: crypto.randomUUID(),
    username: String(username).trim(),
    password: String(password),
    role: "user",
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);
  issueAuthResponse(user, res, 201);
}

const DEMO_FACULTY_USER = {
  id: "seed-university-faculty",
  username: "dr.sharma_manit",
  email: "dr.sharma@manit.ac.in",
  password: "password123",
  role: "university",
  fullName: "Dr. Alok Sharma",
  institution: "MANIT Bhopal",
  lab: "Water Resources & Smart Infrastructure Lab",
  designation: "Professor & Lab Director"
};

export function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  const users = [...getUsers(), DEMO_FACULTY_USER];
  const input = String(username).trim().toLowerCase();

  // Match username, email, or email prefix interchangeably
  const user = users.find((u) => {
    const uName = String(u.username || "").toLowerCase();
    const uEmail = String(u.email || "").toLowerCase();
    return (
      uName === input ||
      (uEmail && uEmail === input) ||
      (input.includes("@") && uName === input.split("@")[0])
    );
  });

  if (!user) {
    return res.status(404).json({ 
      code: "ACCOUNT_NOT_FOUND",
      message: "Account not found. Please click 'Create Account' to register." 
    });
  }

  if (user.password !== String(password)) {
    return res.status(401).json({ 
      code: "INVALID_CREDENTIALS",
      message: "Invalid password for this account. Please try again." 
    });
  }

  issueAuthResponse(user, res, 200);
}

export function me(req, res) {
  res.json({ user: req.user });
}

export function logout(_req, res) {
  res.json({ ok: true });
}
