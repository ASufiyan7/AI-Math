import google.generativeai as genai
import ast
import json
import hashlib
import os
from PIL import Image
from constants import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

# Simple cache dictionary to store recent results
CACHE = {}

def get_image_hash(img: Image) -> str:
    img_bytes = img.tobytes()
    return hashlib.md5(img_bytes).hexdigest()

def process_math(img: Image, dict_of_vars: dict):
    img_hash = get_image_hash(img)

    # Check cache first
    if img_hash in CACHE:
        print("Returning cached response for this image.")
        return CACHE[img_hash]

    dict_of_vars_str = json.dumps(dict_of_vars, ensure_ascii=False)
    prompt = (
        f"You have been given an image that may contain mathematical expressions, equations, or graphical problems. "
        f"Analyze the image and determine whether it contains a math problem or a general picture. "
        f"If it contains a math problem, solve it using PEMDAS, and return the answer in the following format:\n\n"
        f"1. For simple expressions like '2 + 2', return: [{{'expr': '2 + 2', 'result': 4}}].\n"
        f"2. For equations or variable assignments, return a comma-separated list of dicts, e.g., [{{'expr': 'x', 'result': 2, 'assign': True}}, ...].\n\n"
        f"If it is a general image, return a description in the format: [{{'expr': 'Image description', 'result': 'Detailed description here', 'assign': False}}].\n\n"
        f"Also, consider these user-assigned variables: {dict_of_vars_str}.\n\n"
        f"Do not use backticks or markdown formatting in your response. "
        f"Ensure that all keys and string values are properly quoted."
    )
    
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    try:
        response = model.generate_content([prompt, img])
        response_text = response.text.strip()
        
        answers = []
        try:
            answers = json.loads(response_text)  
        except json.JSONDecodeError:
            try:
                answers = ast.literal_eval(response_text) 
            except Exception as e:
                print(f"Error parsing response from Gemini API: {e}")
                answers = []

        # Ensure correct format
        for answer in answers:
            answer['assign'] = answer.get('assign', False)

        # Cache response
        CACHE[img_hash] = answers
        return answers

    except Exception as e:
        print(f"API error: {e}")
        return process_general(img)  

def process_general(img: Image) -> list:
    return [{
        "expr": "Image description",
        "result": "This image seems to be a general picture without mathematical content.",
        "assign": False
    }]

def analyze_image(img: Image, dict_of_vars: dict):
    print("Analyzing image...")

    # First try processing as a math problem
    result = process_math(img, dict_of_vars)

    # If empty response, fallback to general image processing
    if not result:
        print("No math detected, processing as a general image.")
        result = process_general(img)

    return result
