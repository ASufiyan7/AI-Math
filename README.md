# 🧮 AI Handwritten Math Solver

> An AI-powered application that recognizes handwritten mathematical equations from a drawing canvas and generates solved, beautifully rendered mathematical solutions in real time.

![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini-Vision-purple?style=flat-square)

---

# 🎯 Problem Statement

Solving handwritten mathematical expressions digitally is often cumbersome and requires manual typing into calculators or symbolic mathematics tools.

This project provides a natural workflow where users can simply draw equations on a digital canvas and receive solved results instantly.

The system combines computer vision capabilities from Gemini Vision with a modern web interface to create a seamless handwritten mathematics solving experience.

---

# 🚀 Project Highlights

✅ Handwritten Equation Recognition

✅ Gemini Vision Integration

✅ Real-Time Equation Solving

✅ Interactive Drawing Canvas

✅ Mathematical Expression Rendering with MathJax

✅ Responsive React Frontend

✅ FastAPI Backend Architecture

---

# 🏗️ System Architecture

```text
User Draws Equation
        │
        ▼

 Interactive Canvas
      (React)

        │
        ▼

 Canvas Image Export

        │
        ▼

 FastAPI Backend

        │
        ▼

 Gemini Vision Model

        │
        ▼

 Equation Recognition

        │
        ▼

 Solution Generation

        │
        ▼

 MathJax Rendering

        │
        ▼

 Display Result
```

---

# ✨ Core Features

### ✍️ Interactive Drawing Canvas

Users can write mathematical expressions naturally using a mouse, stylus, or touch input.

---

### 🤖 AI-Powered Equation Recognition

Gemini Vision analyzes the handwritten image and extracts mathematical expressions with high accuracy.

---

### 🧮 Mathematical Problem Solving

Supports:

* Arithmetic
* Algebra
* Linear Equations
* Expressions
* Multi-Step Problems
* Basic Mathematical Reasoning

---

### 📐 LaTeX Rendering

Solutions are rendered using MathJax, providing clean academic-quality mathematical notation.

---

### 🖱️ Draggable Solution Output

Generated equations and solutions can be repositioned dynamically within the workspace.

---

# ⚙️ How It Works

## Step 1

The user writes a mathematical expression on the canvas.

---

## Step 2

The canvas content is converted into an image and sent to the FastAPI backend.

---

## Step 3

Gemini Vision processes the image and identifies the mathematical expression.

Example:

```text
2x + 5 = 15
```

---

## Step 4

The model generates a structured solution.

Example:

```text
2x = 10

x = 5
```

---

## Step 5

The response is returned to the frontend and rendered using MathJax.

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Mantine UI
* MathJax

## Backend

* Python
* FastAPI
* Gemini Vision API

---

# 📂 Project Structure

```text
frontend/
├── React
├── TypeScript
├── Canvas Components
├── MathJax Renderer

backend/
├── FastAPI
├── Gemini Integration
├── API Routes
├── Response Processing
```

---

# 💡 Example Workflow

Input:

```text
3x + 9 = 24
```

Output:

```text
3x = 15

x = 5
```

Rendered automatically using MathJax.

---

# 🚀 Future Improvements

* Step-by-step solution explanations
* Multi-line equation support
* Geometry problem solving
* Calculus support
* OCR confidence scoring
* User history and saved solutions
* Mobile application version
